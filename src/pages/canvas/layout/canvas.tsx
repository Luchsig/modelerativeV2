// src/pages/layout/Canvas.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Stage, Layer, Circle, KonvaEventObject } from "react-konva";

import { useRoomStore } from "@/store/use-room-store.ts";
import ResizableTemplate from "@/pages/canvas/components/nodes/resizable-template.tsx";
import { EdgeRenderer } from "@/pages/canvas/components/edges/edge-renderer.tsx";
import {Position, ShapeData} from "@/types/canvas.ts";

const Canvas: React.FC = () => {
  // --- Store Hooks ---
  const nodes = useRoomStore((s) => s.nodes);
  const edges = useRoomStore((s) => s.edges);
  const setNodes = useRoomStore((s) => s.setNodes);
  const addEdge = useRoomStore((s) => s.addEdge);
  const removeEdge = useRoomStore((s) => s.removeEdge);
  const updateNode = useRoomStore((s) => s.updateNode);

  // --- Lokaler State ---
  const [selAnchor, setSelAnchor] = useState<{
    nodeId: string;
  } | null>(null);
  const [selNode, setSelNode] = useState<string | null>(null);
  const [selEdge, setSelEdge] = useState<string | null>(null);

  // Stage‐Ref
  const stageRef = useRef<Konva.Stage>(null);

  // Grid‐Daten
  const [grid, setGrid] = useState<Position[]>([]);

  useEffect(() => {
    const pts: Position[] = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let x = 0; x < w; x += 20) {
      for (let y = 0; y < h; y += 20) {
        pts.push({ x, y });
      }
    }
    setGrid(pts);
  }, []);

  // Snap‐to‐Grid
  const snapToGrid = useCallback(
    (p: Position) => ({
      x: Math.round(p.x / 20) * 20,
      y: Math.round(p.y / 20) * 20,
    }),
    [],
  );

  // Drop zum Hinzufügen neuer Nodes
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/schema-shape");

      if (!raw) return;
      const comp = JSON.parse(raw);
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = snapToGrid({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      setNodes([
        ...nodes,
        { id: crypto.randomUUID(), position: pos, shape: comp },
      ]);
    },
    [nodes, setNodes, snapToGrid],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Node bewegen / resize
  const handleChange = useCallback(
    (upd: ShapeData) => {
      const p = snapToGrid(upd.position);

      setNodes(
        nodes.map((n) => (n.id === upd.id ? { ...upd, position: p } : n)),
      );
    },
    [nodes, setNodes, snapToGrid],
  );

  // Edge‐Drawing starten
  const handleAnchorMouseDown = useCallback(
    (nodeId: string) => {
      setSelAnchor({ nodeId });
    },
    [],
  );

  // Edge fertigstellen oder Node selektieren
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (selAnchor && selAnchor.nodeId !== nodeId) {
        addEdge({
          id: crypto.randomUUID(),
          from: selAnchor.nodeId,
          to: nodeId,
        });
        setSelAnchor(null);
      } else {
        setSelNode(nodeId);
        setSelEdge(null);
      }
    },
    [selAnchor, addEdge],
  );

  // Edge selektieren
  const handleEdgeClick = useCallback((edgeId: string) => {
    setSelEdge(edgeId);
    setSelNode(null);
  }, []);

  // Löschen per Delete-Key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selEdge) {
        removeEdge(selEdge);
        setSelEdge(null);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [selEdge, removeEdge]);

  // Klick auf leere Stage räumt Auswahl auf
  const handleStageMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setSelNode(null);
        setSelEdge(null);
      }
    },
    [],
  );

  // Canvas‐Maße
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    <div
      className="w-full h-full"
      style={{ position: "relative" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        height={height}
        width={width}
        onMouseDown={handleStageMouseDown}
      >
        {/* Grid */}
        <Layer>
          {grid.map((p, i) => (
            <Circle key={`grid-${i}`} fill="#ddd" radius={1} x={p.x} y={p.y} />
          ))}
        </Layer>

        {/* Edges */}
        <EdgeRenderer
          edges={edges}
          nodes={nodes}
          selectedEdgeId={selEdge}
          onEdgeClick={handleEdgeClick}
        />

        {/* Nodes */}
        <Layer>
          {nodes.map((n) => (
            <ResizableTemplate
              key={n.id}
              isSelected={n.id === selNode}
              shapeData={n}
              onAnchorMouseDown={(_, anc) => handleAnchorMouseDown(n.id, anc)}
              onChange={handleChange}
              onSelect={() => handleNodeClick(n.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
