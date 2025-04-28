// src/pages/layout/components/layout/EdgeLayer.tsx

import React, { memo } from "react";
import { Layer } from "react-konva";

import { EdgeRenderer } from "./edge-renderer";

import {Edge, ShapeData} from "@/types/canvas.ts";

interface EdgeLayerProps {
  edges: Edge[];
  nodes: ShapeData[];
  selectedEdgeId: string | null;
  onEdgeClick: (edgeId: string) => void;
}

/**
 * Layer-Komponente, die alle Kanten in einer einzigen Konva-Layer rendert.
 * Kapselt den EdgeRenderer und sorgt für Memoization.
 */
const EdgeLayer: React.FC<EdgeLayerProps> = ({
  edges,
  nodes,
  selectedEdgeId,
  onEdgeClick,
}) => (
  <Layer>
    <EdgeRenderer
      edges={edges}
      nodes={nodes}
      selectedEdgeId={selectedEdgeId}
      onEdgeClick={onEdgeClick}
    />
  </Layer>
);

export default memo(EdgeLayer);
