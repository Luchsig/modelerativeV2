"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { addToast } from "@heroui/toast";
import { useState } from "react";

import { useApiMutation } from "@/hooks/use-api-mutation.ts";
import { api } from "../../convex/_generated/api";

import { ConfirmationDialog } from "@/components/modal/confirmation-dialog.tsx";
import {useRenameModal} from "@/store/use-rename-modal.ts";

interface ActionProps {
  id: string;
  title: string;
  placement?: "left" | "right";
  children: React.ReactNode;
}

export const Action = ({ children, placement, id, title }: ActionProps) => {
  const { mutate } = useApiMutation(api.room.remove);
  const { onOpen } = useRenameModal();

  const [isOpen, setIsOpen] = useState(false);

  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/rooms/${id}`)
      .then(() => {
        addToast({
          title: "Link copied",
          variant: "bordered",
          color: "success",
        });
      })
      .catch(() =>
        addToast({
          title: "Link couldn't be copied",
          variant: "bordered",
          color: "warning",
        }),
      );
  };

  const onDelete = () => {
    mutate({ id })
      .then(() => {
        addToast({
          title: "Room deleted",
          variant: "bordered",
          color: "success",
        });
      })
      .catch(() =>
        addToast({
          title: "Room couldn't be deleted",
          variant: "bordered",
          color: "warning",
        }),
      );
  };

  return (
    <>
      <Dropdown placement={placement}>
        <DropdownTrigger asChild>{children}</DropdownTrigger>
        <DropdownMenu className={"w-60"}>
          <DropdownItem
            key="copyLink"
            className={"flex flex-row"}
            startContent={<Link2 className={"h-4 w-4 mr-2"} />}
            onPress={onCopyLink}
          >
            Copy Room Link
          </DropdownItem>
          <DropdownItem
            key="renameRoom"
            className={"flex flex-row"}
            startContent={<Pencil className={"h-4 w-4 mr-2"} />}
            onPress={() => {
              onOpen(id, title);
            }}
          >
            Rename room
          </DropdownItem>
          <DropdownItem
            key="deleteRoom"
            className="flex flex-row text-danger"
            startContent={<Trash2 className="h-4 w-4 mr-2" />}
            onPress={() => setIsOpen(true)}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <ConfirmationDialog
        description="Are you sure you want to proceed?"
        header="Confirm deletion"
        isOpen={isOpen}
        onConfirm={() => {
          onDelete();
          setIsOpen(false);
        }}
        onOpenChange={setIsOpen}
      />
    </>
  );
};
