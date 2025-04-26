import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { X } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";

import { useRoomCreationModal } from "@/store/use-room-creation-modal.ts";
import { formatFileSize } from "@/utils/formatters.ts";
import { useImageCreator } from "@/hooks/use-image-creator.ts";
import { useOptimisticRemoveFile } from "@/hooks/useOptimisticFiles.ts";

export const MultipleImageUpload = () => {
  const { localImages, addLocalImage, removeLocalImage, initialValues } =
    useRoomCreationModal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const files =
    useQuery(
      api.images.list,
      initialValues.id ? { roomId: initialValues.id } : "skip",
    ) ?? [];

  const { createAndUploadImages } = useImageCreator(initialValues.id);
  const removeFile = useOptimisticRemoveFile(initialValues.id ?? "");

  const handleImageInputChanges = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (!initialValues.id) return;

    const newImages = Array.from(event.target.files || []);

    const uniqueImages = newImages.filter((newImage) => {
      const alreadyInLocal = localImages.some(
        (img) => img.name === newImage.name && img.size === newImage.size,
      );
      const alreadyInFiles = files.some(
        (file) => file.name === newImage.name && file.size === newImage.size,
      );

      return !alreadyInLocal && !alreadyInFiles;
    });

    if (uniqueImages.length === 0) return;

    uniqueImages.forEach((img) => addLocalImage(img));
    await createAndUploadImages(uniqueImages);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isUploading = (file: File) => {
    return !files.some((f) => f.name === file.name && f.size === file.size);
  };

  return (
    <div className="w-full flex flex-col">
      <Input
        ref={fileInputRef}
        multiple
        accept=".png,.jpg,.jpeg,.svg"
        type="file"
        onChange={handleImageInputChanges}
      />

      <div className="pl-5 mt-2 space-y-1">
        {localImages.map((file, index) => {
          const uploading = isUploading(file);

          return (
            <div key={index} className="flex justify-between items-center">
              <span className="truncate max-w-[80%] text-xs">
                {file.name}
                <span className="text-foreground/30">
                  {"  "}| {formatFileSize(file.size)}
                </span>
              </span>

              {uploading ? (
                <Spinner className="ml-2" size="sm" />
              ) : (
                <Button
                  isIconOnly
                  className="text-red-500 hover:text-red-700 border-none ml-2"
                  variant="bordered"
                  onPress={() => {
                    const uploaded = files.find(
                      (f) => f.name === file.name && f.size === file.size,
                    );

                    if (uploaded) {
                      removeFile({ ids: [uploaded._id] });
                    }
                    removeLocalImage(index);
                  }}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
