import React from "react";
import { Layer, Circle, Text } from "react-konva";

import { AwarenessInfo } from "@/types/canvas.ts";

interface AwarenessLayerProps {
  awarenessInfo: AwarenessInfo[];
  ownClientId: number;
}

export const AwarenessLayer: React.FC<AwarenessLayerProps> = ({
  awarenessInfo,
  ownClientId,
}) => {
  return (
    <Layer listening={false}>
      {awarenessInfo
        .filter((u) => u.clientID !== ownClientId && u.cursor)
        .map((user) => {
          if (!user.cursor) return null;
          const { x, y } = user.cursor;
          const { clientID, name, color } = user;

          return (
            <React.Fragment key={clientID}>
              <Circle
                fill={color || "#00f"}
                opacity={0.8}
                radius={6}
                x={x}
                y={y}
              />
              <Text
                fill={color || "#00f"}
                fontSize={12}
                text={name || "Unnamed"}
                x={x + 8}
                y={y - 10}
              />
            </React.Fragment>
          );
        })}
    </Layer>
  );
};
