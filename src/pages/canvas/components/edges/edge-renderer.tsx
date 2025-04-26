// src/pages/layout/components/layout/edge-renderer.tsx

import React from "react";
import { Layer, Arrow } from "react-konva";

import {Edge, ShapeData} from "@/types/canvas.ts";
import {calcBoundaryPoint, getCenter} from "@/pages/canvas/components/edges/geography.ts";

interface Props {
  edges: Edge[];
  nodes: ShapeData[];
  selectedEdgeId: string | null;
  onEdgeClick: (edgeId: string) => void;
}

export const EdgeRenderer: React.FC<Props> = ({
  edges,
  nodes,
  selectedEdgeId,
  onEdgeClick,
}) => (
  <Layer>
    {edges.map((edge) => {
      const src = nodes.find((n) => n.id === edge.from);
      const tgt = nodes.find((n) => n.id === edge.to);

      if (!src || !tgt) return null;

      // compute start/end exactly at the shape boundaries
      const start = calcBoundaryPoint(src, getCenter(tgt));
      const end = calcBoundaryPoint(tgt, getCenter(src));
      const isSelected = edge.id === selectedEdgeId;

      return (
        <Arrow
          key={edge.id}
          fill={isSelected ? "#007aff" : "#333"}
          pointerLength={8}
          pointerWidth={8}
          points={[start.x, start.y, end.x, end.y]}
          stroke={isSelected ? "#007aff" : "#333"}
          strokeWidth={isSelected ? 4 : 2}
          onClick={(e) => {
            e.evt.cancelBubble = true;
            onEdgeClick(edge.id);
          }}
        />
      );
    })}
  </Layer>
);
