import React, { FC } from "react";
import { Label, Tag, Text } from "react-konva";

import {AnchorName, Position} from "@/types/canvas";

interface AnchorsProps {
  anchors: { name: AnchorName; x: number; y: number }[];
  offset: Position;
  size: number;
  hovered: AnchorName | null;
  onMouseDown: (name: AnchorName, abs: Position) => void;
  onMouseEnter: (name: AnchorName) => void;
  onMouseLeave: () => void;
}

const Anchors: FC<AnchorsProps> = ({
  anchors,
  offset,
  size,
  hovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => (
  <>
    {anchors.map((a) => {
      const lx = a.x - size / 2,
        ly = a.y - size / 2;
      const abs = { x: offset.x + a.x, y: offset.y + a.y };
      const isHover = hovered === a.name;

      return (
        <Label
          key={a.name}
          x={lx}
          y={ly}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            onMouseDown(a.name, abs);
          }}
          onMouseEnter={() => onMouseEnter(a.name)}
          onMouseLeave={onMouseLeave}
        >
          <Tag
            cornerRadius={2}
            fill="#4CAF50"
            height={size}
            opacity={isHover ? 1 : 0.3}
            width={size}
          />
          <Text
            align="center"
            fill="white"
            fontSize={size * 0.8}
            height={size}
            listening={false}
            text="+"
            verticalAlign="middle"
            width={size}
          />
        </Label>
      );
    })}
  </>
);

export default React.memo(Anchors);
