import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";

import { query } from "./_generated/server";

export const get = query({
  args: {
    organizationId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (args.favorites) {
      const favoritedRooms = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_organization", (q) =>
          q
            .eq("userId", identity.subject)
            .eq("organizationId", args.organizationId),
        )
        .order("desc")
        .collect();

      const ids = favoritedRooms.map((room) => room.roomId);

      const rooms = await getAllOrThrow(ctx.db, ids);

      return rooms.map((room) => ({
        ...room,
        isFavorite: true,
      }));
    }

    const title = args.search as string;
    let rooms = [];

    if (title) {
      rooms = await ctx.db
        .query("rooms")
        .withSearchIndex("search_title", (q) =>
          q.search("title", title).eq("organizationId", args.organizationId),
        )
        .collect();
    } else {
      rooms = await ctx.db
        .query("rooms")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .order("desc")
        .collect();
    }

    const roomsWithFavoriteRelation = rooms.map((room) => {
      return ctx.db
        .query("userFavorites")
        .withIndex("by_user_room", (q) =>
          q.eq("userId", identity.subject).eq("roomId", room._id),
        )
        .unique()
        .then((favorite) => {
          return { ...room, isFavorite: !!favorite };
        });
    });

    const roomsWithFavorite = Promise.all(roomsWithFavoriteRelation);

    return roomsWithFavorite;
  },
});
