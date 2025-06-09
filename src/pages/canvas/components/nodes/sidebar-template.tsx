// src/pages/canvas/components/nodes/resizable-template.tsx

import { FC, useRef, useMemo, memo } from "react";
import { Group, Rect, Circle, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

import { ShapeType, SchemaShape } from "@/types/canvas";
import { useRoomStore } from "@/store/use-room-store";

type SidebarTemplateProps = SchemaShape & {
  miniature?: boolean;
  previewStageSize?: { width: number; height: number };
};

const SidebarTemplate: FC<SidebarTemplateProps> = ({
  id,
  shape,
  imageProps,
  size,
  color,
  miniature = true,
  previewStageSize = { width: 120, height: 80 },
}) => {
  const roomImages = useRoomStore((s) => s.roomImages);
  const factor = miniature ? 0.6 : 1;
  const factorCircle = miniature ? 2 : 1;

  const imageUrl = useMemo(() => {
    if (!imageProps?.src) return "";
    const found = roomImages.find((ri) => ri.name === imageProps.src);

    return found ? found.url : imageProps.src;
  }, [imageProps?.src, roomImages]);
  const [img] = useImage(imageUrl || "");

  // … w, h, imagePos
  const { w, h, imagePos, offsetX, offsetY } = useMemo(() => {
    // Breite/Höhe
    const w =
      shape === ShapeType.Circle
        ? 2 * (size.radius ?? 25) * factor
        : (size.width ?? 50) * factor;
    const h =
      shape === ShapeType.Circle
        ? 2 * (size.radius ?? 25) * factor
        : (size.height ?? 50) * factor;

    const offsetX = (previewStageSize.width - w) / 2;
    const offsetY = (previewStageSize.height - h) / 2;

    // Image‐Pos
    const pad = 4 * factor;
    const iw = (imageProps?.width ?? 30) * factor;
    const ih = (imageProps?.height ?? 30) * factor;
    const positions = {
      TL: { x: pad, y: pad },
      TR: { x: w - iw - pad, y: pad },
      BL: { x: pad, y: h - ih - pad },
      BR: { x: w - iw - pad, y: h - ih - pad },
    } as const;
    const imagePos = positions[imageProps?.imagePosition || "TL"];

    return { w, h, imagePos, offsetX, offsetY };
  }, [
    shape,
    size.radius,
    size.width,
    size.height,
    imageProps?.width,
    imageProps?.height,
    imageProps?.imagePosition,
  ]);

  const groupRef = useRef<Konva.Group>(null);

  return (
    <Group ref={groupRef} draggable={false} id={id} x={offsetX} y={offsetY}>
      {shape === ShapeType.Rectangle && (
        <Rect cornerRadius={8} fill={color} height={h} width={w} />
      )}
      {shape === ShapeType.Circle && (
        <Circle
          fill={color}
          radius={(size.radius ?? 12) / factorCircle}
          x={w / 2}
          y={h / 2}
        />
      )}
      {shape === ShapeType.Custom && img && (
        <KonvaImage height={h} image={img} width={w} />
      )}

      {/* Optional Icon */}
      {img && imageProps?.imagePosition && shape !== ShapeType.Custom && (
        <KonvaImage
          height={(imageProps?.height ?? 30) * factor}
          image={img}
          width={(imageProps?.width ?? 30) * factor}
          x={imagePos.x}
          y={imagePos.y}
        />
      )}
    </Group>
  );
};

export default memo(SidebarTemplate);
