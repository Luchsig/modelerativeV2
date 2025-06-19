"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Download, Link2, Pencil, Trash2 } from "lucide-react";
import { addToast } from "@heroui/toast";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useConvex } from "convex/react";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { useApiMutation } from "@/hooks/use-api-mutation.ts";
import { ConfirmationDialog } from "@/components/modal/confirmation-dialog.tsx";
import { useRoomEditModal } from "@/store/use-room-edit-modal.ts";

interface ActionProps {
  id: string;
  title: string;
  placement?: "left" | "right";
  children: React.ReactNode;
}

export const Actions = ({ children, placement, id, title }: ActionProps) => {
  const { mutate } = useApiMutation(api.room.remove);
  const { onOpen } = useRoomEditModal();
  const [isOpen, setIsOpen] = useState(false);

  const convex = useConvex();

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

  const onExport = async () => {
    const zip = new JSZip();

    try {
      const roomData = await convex.query(api.room.get, {
        id: id as Id<"rooms">,
      });

      if (!roomData?.components) {
        throw new Error("No components found for export.");
      }

      const parsed = JSON.parse(roomData.components);
      const schemaJson = JSON.stringify({ shapes: parsed.shapes }, null, 2);

      zip.file("schema.json", schemaJson);

      const images = await convex.query(api.images.list, {
        roomId: id as Id<"rooms">,
      });

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (image.status === "uploaded" && image.url) {
          const response = await fetch(image.url);
          const blob = await response.blob();

          zip.file(image.name, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });

      saveAs(content, `${roomData.title}-export.zip`);
    } catch (error) {
      console.error("Export failed:", error);
      addToast({
        title: "Export failed",
        description: "Please try again later.",
        color: "warning",
      });
    }
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
            key="editRoom"
            className={"flex flex-row"}
            startContent={<Pencil className={"h-4 w-4 mr-2"} />}
            onPress={() => {
              onOpen(id, title);
            }}
          >
            Edit room
          </DropdownItem>
          <DropdownItem
            key="exportRoom"
            className="flex flex-row"
            startContent={<Download className="h-4 w-4 mr-2" />}
            onPress={onExport}
          >
            Export Room Configuration
          </DropdownItem>
          <DropdownItem
            key="deleteRoom"
            className="flex flex-row text-danger"
            startContent={<Trash2 className="h-4 w-4 mr-2" />}
            onPress={() => setIsOpen(true)}
          >
            Delete Room
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
