import { Button } from "@heroui/button";
import { Undo, Redo } from "lucide-react";

// import { ThemeSwitch } from "@/components/theme-switch.tsx";
import { useRoomStore } from "@/store/use-room-store.ts";

export const Toolbar = () => {
  const undo = useRoomStore((s) => s.undo);
  const redo = useRoomStore((s) => s.redo);

  return (
    <div className="absolute top-2 right-2 z-10 flex rounded-lg px-5 py-2 bg-white dark:bg-black  ring shadow-xl ring-gray-900/5 dark:ring-purple-700/30">
      <div className="flex flex-row items-center space-x-2.5 w-full">
        {/*<ThemeSwitch />*/}
        <Button
          isIconOnly
          className={"bg-none border-none"}
          variant="bordered"
          onPress={undo}
        >
          <Undo />
        </Button>
        <Button
          isIconOnly
          className={"bg-none border-none"}
          variant="bordered"
          onPress={redo}
        >
          <Redo />
        </Button>
      </div>
    </div>
  );
};
