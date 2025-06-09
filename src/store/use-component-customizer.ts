import { create } from "zustand";
import {Id} from "../../convex/_generated/dataModel";

const defaultValues: { id: Id<"rooms"> } = {
  id: "" as Id<"rooms">,
};
interface IComponentCustomizer {
  isOpen: boolean;
  initialValues: typeof defaultValues;
  onOpen: (id: Id<"rooms">) => void;
  onClose: () => void;
}

export const useComponentCustomizer = create<IComponentCustomizer>((set) => ({
  isOpen: false,
  initialValues: defaultValues,
  onOpen: (id: Id<"rooms">) => {
    set({ isOpen: true, initialValues: { id } });
  },
  onClose: () => {
    set({ isOpen: false, initialValues: defaultValues });
  },
}));
