import { useMemo } from "react";
import { ScrollShadow } from "@heroui/react";
import { useRoomStore } from "@/store/use-room-store.ts";
import { SchemaShape, ShapeType } from "@/types/canvas.ts";

const fallback: SchemaShape[] = [
  {
    id: "default-rect",
    shape: ShapeType.Rectangle,
    size: { width: 150, height: 120 },
    color: "gray",
    typeName: "Default Rect",
    typeDescription: "A basic rectangle",
    connectableTypes: "1",
    isTextEnabled: true,
  },
];

export const ComponentSelector = () => {
  const roomData = useRoomStore((state) => state.roomData);

  const parsedComponents: SchemaShape[] = useMemo(() => {
    try {
      const raw = roomData?.components;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw ?? fallback;

      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.shapes && Array.isArray(parsed.shapes)) {
        return parsed.shapes;
      } else {
        console.warn("Parsed components are invalid or not an array. Falling back to default.");
        return fallback;
      }
    } catch (e) {
      console.warn("Failed to parse roomData.components:", e);
      return fallback;
    }
  }, [roomData?.components]);

  return (
    <div className="absolute top-[50%] -translate-y-[50%] px-6 py-1 left-2 flex flex-col rounded-lg gap-y-4 bg-white dark:bg-black z-10 ring ring-gray-900/5 dark:ring-violet-500/30 shadow-xl h-3/4 overflow-y-auto">
      <ScrollShadow>
        <div className="flex flex-col gap-4 mt-4">
          {parsedComponents.map((shape: SchemaShape) => (
            <div
              key={shape.id ?? shape.typeName}
              draggable
              className="bg-zinc-400 dark:bg-gray-500 text-gray-900 dark:text-gray-200 text-center cursor-grab rounded-lg px-6 py-5 ring shadow-xl ring-gray-900/5"
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("application/schema-shape", JSON.stringify(shape));
              }}
            >
              {shape.typeName}
            </div>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
};