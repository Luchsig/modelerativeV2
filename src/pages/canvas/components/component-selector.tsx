import { useRef, useState } from "react";
import { Input } from "@heroui/input";

import { ShapeData } from "@/pages/canvas/components/resizable-template.tsx";
import { Logo } from "@/components/icons.tsx";
import {Link} from "@heroui/link";

export const ComponentSelector: React.FC = () => {
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);

          setShapes(json.shapes);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-zinc-400 dark:bg-stone-600 rounded-lg px-6 py-5 absolute items-center top-2 bottom-2 left-2 z-10 flex flex-col w-60">
      <Link
        className={"w-full flex flex-col justify-center space-y-5"}
        color={"foreground"}
        href={"/rooms"}
      >
        <Logo size={72}/>
        <p className="font-bold text-inherit">MODELERATIVE</p>
      </Link>
      <hr className="w-40 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-10 dark:bg-zinc-500" />
      <h4 className="text-lg font-bold mb-4 text-gray-950 dark:text-gray-100">
        Components
      </h4>
      <div className={"flex flex-col gap-4 mt-4"}>
        {shapes.map((shape) => (
          <>
            <div
              key={shape.typeName}
              draggable
              className="bg-zinc-400 dark:bg-gray-500 text-gray-900 dark:text-gray-200 text-center cursor-grab rounded-lg px-6 py-5 ring shadow-xl ring-gray-900/5"
              onDragStart={(e) =>
                e.dataTransfer.setData("component", JSON.stringify(shape))
              }
            >
              {shape.typeName}
            </div>
          </>
        ))}
      </div>
      <hr className="w-40 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-10 dark:bg-zinc-500" />

      <h4 className="text-lg font-bold mb-4 text-gray-950 dark:text-gray-100">
        Upload Definitions
      </h4>
      <Input
        ref={fileInputRef}
        accept=".json"
        type="file"
        onChange={handleFileUpload}
      />
    </div>
  );
};
