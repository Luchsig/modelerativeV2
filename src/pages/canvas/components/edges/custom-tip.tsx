import { Shape } from "react-konva";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  memo,
  useCallback,
} from "react";
import Konva from "konva";

import { ArrowStyle } from "@/types/canvas.ts";

interface CustomTipProps {
  x: number;
  y: number;
  angle: number;
  style: ArrowStyle;
  pointerLength?: number;
  pointerWidth?: number;
  stroke: string;
}

const CustomTipComponent = forwardRef<any, CustomTipProps>(function CustomTip(
  { x, y, angle, style, pointerLength = 10, pointerWidth = 10, stroke },
  ref,
) {
  const shapeRef = useRef<any>(null);

  useImperativeHandle(ref, () => shapeRef.current);

  const sceneFunc = useCallback(
    (ctx: Konva.Context, shape: Konva.Shape) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-pointerLength, pointerWidth / 2);
      ctx.lineTo(-pointerLength, -pointerWidth / 2);
      ctx.closePath();

      if (style === "filled") {
        ctx.fill();
      } else if (style === "outline") {
        ctx.stroke();
      }

      ctx.restore();
      ctx.fillStrokeShape(shape);
    },
    [x, y, angle, pointerLength, pointerWidth, style],
  );

  if (style === "none") return null;

  return (
    <Shape
      ref={shapeRef}
      fill={style === "filled" ? stroke : "white"}
      perfectDrawEnabled={false}
      sceneFunc={sceneFunc}
      stroke={stroke}
    />
  );
});

CustomTipComponent.displayName = "CustomTip";

export const CustomTip = memo(
  CustomTipComponent,
  (prev, next) =>
    prev.x === next.x &&
    prev.y === next.y &&
    prev.angle === next.angle &&
    prev.style === next.style &&
    prev.stroke === next.stroke &&
    prev.pointerLength === next.pointerLength &&
    prev.pointerWidth === next.pointerWidth,
);
