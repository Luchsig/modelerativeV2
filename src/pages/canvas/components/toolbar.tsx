import { Button } from "@heroui/button";
import { FC } from "react";

import { ThemeSwitch } from "@/components/theme-switch.tsx";
import {Download, Undo, Redo} from "lucide-react";

export interface ToolbarProps {
  zoomLevel?: number;
  onZoomChange?: (newZoomLevel: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
}

export const Toolbar: FC<ToolbarProps> = ({ onUndo, onRedo, onExport }) => {
  return (
    <div className="bg-zinc-400 dark:bg-stone-600 rounded-lg px-6 py-1 ring shadow-xl ring-gray-900/5 absolute top-2 right-1 z-10 flex">
      <div className="flex flex-row items-center gap-2 w-full">
        <ThemeSwitch />
        <Button
          isIconOnly
          aria-label="undo"
          className="text-gray-900 dark:text-gray-200"
          onPress={onUndo}
        >
          <Undo />
        </Button>
        <Button
          isIconOnly
          aria-label="redo"
          className="text-gray-900 dark:text-gray-200"
          onPress={onRedo}
        >
          <Redo />
        </Button>
        <Button
          isIconOnly
          aria-label="export"
          className="text-gray-900 dark:text-gray-200"
          onPress={onExport}
        >
          <Download />
        </Button>
      </div>
    </div>
  );
};
