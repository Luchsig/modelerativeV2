import { useMemo } from "react";
import { ScrollShadow, Tooltip } from "@heroui/react";
import { Plus } from "lucide-react";
import { Layer, Stage } from "react-konva";

import { useRoomStore } from "@/store/use-room-store.ts";
import { SchemaShape, ShapeType } from "@/types/canvas.ts";
import SidebarTemplate from "@/pages/canvas/components/nodes/sidebar-template.tsx";
import { useComponentCustomizer } from "@/store/use-component-customizer.ts";

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
  const { onOpen } = useComponentCustomizer();
  const previewStageSize = { width: 120, height: 80 };

  const parsedComponents: SchemaShape[] = useMemo(() => {
    try {
      const raw = roomData?.components;
      const parsed =
        typeof raw === "string" ? JSON.parse(raw) : (raw ?? fallback);

      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.shapes && Array.isArray(parsed.shapes)) {
        return parsed.shapes;
      } else {
        console.warn(
          "Parsed components are invalid or not an array. Falling back to default.",
        );

        return fallback;
      }
    } catch (e) {
      console.warn("Failed to parse roomData.components:", e);

      return fallback;
    }
  }, [roomData?.components]);

  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col rounded-lg gap-y-1 bg-white p-2 dark:bg-black z-10 ring ring-gray-900/5 dark:ring-violet-500/30 shadow-xl h-3/4 overflow-y-auto">
      <ScrollShadow>
        <div className="flex flex-col gap-1 mt-2">
          {parsedComponents.map((shape: SchemaShape) => (
            // eslint-disable-next-line react/jsx-key
            <Tooltip
              content={
                <div className="max-w-xs">
                  <div className="font-bold">{shape.typeName}</div>
                  <div className="mt-1 text-sm">{shape.typeDescription}</div>
                </div>
              }
              placement="right"
            >
              <div
                key={shape.id ?? shape.typeName}
                draggable
                className="flex flex-col justify-center bg-white border-purple-100 border shadow cursor-grab rounded-lg ring-gray-900/5"
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData(
                    "application/schema-shape",
                    JSON.stringify(shape),
                  );
                }}
              >
                <Stage {...previewStageSize}>
                  <Layer>
                    <SidebarTemplate {...shape} />
                  </Layer>
                </Stage>
              </div>
            </Tooltip>
          ))}
          {roomData && (
            <Tooltip content="Add Component" placement="bottom">
              <button
                aria-label="Add Component"
                className="flex items-center justify-center bg-violet-500 hover:bg-violet-600 border-2 border-purple-300 text-white rounded-lg shadow px-2 py-1 transition-colors"
                onClick={() => onOpen(roomData._id)}
              >
                <Plus className="w-5 h-5" />
              </button>
            </Tooltip>
          )}
        </div>
      </ScrollShadow>
    </div>
  );
};
