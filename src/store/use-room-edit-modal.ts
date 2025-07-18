import { create } from "zustand";

const defaultValues = { id: "", title: "" };

interface IRoomEditModal {
  isOpen: boolean;
  initialValues: typeof defaultValues;
  onOpen: (id: string, title: string) => void;
  onClose: () => void;
}

export const useRoomEditModal = create<IRoomEditModal>((set) => ({
  isOpen: false,
  initialValues: defaultValues,
  onOpen: (id, title) => {
    set({ isOpen: true, initialValues: { id, title } });
  },
  onClose: () => {
    set({ isOpen: false, initialValues: defaultValues });
  },
}));
