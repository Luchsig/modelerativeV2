import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  rooms: defineTable({
    title: v.string(),
    organizationId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
    stateNodes: v.string(),
    stateEdges: v.string(),
    components: v.string(),
  })
    .index("by_organizationId", ["organizationId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["organizationId"],
    }),

  userFavorites: defineTable({
    organizationId: v.string(),
    userId: v.string(),
    roomId: v.id("rooms"),
  })
    .index("by_room", ["roomId"])
    .index("by_user_organization", ["userId", "organizationId"])
    .index("by_user_room", ["userId", "roomId"])
    .index("by_user_room_organization", ["userId", "roomId", "organizationId"]),

  roomImages: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    size: v.number(),
    type: v.string(),
    uploadState: v.union(
      v.object({
        kind: v.literal("created"),
      }),
      v.object({
        kind: v.literal("uploading"),
        progress: v.number(),
        lastProgressAt: v.number(),
        timeoutJobId: v.id("_scheduled_functions"),
      }),
      v.object({
        kind: v.literal("uploaded"),
        storageId: v.id("_storage"),
        url: v.string(),
      }),
      v.object({
        kind: v.literal("errored"),
        message: v.string(),
      }),
    ),
  })
    .index("by_room", ["roomId"])
    .index("by_image", ["name"])
    .index("by_room_image", ["roomId", "name"]),
});
