// src/pages/canvas/components/nodes/resizable-template.tsx

import {
  FC,
  memo,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";
import {
  Group,
  Rect,
  Circle,
  Text,
  Transformer,
  Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";
import Konva from "konva";

import {
  Position,
  ShapeTemplateProps,
  ShapeType,
  AnchorName,
} from "@/types/canvas";
import { useRoomStore } from "@/store/use-room-store";
import Anchors from "@/pages/canvas/components/nodes/anchors";

const MIN_SIZE = 20;
const ANCHOR_SIZE = 12;

interface Props extends ShapeTemplateProps {
  isMultiSelected?: boolean;
  onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onAnchorMouseDown?: (
    shapeId: string,
    anchor: AnchorName,
    absolutePos: Position,
  ) => void;
}

const ResizableTemplate: FC<Props> = ({
  shapeData,
  isSelected,
  isMultiSelected,
  onSelect,
  onChange,
  onAnchorMouseDown,
  onDragStart,
  onDragMove,
  onDragEnd,
}) => {
  const [hoveredAnchor, setHoveredAnchor] = useState<AnchorName | null>(null);
  const { shape, position } = shapeData;
  const { size, color, imageProps, isTextEnabled, text = "" } = shape;

  const roomImages = useRoomStore((s) => s.roomImages);
  const imageUrl = useMemo(() => {
    if (!imageProps?.src) return "";
    const found = roomImages.find((ri) => ri.name === imageProps.src);

    return found ? found.url : imageProps.src;
  }, [imageProps?.src, roomImages]);
  const [img] = useImage(imageUrl || "");

  // … w, h, localAnchors, textBox, imagePos wie gehabt …
  const { w, h, localAnchors, textBox, imagePos } = useMemo(() => {
    // Breite/Höhe
    const w =
      shape.shape === ShapeType.Circle
        ? 2 * (size.radius ?? 25)
        : (size.width ?? 50);
    const h =
      shape.shape === ShapeType.Circle
        ? 2 * (size.radius ?? 25)
        : (size.height ?? 50);

    // Anker-Positionen
    const localAnchors =
      shape.shape === ShapeType.Circle
        ? [
            { name: AnchorName.Top, x: 0, y: -(size.radius ?? 25) },
            { name: AnchorName.Right, x: size.radius ?? 25, y: 0 },
            { name: AnchorName.Bottom, x: 0, y: size.radius ?? 25 },
            { name: AnchorName.Left, x: -(size.radius ?? 25), y: 0 },
          ]
        : [
            { name: AnchorName.Top, x: w / 2, y: 0 },
            { name: AnchorName.Right, x: w, y: h / 2 },
            { name: AnchorName.Bottom, x: w / 2, y: h },
            { name: AnchorName.Left, x: 0, y: h / 2 },
          ];

    // Text‐Box
    const textBox =
      shape.shape === ShapeType.Circle
        ? {
            x: -(size.radius ?? 25),
            y: -(size.radius ?? 25),
            width: 2 * (size.radius ?? 25),
            height: 2 * (size.radius ?? 25),
          }
        : { x: 5, y: 5, width: w - 10, height: h - 10 };

    // Image‐Pos
    const pad = 4;
    const iw = imageProps?.width ?? 30;
    const ih = imageProps?.height ?? 30;
    const positions = {
      TL: { x: pad, y: pad },
      TR: { x: w - iw - pad, y: pad },
      BL: { x: pad, y: h - ih - pad },
      BR: { x: w - iw - pad, y: h - ih - pad },
    } as const;
    const imagePos = positions[imageProps?.imagePosition || "TL"];

    return { w, h, localAnchors, textBox, imagePos };
  }, [
    shape.shape,
    size.radius,
    size.width,
    size.height,
    imageProps?.width,
    imageProps?.height,
    imageProps?.imagePosition,
  ]);

  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const rafRef = useRef<number>();

  // Intern: kontinuierliches Drag‐Update
  // Intern: Drag–End
  const handleInternalDragEnd = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    const g = groupRef.current!;

    onChange?.({ ...shapeData, position: { x: g.x(), y: g.y() } });
  }, [onChange, shapeData]);

  // Intern: Drag–Move
  const handleInternalDragMove = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      const g = groupRef.current!;

      onChange?.({ ...shapeData, position: { x: g.x(), y: g.y() } });
    });
  }, [onChange, shapeData]);

  // Transform End (Resize)
  const handleTransformEnd = useCallback(() => {
    const g = groupRef.current!;
    const scaleX = g.scaleX(),
      scaleY = g.scaleY();

    g.scaleX(1);
    g.scaleY(1);

    const newSize =
      shape.shape === ShapeType.Circle
        ? {
            radius: (size.radius ?? 25) * scaleX,
            width: 2 * (size.radius ?? 25) * scaleX,
            height: 2 * (size.radius ?? 25) * scaleY,
          }
        : {
            width: (size.width ?? 50) * scaleX,
            height: (size.height ?? 50) * scaleY,
            radius: size.radius,
          };

    onChange?.({
      ...shapeData,
      position: { x: g.x(), y: g.y() },
      shape: { ...shape, size: newSize },
    });
  }, [onChange, shapeData, shape, size.radius, size.width, size.height]);

  // Transformer an Group binden
  useLayoutEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, w, h]);

  // Cleanup
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <>
      <Group
        ref={groupRef}
        draggable
        id={shapeData.id}
        x={position.x}
        y={position.y}
        onClick={() => onSelect?.()}
        onDragEnd={(e) => {
          if (!isMultiSelected) {
            handleInternalDragEnd();
            onDragEnd?.(e);
          } else {
            onDragEnd?.(e);
          }
        }}
        onDragMove={(e) => {
          if (!isMultiSelected) {
            handleInternalDragMove();
            onDragMove?.(e);
          } else {
            onDragMove?.(e);
          }
        }}
        onDragStart={(e) => {
          if (!isMultiSelected) {
            onSelect?.();
            onDragStart?.(e);
          }
        }}
        onTap={() => onSelect?.()}
      >
        {/* Shape */}
        {shape.shape === ShapeType.Rectangle && (
          <Rect
            cornerRadius={8}
            fill={color}
            height={h}
            stroke={"#000"}
            strokeWidth={2}
            width={w}
          />
        )}
        {shape.shape === ShapeType.Circle && (
          <Circle
            fill={color}
            radius={size.radius ?? 25}
            stroke={"#000"}
            strokeWidth={2}
          />
        )}
        {shape.shape === ShapeType.Custom && img && (
          <KonvaImage height={h} image={img} width={w} />
        )}

        {/* Optional Icon */}
        {img &&
          imageProps?.imagePosition &&
          shape.shape !== ShapeType.Custom && (
            <KonvaImage
              height={imageProps.height}
              image={img}
              width={imageProps.width}
              x={imagePos.x}
              y={imagePos.y}
            />
          )}

        {/* Text */}
        {isTextEnabled && (
          <Text
            {...textBox}
            align="center"
            text={text}
            verticalAlign="middle"
          />
        )}

        {/* Anchors */}
        {isSelected && !isMultiSelected && (
          <Anchors
            anchors={localAnchors}
            hovered={hoveredAnchor}
            offset={position}
            size={ANCHOR_SIZE}
            onMouseDown={(name, abs) =>
              onAnchorMouseDown?.(shapeData.id, name, abs)
            }
            onMouseEnter={(name) => setHoveredAnchor(name)}
            onMouseLeave={() => setHoveredAnchor(null)}
          />
        )}
      </Group>

      {/* Resize‐Transformer */}
      {isSelected && !isMultiSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < MIN_SIZE || newBox.height < MIN_SIZE
              ? oldBox
              : newBox
          }
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          rotateEnabled={false}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
};

export default memo(ResizableTemplate);
