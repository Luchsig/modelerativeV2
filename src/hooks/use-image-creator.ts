import { useQuery } from "convex/react";
import { addToast } from "@heroui/toast";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { useOptimisticCreateImage } from "./useOptimisticFiles";
import { useImageUploader } from "./use-image-uploader.ts";

export function useImageCreator(roomId: Id<"rooms">) {
  const createImage = useOptimisticCreateImage(roomId);
  const { uploadImage } = useImageUploader();
  const config = useQuery(api.constants.getConfig);

  const createAndUploadImages = async (images: File[]) => {
    if (!config) return [];

    // Filter out files that are too large
    const validImages = [];

    for (const image of Array.from(images)) {
      if (image.size > config.maxFileSize) {
        addToast({
          title: "File Upload Failed",
          description: `File ${image.name} exceeds maximum size of ${config.maxFileSize / 1024 / 1024}MB`,
          variant: "bordered",
          color: "danger",
        });
        continue;
      }
      validImages.push(image);
    }

    if (validImages.length === 0) return [];

    const imageInfos = validImages.map((image) => ({
      name: image.name,
      size: image.size,
      type: image.type,
      roomId,
    }));

    const imageIds = await createImage({ images: imageInfos });

    // Start uploads for each file
    for (let i = 0; i < validImages.length; i++)
      void uploadImage(validImages[i], imageIds[i]);

    return imageIds;
  };

  return { createAndUploadImages };
}
