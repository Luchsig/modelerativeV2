"use client";

import { useQuery } from "convex/react";

import { api } from "../../../../../convex/_generated/api";

import EmptySearch from "@/pages/rooms/components/dashboard/empty-search.tsx";
import EmptyFavorites from "@/pages/rooms/components/dashboard/empty-favorites.tsx";
import EmptyRooms from "@/pages/rooms/components/dashboard/empty-rooms.tsx";
import { RoomCard } from "@/pages/rooms/components/dashboard/room-card.tsx";
import { RoomNewButton } from "@/pages/rooms/components/dashboard/room-new-button.tsx";

interface RoomListProps {
  organizationId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

const RoomList = ({ organizationId, query }: RoomListProps) => {
  const data = useQuery(api.rooms.get, {
    organizationId,
    ...query,
  });

  if (data === undefined) {
    return (
      <div>
        <h2 className={"text-3xl"}>
          {query.favorites ? "Favorite Rooms" : "Team Rooms"}
        </h2>
        <div
          className={
            "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10"
          }
        >
          <RoomNewButton disabled organizationId={organizationId} />
          <RoomCard.Skeleton />
          <RoomCard.Skeleton />
          <RoomCard.Skeleton />
          <RoomCard.Skeleton />
        </div>
      </div>
    );
  }

  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  if (!data?.length && query.favorites) {
    return <EmptyFavorites />;
  }

  if (!data?.length) {
    return <EmptyRooms />;
  }

  return (
    <div>
      <h2 className={"text-3xl"}>
        {query.favorites ? "Favorite Rooms" : "Team Rooms"}
      </h2>
      <div
        className={
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10"
        }
      >
        <RoomNewButton organizationId={organizationId} />
        {data?.map((room) => (
          <RoomCard
            key={room._id}
            authorId={room.authorId}
            authorName={room.authorName}
            createdAt={room._creationTime}
            id={room._id}
            imageUrl={room.imageUrl}
            isFavorite={room.isFavorite}
            organizationId={room.organizationId}
            title={room.title}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomList;
