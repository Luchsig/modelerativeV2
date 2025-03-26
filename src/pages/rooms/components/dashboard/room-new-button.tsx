"use client";

import { cn } from "@heroui/theme";
import { Plus } from "lucide-react";
import { addToast } from "@heroui/toast";

import { api } from "../../../../../convex/_generated/api";

import { useApiMutation } from "@/hooks/use-api-mutation.ts";

interface RoomNewButtonProps {
  organizationId: string;
  disabled?: boolean;
}

export const RoomNewButton = ({
  organizationId,
  disabled = false,
}: RoomNewButtonProps) => {
  const { mutate, pending } = useApiMutation(api.room.create);
  const onClick = () => {
    mutate({ organizationId, title: "Untitled" })
      .then(() => {
        addToast({
          title: "Successfully Created New Room",
          description: "saving changes...",
          variant: "bordered",
          color: "success",
        });
      })
      .catch((error) => {
        // Extrahiere die eigentliche Fehlermeldung
        const errorMessage =
          error?.message?.split("Error: ")[1].split("!")[0] || "An unexpected error occurred";

        addToast({
          title: "Something went wrong",
          description: errorMessage,
          variant: "bordered",
          color: "warning",
        });
      });
  };

  return (
    <button
      className={cn(
        "col-span-1 aspect-[100/127] bg-purple-200 dark:bg-purple-600 rounded-2xl hover:bg-purple-300 dark:hover:bg-purple-500 justify-center items-center flex flex-col py-6",
        (pending || disabled) && "opacity-75 cursor-not-allowed",
      )}
      disabled={pending || disabled}
      onClick={onClick}
    >
      <Plus className={"h-12 w-12 text-foreground stroke-1"} />
      <p className={"text-xs text-foreground font-light"}>New Room</p>
    </button>
  );
};
