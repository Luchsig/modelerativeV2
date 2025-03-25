import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  rooms: defineTable({
    title: v.string(),
    organizationId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
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
});
