import { useMutation, useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export function useOptimisticCreateImage(roomId: Id<"rooms">) {
  return useMutation(api.images.create).withOptimisticUpdate(
    (localStore, args) => {
      const existingImages = localStore.getQuery(api.images.list, { roomId });

      if (existingImages === undefined) return;

      const optimisticImages: Doc<"roomImages">[] = args.images.map(
        (image) => ({
          _id: `${Math.random()}` as Id<"roomImages">,
          _creationTime: Date.now(),
          uploadState: {
            kind: "created" as const,
          },
          ...image,
        }),
      );

      localStore.setQuery(api.images.list, { roomId }, [
        ...existingImages,
        ...optimisticImages,
      ]);
    },
  );
}

export function useOptimisticRemoveFile(roomId: Id<"rooms">) {
  return useMutation(api.images.remove).withOptimisticUpdate(
    (localStore, args) => {
      const existingImages = localStore.getQuery(api.images.list, { roomId });

      if (existingImages === undefined) return;

      const updatedImages = existingImages.filter(
        (image) => !args.ids.includes(image._id),
      );

      localStore.setQuery(api.images.list, { roomId }, updatedImages);
    },
  );
}

export function useImages(roomId: Id<"rooms">) {
  return useQuery(api.images.list, { roomId }) ?? [];
}
