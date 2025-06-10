"use client";
import { Link } from "@heroui/link";
import { Divider, Skeleton } from "@heroui/react";
import { Button } from "@heroui/button";
import { Pencil } from "lucide-react";

import { Logo } from "@/components/icons.tsx";
import { useRoomEditModal } from "@/store/use-room-edit-modal.ts";
import { useRoomStore } from "@/store/use-room-store.ts";

export const InfoBar = () => {
  const roomData = useRoomStore((state) => state.roomData);
  const { onOpen } = useRoomEditModal();

  if (!roomData) return InfoSkeleton();

  return (
    <div className="absolute top-2 left-1 bg-white dark:bg-black z-10 rounded-lg px-6 py-1 ring ring-gray-900/5 dark:ring-purple-700/30 shadow-xl flex flex-row align-items-center justify-center space-x-4">
      <Link
        className={"w-full flex justify-center space-x-2"}
        color={"foreground"}
        href={"/rooms"}
      >
        <Logo />
        <span className="font-bold text-inherit pl-1">MODELERATIVE</span>
      </Link>
      <Divider className={"my-4"} orientation="vertical" />
      <div className="flex flex-row items-center space-x-2">
        <p className="text-foreground whitespace-normal break-words min-w-[20ch]">
          {roomData.title}
        </p>
        <Button
          isIconOnly
          aria-label="Edit"
          className={"border-none"}
          color="secondary"
          variant="bordered"
          onPress={() => {
            onOpen(roomData._id, roomData.title);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const InfoSkeleton = () => {
  return <Skeleton className="absolute top-2 left-1 h-16 w-72" />;
};
