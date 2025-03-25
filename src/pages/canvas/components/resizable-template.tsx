import { Rect, Image, Group, Transformer, Circle, Text } from "react-konva";
import { Html } from "react-konva-utils";
import { useRef, useEffect, FC, useState } from "react";
import Konva from "konva";
import useImage from "use-image";
import { Textarea } from "@heroui/input";

export interface ImageProps {
  src: string;
  width?: number;
  height?: number;
  imagePosition?: "TL" | "TR" | "BL" | "BR";
}

export interface Position {
  x: number;
  y: number;
}

export interface ShapeData {
  shape: string;
  imageProps?: ImageProps;
  size: { width?: number; height?: number; radius?: number };
  color?: string;
  typeName: string;
  typeDescription: string;
  connectableTypes: string;
  position: Position;
  text: string;
  isTextEnabled: boolean;
}

export interface ShapeTemplateProps {
  id: string;
  shapeData: ShapeData;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (newAttrs: ShapeData) => void;
}

const ResizableTemplate: FC<ShapeTemplateProps> = ({
  shapeData,
  isSelected,
  onSelect,
  onChange,
}) => {
  const { shape, imageProps, size, color, position, isTextEnabled } = shapeData;
  // const [hovered, setHovered] = useState(false); TODO: LATER - Implement hover effect
  const shapeRef = useRef<Konva.Image | Konva.Rect | Konva.Circle>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [img] = useImage(imageProps?.src ?? "");
  const [isRenaming, setIsRenaming] = useState(false);
  const [text, setText] = useState(shapeData.text);

  const getImagePosition = () => {
    const padding = 1;
    const imageWidth = imageProps?.width ?? 30;
    const imageHeight = imageProps?.height ?? 30;

    switch (imageProps?.imagePosition) {
      case "TR":
        return { x: (size.width ?? 50) - imageWidth - padding, y: padding };
      case "BL":
        return { x: padding, y: (size.height ?? 50) - imageHeight - padding };
      case "BR":
        return {
          x: (size.width ?? 50) - imageWidth - padding,
          y: (size.height ?? 50) - imageHeight - padding,
        };
      default:
        return { x: padding, y: padding };
    }
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;

    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    if (onChange) {
      onChange({
        ...shapeData,
        size: {
          ...size,
          width: (size.width ?? 50) * scaleX,
          height: (size.height ?? 50) * scaleY,
          radius:
            shape === "circle"
              ? ((size.width ?? 50) * scaleX) / 2
              : size.radius,
        },
        position: {
          x: node.x(),
          y: node.y(),
        },
      });
    }
  };

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <Group
      draggable
      onClick={onSelect}
      onDblClick={() => setIsRenaming(true)} // Zum Aktivieren der Bearbeitung
      // onMouseEnter={() => setHovered(true)} TODO: LATER - Implement hover effect
      // onMouseLeave={() => setHovered(false)} TODO: LATER - Implement hover effect
      onTap={onSelect}
    >
      {shape === "custom" && img ? (
        <Image
          ref={shapeRef as React.RefObject<Konva.Image>}
          draggable
          height={size.height ?? 50}
          image={img}
          width={size.width ?? 50}
          x={position.x}
          y={position.y}
          onDragEnd={(e) =>
            onChange?.({
              ...shapeData,
              position: { x: e.target.x(), y: e.target.y() },
            })
          }
          onTransformEnd={handleTransformEnd}
        />
      ) : shape === "rectangle" ? (
        <Rect
          ref={shapeRef as React.RefObject<Konva.Rect>}
          draggable
          cornerRadius={10}
          fill={color ?? "grey"}
          height={size.height ?? 50}
          stroke="bg-zinc-400"
          strokeWidth={2}
          width={size.width ?? 50}
          x={position.x}
          y={position.y}
          onDragEnd={(e) =>
            onChange?.({
              ...shapeData,
              position: { x: e.target.x(), y: e.target.y() },
            })
          }
          onTransformEnd={handleTransformEnd}
        />
      ) : shape === "circle" ? (
        <Circle
          ref={shapeRef as React.RefObject<Konva.Circle>}
          draggable
          fill={color ?? "grey"}
          radius={size.radius ?? 25}
          stroke="bg-zinc-400"
          strokeWidth={2}
          x={position.x}
          y={position.y}
          onDragEnd={(e) =>
            onChange?.({
              ...shapeData,
              position: { x: e.target.x(), y: e.target.y() },
            })
          }
          onTransformEnd={handleTransformEnd}
        />
      ) : null}
      {img && imageProps?.imagePosition && (
        <Image
          {...getImagePosition()}
          height={imageProps.height ?? 40}
          image={img}
          width={imageProps.width ?? 40}
          x={position.x + getImagePosition().x}
          y={position.y + getImagePosition().y}
        />
      )}

      {isTextEnabled &&
        size &&
        (!isRenaming ? (
          <Text
            align="center"
            height={(size.height ?? size.radius ?? 50) - 5}
            text={text}
            verticalAlign="middle"
            width={(size.width ?? size.radius ?? 50) - 5}
            x={
              position?.x != null && size.radius != null
                ? position.x - size.radius
                : position?.x + 5
            }
            y={
              (position?.y != null && size.radius != null
                ? position.y - size.radius
                : position?.y) + 5
            }
          />
        ) : (
          <Html
            divProps={{ style: { opacity: 0.4 } }}
            groupProps={{
              x:
                position?.x != null && size.radius != null
                  ? position.x - size.radius
                  : position?.x,
              y:
                position?.y != null && size.radius != null
                  ? position.y - size.radius
                  : position?.y,
              width: size.width ?? size.radius ?? 50,
              height: size.height ?? size.radius ?? 50,
            }}
          >
            <Textarea
              value={text}
              onBlur={() => setIsRenaming(false)}
              onChange={(e) => setText(e.target.value)}
            />
          </Html>
        ))}

      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
          }
          rotateEnabled={false}
        />
      )}
    </Group>
  );
};

export default ResizableTemplate;
