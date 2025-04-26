import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const images = [
  "/placeholder/Placeholder_1.svg",
  "/placeholder/Placeholder_2.svg",
  "/placeholder/Placeholder_3.svg",
  "/placeholder/Placeholder_4.svg",
  "/placeholder/Placeholder_5.svg",
  "/placeholder/Placeholder_6.svg",
  "/placeholder/Placeholder_7.svg",
  "/placeholder/Placeholder_8.svg",
  "/placeholder/Placeholder_9.svg",
  "/placeholder/Placeholder_10.png",
];

const maxRoomsPerOrganization =
  Number(process.env.MAX_ROOMS_PER_ORGANIZATION) || 10;

export const create = mutation({
  args: {
    organizationId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const roomsCount = await ctx.db
      .query("rooms")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .collect();

    if (roomsCount.length >= maxRoomsPerOrganization) {
      throw new Error(
        "You have reached the maximum number of rooms for this organization!",
      );
    }

    const randImg = images[Math.floor(Math.random() * images.length)];

    return await ctx.db.insert("rooms", {
      title: args.title,
      organizationId: args.organizationId,
      authorId: identity.subject,
      authorName: identity.name!,
      imageUrl: randImg,
      stateNodes: "",
      stateEdges: "",
      components: "",
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", userId).eq("roomId", args.id),
      )
      .unique();

    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
    }

    const existingImages = await ctx.db
      .query("roomImages")
      .withIndex("by_room", (q) => q.eq("roomId", args.id))
      .collect();

    if (existingImages) {
      for (const image of existingImages) {
        if (!(image.uploadState.kind === "uploaded")) {
          continue;
        }
        await ctx.storage.delete(image.uploadState.storageId);
        await ctx.db.delete(image._id);
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("rooms"),
    title: v.string(),
    components: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }
    const title = args.title.trim();

    if (!title) {
      throw new Error("Title cannot be empty");
    }
    if (title.length > 60) {
      throw new Error("Title cannot be longer than 60 characters");
    }

    if (args.components)
      return await ctx.db.patch(args.id, {
        title: args.title,
        components: args.components,
      });

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const favorite = mutation({
  args: { id: v.id("rooms"), organizationId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const room = await ctx.db.get(args.id);

    if (!room) {
      throw new Error("Room not found");
    }

    const userId = identity.subject;

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_room_organization", (q) =>
        q
          .eq("userId", userId)
          .eq("roomId", room._id)
          .eq("organizationId", args.organizationId),
      )
      .unique();

    if (existingFavorite) {
      throw new Error("Room already favorited!");
    }

    await ctx.db.insert("userFavorites", {
      organizationId: args.organizationId,
      userId: userId,
      roomId: room._id,
    });

    return room;
  },
});

export const unfavorite = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const room = await ctx.db.get(args.id);

    if (!room) {
      throw new Error("Room not found");
    }

    const userId = identity.subject;

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", userId).eq("roomId", room._id),
      )
      .unique();

    if (!existingFavorite) {
      throw new Error("Favorited room not found!");
    }

    await ctx.db.delete(existingFavorite._id);

    return room;
  },
});

export const get = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const room = await ctx.db.get(args.id);

    if (!room) {
      throw new Error("Room not found");
    }

    return room;
  },
});

export const updateStates = mutation({
  args: {
    id: v.id("rooms"),
    stateNodes: v.string(),
    stateEdges: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.patch(args.id, {
      stateNodes: args.stateNodes,
      stateEdges: args.stateEdges,
    });
  },
});

