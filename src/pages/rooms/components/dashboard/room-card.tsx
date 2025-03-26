"use client";

import { Link } from "@heroui/link";
import { Image } from "@heroui/image";
import { useAuth } from "@clerk/clerk-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardFooter, Skeleton } from "@heroui/react";
import { Button } from "@heroui/button";
import { MoreHorizontal, Star } from "lucide-react";
import { cn } from "@heroui/theme";
import { addToast } from "@heroui/toast";

import { useApiMutation } from "@/hooks/use-api-mutation.ts";
import { api } from "../../../../../convex/_generated/api";

import { Action } from "@/components/actions.tsx";

interface RoomCardProps {
  key: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  id: string;
  imageUrl: string;
  isFavorite: boolean;
  organizationId: string;
  title: string;
}

export const RoomCard = ({
  key,
  authorId,
  authorName,
  createdAt,
  id,
  imageUrl,
  isFavorite,
  organizationId,
  title,
}: RoomCardProps) => {
  const { userId } = useAuth();
  const authorLabel = userId === authorId ? "You" : authorName;
  const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });
  const disabled = false;

  const { mutate: onFavorite, pending: onPendingFavorite } = useApiMutation(
    api.room.favorite,
  );
  const { mutate: onUnfavorite, pending: onPendingUnfavorite } = useApiMutation(
    api.room.unfavorite,
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      onUnfavorite({ id }).catch(() =>
        addToast({
          title: "Failed to unfavorite room",
          variant: "bordered",
          color: "warning",
        }),
      );
    } else {
      onFavorite({ id, organizationId }).catch(() =>
        addToast({
          title: "Failed to favorite room",
          variant: "bordered",
          color: "warning",
        }),
      );
    }
  };

  return (
    <Link href={`/rooms/${id}`}>
      <Card className="group aspect-[100/127] bg-purple-200 dark:bg-purple-600 hover:bg-purple-300 dark:hover:bg-purple-500">
        <div
          className={
            "flex flex-col align-middle w-full h-[calc(100%-20px)] justify-center"
          }
        >
          <Image
            isBlurred
            isZoomed
            alt={title}
            className="object-cover p-5 align-middle"
            src={imageUrl}
          />
        </div>
        <Action id={id} placement={"right"} title={title}>
          <Button
            isIconOnly
            className={
              "absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none bg-transparent"
            }
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <MoreHorizontal
              className={
                "text-foreground opacity-75 hover:opacity-100 transition-opacity"
              }
            />
          </Button>
        </Action>
        <CardFooter className="items-start bg-purple-300/80 dark:bg-purple-800/80 border-white/20 overflow-hidden py-1 absolute left-0 bottom-0 w-full z-10 flex flex-col">
          <p className="text-tiny text-foreground truncate max-w-[calc(100%-20px)] flex-1 pt-1">
            {title}
          </p>
          <p className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-foreground-600">
            {authorLabel}, {createdAtLabel}
          </p>
          <Button
            isIconOnly
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-3 text-foreground-600 bg-transparent hover:text-purple-800 dark:hover:text-pink-300",
              disabled && "cursor-not-allowed opacity-75",
            )}
            disabled={onPendingFavorite || onPendingUnfavorite}
            onPress={() => toggleFavorite()}
          >
          <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

RoomCard.Skeleton = function RoomCardSkeleton() {
  return (
    <Card className="aspect-[100/127] bg-purple-200 dark:bg-purple-600">
      <Skeleton className={"h-full w-full cursor-not-allowed"} />
    </Card>
  );
};
