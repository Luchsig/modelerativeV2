// src/pages/layout/components/layout/resizable-template.tsx

import { FC, Fragment, memo, useEffect, useRef, useState } from "react";
import {
  Group,
  Rect,
  Circle,
  Text,
  Transformer,
  Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";
import { Html } from "react-konva-utils";
import { Textarea } from "@heroui/input";
import { Plus } from "lucide-react";

import { Position, ShapeTemplateProps, ShapeType } from "@/types/canvas.ts";
import { useRoomStore } from "@/store/use-room-store.ts";

type AnchorName = "top" | "right" | "bottom" | "left";

interface Props extends ShapeTemplateProps {
  onAnchorMouseDown?: (
    shapeId: string,
    anchor: AnchorName,
    absolutePos: Position,
  ) => void;
  onAnchorMouseUp?: (
    shapeId: string,
    anchor: AnchorName,
    absolutePos: Position,
  ) => void;
}

const ResizableTemplate: FC<Props> = ({
  shapeData,
  isSelected,
  onSelect,
  onChange,
  onAnchorMouseDown,
  onAnchorMouseUp,
}) => {
  const { shape, position } = shapeData;
  const {
    size,
    color,
    imageProps,
    isTextEnabled,
    text: initialText = "",
  } = shape;

  // Room images
  const roomImages = useRoomStore((s) => s.roomImages);
  const imageUrl =
    imageProps?.src && roomImages.length
      ? (roomImages.find((ri) => ri.name === imageProps.src)?.url ?? "")
      : (imageProps?.src ?? "");
  const [img] = useImage(imageUrl);

  const [isRenaming, setIsRenaming] = useState(false);
  const [text, setText] = useState(initialText);
  const [hoveredAnchor, setHoveredAnchor] = useState<AnchorName | null>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const MIN_SIZE = 20;
  const ANCHOR_SIZE = 12;

  // Dimensions
  const w =
    shape.shape === ShapeType.Circle
      ? 2 * (size.radius ?? 25)
      : (size.width ?? 50);
  const h =
    shape.shape === ShapeType.Circle
      ? 2 * (size.radius ?? 25)
      : (size.height ?? 50);

  // Local anchors
  const localAnchors: { name: AnchorName; x: number; y: number }[] =
    shape.shape === ShapeType.Circle
      ? (() => {
          const r = size.radius ?? 25;

          return [
            { name: "top", x: 0, y: -r },
            { name: "right", x: r, y: 0 },
            { name: "bottom", x: 0, y: r },
            { name: "left", x: -r, y: 0 },
          ];
        })()
      : [
          { name: "top", x: w / 2, y: 0 },
          { name: "right", x: w, y: h / 2 },
          { name: "bottom", x: w / 2, y: h },
          { name: "left", x: 0, y: h / 2 },
        ];

  // Icon pos
  const getImagePos = () => {
    const pad = 4;
    const iw = imageProps?.width ?? 30;
    const ih = imageProps?.height ?? 30;

    switch (imageProps?.imagePosition) {
      case "TR":
        return { x: w - iw - pad, y: pad };
      case "BR":
        return { x: w - iw - pad, y: h - ih - pad };
      case "BL":
        return { x: pad, y: h - ih - pad };
      default:
        return { x: pad, y: pad };
    }
  };

  // Handlers
  const handleDragMove = () => {
    const g = groupRef.current!;

    onChange?.({ ...shapeData, position: { x: g.x(), y: g.y() } });
  };
  const handleDragEnd = () => {
    const g = groupRef.current!;

    onChange?.({ ...shapeData, position: { x: g.x(), y: g.y() } });
  };
  const handleTransformEnd = () => {
    const g = groupRef.current!;
    const scaleX = g.scaleX();
    const scaleY = g.scaleY();

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
  };

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, w, h]);

  // Text box calculation
  const textBox =
    shape.shape === ShapeType.Circle
      ? {
          x: -(size.radius ?? 25),
          y: -(size.radius ?? 25),
          width: 2 * (size.radius ?? 25),
          height: 2 * (size.radius ?? 25),
        }
      : {
          x: 5,
          y: 5,
          width: w - 10,
          height: h - 10,
        };

  return (
    <>
      <Group
        ref={groupRef}
        draggable
        x={position.x}
        y={position.y}
        onClick={onSelect}
        onDblClick={() => setIsRenaming(true)}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onTap={onSelect}
      >
        {/* Shape */}
        {shape.shape === ShapeType.Rectangle && (
          <Rect cornerRadius={8} fill={color} height={h} width={w} />
        )}
        {shape.shape === ShapeType.Circle && (
          <Circle fill={color} radius={size.radius ?? 25} />
        )}
        {shape.shape === ShapeType.Custom && img && (
          <KonvaImage height={h} image={img} width={w} />
        )}

        {/* Optional Icon */}
        {img && imageProps?.imagePosition && (
          <KonvaImage
            height={imageProps.height}
            image={img}
            width={imageProps.width}
            x={getImagePos().x}
            y={getImagePos().y}
          />
        )}

        {/* Text or Textarea */}
        {isTextEnabled &&
          (!isRenaming ? (
            <Text
              align="center"
              text={text}
              verticalAlign="middle"
              {...textBox}
            />
          ) : (
            <Html
              divProps={{
                style: { background: "#fff", border: "1px solid #aaa" },
              }}
              groupProps={textBox}
            >
              <Textarea
                value={text}
                onBlur={() => {
                  setIsRenaming(false);
                  onChange?.({ ...shapeData, shape: { ...shape, text } });
                }}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setIsRenaming(false);
                    onChange?.({ ...shapeData, shape: { ...shape, text } });
                  }
                }}
              />
            </Html>
          ))}

        {/* Anchors */}
        {isSelected &&
          localAnchors.map((a) => {
            const lx = a.x - ANCHOR_SIZE / 2;
            const ly = a.y - ANCHOR_SIZE / 2;
            const abs = { x: position.x + a.x, y: position.y + a.y };
            const isHover = hoveredAnchor === a.name;

            return (
              <Fragment key={a.name}>
                <Rect
                  cornerRadius={2}
                  fill="green"
                  height={ANCHOR_SIZE}
                  opacity={isHover ? 1 : 0.3}
                  width={ANCHOR_SIZE}
                  x={lx}
                  y={ly}
                  onMouseDown={(e) => {
                    e.cancelBubble = true;
                    onAnchorMouseDown?.(shapeData.id, a.name, abs);
                  }}
                  onMouseEnter={() => setHoveredAnchor(a.name)}
                  onMouseLeave={() => setHoveredAnchor(null)}
                  onMouseUp={(e) => {
                    e.cancelBubble = true;
                    onAnchorMouseUp?.(shapeData.id, a.name, abs);
                  }}
                />
                <Html
                  divProps={{
                    style: {
                      width: `${ANCHOR_SIZE}px`,
                      height: `${ANCHOR_SIZE}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    },
                  }}
                  groupProps={{
                    x: lx,
                    y: ly,
                    width: ANCHOR_SIZE,
                    height: ANCHOR_SIZE,
                  }}
                >
                  <Plus color="white" size={ANCHOR_SIZE * 0.8} />
                </Html>
              </Fragment>
            );
          })}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldB, newB) =>
            newB.width < MIN_SIZE || newB.height < MIN_SIZE ? oldB : newB
          }
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-right",
            "bottom-left",
          ]}
          rotateEnabled={false}
          onTransformEnd={handleTransformEnd}
        />
      )}
    </>
  );
};

export default memo(ResizableTemplate);
