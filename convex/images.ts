import {ConvexError, v} from "convex/values";

import {internalMutation, mutation, query} from "./_generated/server";
import {MAX_FILE_SIZE, UPLOAD_TIMEOUT_MS} from "./constants.ts";
import {Doc} from "./_generated/dataModel";
import {internal} from "./_generated/api";

export const list = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const images = await ctx.db
      .query("roomImages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return await Promise.all(
      images.map(async (r) => {
        // falls bereits hochgeladen, hast du r.uploadState.url direkt
        if (r.uploadState.kind === "uploaded") {
          return {
            id: r._id,
            name: r.name,
            size: r.size,
            type: r.type,
            url: r.uploadState.url,
            status: "uploaded" as const,
          };
        }
        // oder, falls du nur eine storageId hast:
        if (r.uploadState.kind === "uploading") {
          return {
            id: r._id,
            name: r.name,
            size: r.size,
            type: r.type,
            url: undefined,
            status: "uploading" as const,
            progress: r.uploadState.progress,
          };
        }
        if (r.uploadState.kind === "errored") {
          return {
            id: r._id,
            name: r.name,
            size: r.size,
            type: r.type,
            url: undefined,
            status: "errored" as const,
            message: r.uploadState.message,
          };
        }

        // Fall‐Back: r.uploadState.kind === "created" oder sonst
        return {
          id: r._id,
          name: r.name,
          size: r.size,
          type: r.type,
          url: undefined,
          status: r.uploadState.kind,
        };
      }),
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    images: v.array(
      v.object({
        roomId: v.id("rooms"),
        name: v.string(),
        type: v.string(),
        size: v.number(),
      }),
    ),
  },
  handler: async (ctx, { images }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const imageIds = [];

    for (const image of images) {
      if (image.size > MAX_FILE_SIZE)
        throw new ConvexError(
          `File ${image.name} exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        );

      const id = await ctx.db.insert("roomImages", {
        ...image,
        uploadState: {
          kind: "created",
        },
      });

      imageIds.push(id);
    }

    return imageIds;
  },
});

export const remove = mutation({
  args: { ids: v.array(v.id("roomImages")) },
  handler: async (ctx, { ids }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    for (const id of ids) {
      const image = await ctx.db.get(id);

      if (!image) throw new ConvexError(`File ${id} not found`);

      // Cancel timeout if image is uploading
      if (image.uploadState.kind === "uploading")
        await ctx.scheduler.cancel(image.uploadState.timeoutJobId);

      // Delete from storage if image is uploaded
      if (image.uploadState.kind === "uploaded")
        await ctx.storage.delete(image.uploadState.storageId);

      await ctx.db.delete(id);
    }
  },
});

export const startUpload = mutation({
  args: {
    id: v.id("roomImages"),
  },
  handler: async (ctx, { id }): Promise<Doc<"roomImages">> => {
    const image = await ctx.db.get(id);

    if (!image) throw new ConvexError("File not found");

    // Schedule initial timeout
    const timeoutJobId = await ctx.scheduler.runAfter(
      UPLOAD_TIMEOUT_MS,
      internal.images.handleUploadTimeout,
      {
        imageId: id,
      },
    );

    await ctx.db.patch(id, {
      uploadState: {
        kind: "uploading" as const,
        progress: 0,
        lastProgressAt: Date.now(),
        timeoutJobId,
      },
    });

    const updated = await ctx.db.get(id);

    if (!updated) throw new ConvexError("Failed to update image");

    return updated;
  },
});

export const updateUploadProgress = mutation({
  args: {
    id: v.id("roomImages"),
    progress: v.number(),
  },
  handler: async (ctx, { id, progress }): Promise<Doc<"roomImages">> => {
    const images = await ctx.db.get(id);

    if (!images) throw new ConvexError("File not found");
    if (images.uploadState.kind !== "uploading")
      throw new ConvexError("File is not in uploading state");

    // Cancel existing timeout
    await ctx.scheduler.cancel(images.uploadState.timeoutJobId);

    // Schedule new timeout
    const timeoutJobId = await ctx.scheduler.runAfter(
      UPLOAD_TIMEOUT_MS,
      internal.images.handleUploadTimeout,
      {
        imageId: id,
      },
    );

    await ctx.db.patch(id, {
      uploadState: {
        kind: "uploading" as const,
        progress,
        lastProgressAt: Date.now(),
        timeoutJobId,
      },
    });

    const updated = await ctx.db.get(id);

    if (!updated) throw new ConvexError("Failed to update image");

    return updated;
  },
});

export const completeUpload = mutation({
  args: {
    id: v.id("roomImages"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { id, storageId }) => {
    const images = await ctx.db.get(id);

    if (!images) throw new ConvexError("File not found");
    if (images.uploadState.kind !== "uploading")
      throw new ConvexError("File is not in uploading state");

    // Cancel timeout since upload is complete
    await ctx.scheduler.cancel(images.uploadState.timeoutJobId);

    const url = await ctx.storage.getUrl(storageId);

    if (!url) throw new ConvexError("Failed to get download URL");

    return await ctx.db.patch(id, {
      uploadState: {
        kind: "uploaded",
        storageId,
        url,
      },
    });
  },
});

export const setErrorState = mutation({
  args: {
    id: v.id("roomImages"),
    message: v.string(),
  },
  handler: async (ctx, { id, message }) => {
    const image = await ctx.db.get(id);

    if (!image) throw new ConvexError("File not found");

    // Cancel timeout if image was uploading
    if (image.uploadState.kind === "uploading") {
      await ctx.scheduler.cancel(image.uploadState.timeoutJobId);
    }

    return await ctx.db.patch(id, {
      uploadState: {
        kind: "errored",
        message,
      },
    });
  },
});

// Internal mutation to handle upload timeouts
export const handleUploadTimeout = internalMutation({
  args: {
    imageId: v.id("roomImages"),
  },
  handler: async (ctx, { imageId }) => {
    const image = await ctx.db.get(imageId);

    if (!image) return; // File was deleted
    if (image.uploadState.kind !== "uploading") return; // File is no longer uploading

    // Mark the image as errored
    await ctx.db.patch(imageId, {
      uploadState: {
        kind: "errored",
        message: `Upload timed out - no progress for ${UPLOAD_TIMEOUT_MS / 1000} seconds`,
      },
    });
  },
});

export const getImage = query({
  args: {
    roomId: v.id("rooms"),
    imageName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const image = await ctx.db
      .query("roomImages")
      .withIndex("by_room_image", (q) =>
        q.eq("roomId", args.roomId).eq("name", args.imageName),
      )
      .collect();

    return image;
  },
});
