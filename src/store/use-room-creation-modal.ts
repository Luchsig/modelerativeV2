import { create } from "zustand";
import {Id} from "../../convex/_generated/dataModel";

interface IRoomCreationState {
  isOpen: boolean;
  initialValues: {
    id: Id<"rooms">;
    title: string;
  };
  title: string;
  schema: string | null;
  localImages: File[];
  onOpen: (id: Id<"rooms">, title: string) => void;
  onClose: () => void;
  setTitle: (title: string) => void;
  setSchema: (schema: string | null) => void;
  addLocalImage: (file: File) => void;
  removeLocalImage: (index: number) => void;
  reset: () => void;
}

export const useRoomCreationModal = create<IRoomCreationState>((set) => ({
  isOpen: false,
  initialValues: { id: "" as Id<"rooms">, title: "" },
  title: "",
  schema: null,
  localImages: [],

  onOpen: (id, title) => {
    set({
      isOpen: true,
      initialValues: { id, title },
      title,
      schema: null,
      localImages: [],
    });
  },

  onClose: () => {
    set({ isOpen: false });
  },

  setTitle: (title) => set({ title }),
  setSchema: (schema) => set({ schema }),
  addLocalImage: (file) =>
    set((state) => ({ localImages: [...state.localImages, file] })),
  removeLocalImage: (index) =>
    set((state) => ({
      localImages: state.localImages.filter((_, i) => i !== index),
    })),
  reset: () =>
    set({
      isOpen: false,
      initialValues: { id: "" as Id<"rooms">, title: "" },
      title: "",
      schema: null,
      localImages: [],
    }),
}));