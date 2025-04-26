import { useMutation } from "convex/react";
import { addToast } from "@heroui/toast";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useImageUploader() {
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const startUpload = useMutation(api.images.startUpload);
  const updateUploadProgress = useMutation(api.images.updateUploadProgress);
  const completeUpload = useMutation(api.images.completeUpload);
  const setErrorState = useMutation(api.images.setErrorState);

  const getErrorMessage = (xhr: XMLHttpRequest): string => {
    try {
      const response = JSON.parse(xhr.responseText);

      if (response.message) return response.message;
      if (response.error) return response.error;
    } catch (e) {
      // If we can't parse the response, fall back to status text
    }

    return xhr.statusText || `Upload failed with status ${xhr.status}`;
  };

  const uploadImage = async (image: File, imageId: Id<"roomImages">) => {
    try {
      // First mark the image as uploading
      await startUpload({ id: imageId });

      // Then generate upload URL and upload the image
      const uploadUrl = await generateUploadUrl();

      // Create a promise that resolves when the upload is complete
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader(
          "Content-Type",
          image.type || "application/octet-stream",
        );

        let lastUpdate = 0;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const now = Date.now();

            if (now - lastUpdate >= 1000) {
              const progress = Math.round((event.loaded / event.total) * 100);

              void updateUploadProgress({ id: imageId, progress });
              lastUpdate = now;
            }
          }
        };

        xhr.onload = async () => {
          if (xhr.status === 200) {
            const { storageId } = JSON.parse(xhr.responseText);

            await completeUpload({ id: imageId, storageId });
            resolve(undefined);
          } else {
            reject(new Error(getErrorMessage(xhr)));
          }
        };

        xhr.onerror = () => {
          const message = getErrorMessage(xhr);

          reject(new Error(message || "Network error during upload"));
        };
        xhr.send(image);
      });
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      await setErrorState({ id: imageId, message: errorMessage });
      addToast({
        title: `Failed to upload ${image.name}`,
        description: errorMessage,
        variant: "bordered",
        color: "danger",
      });
    }
  };

  return { uploadImage: uploadImage };
}
