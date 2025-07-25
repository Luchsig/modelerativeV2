// src/pages/layout/Canvas.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useWindowSize } from "usehooks-ts";
import Konva from "konva";

import { useRoomStore } from "@/store/use-room-store.ts";
import { EdgeRenderer } from "@/pages/canvas/components/edges/edge-renderer.tsx";
import GridLayer from "@/pages/canvas/components/grid-layer.tsx";
import NodeLayer from "@/pages/canvas/components/nodes/node-layer.tsx";
import { useSnapToGrid } from "@/pages/canvas/hooks/use-snap-to-grid.ts";
import { useKeyPress } from "@/pages/canvas/hooks/use-key-press.ts";
import ContextMenu from "@/pages/canvas/components/context-menu.tsx";
import { MenuTarget, ShapeData } from "@/types/canvas.ts";
import { useEdgeDrag } from "@/pages/canvas/hooks/use-edge-drag.ts";
import { useMarqueeSelection } from "@/pages/canvas/hooks/use-marquee-selection.ts";
import { AwarenessLayer } from "@/pages/canvas/components/awareness-layer.tsx";

type SelectedTarget = { type: "node" | "edge"; id: string } | null;

interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage>;
}

const Canvas: React.FC<CanvasProps> = ({ stageRef }) => {
  // ── Zustand aus Store
  const nodes = useRoomStore((s) => s.nodes);
  const edges = useRoomStore((s) => s.edges);
  const moveNodes = useRoomStore((s) => s.moveNodes);
  const addNode = useRoomStore((s) => s.addNode);
  const addEdge = useRoomStore((s) => s.addEdge);
  const updateEdge = useRoomStore((s) => s.updateEdge);
  const removeEdge = useRoomStore((s) => s.removeEdge);
  const updateNode = useRoomStore((s) => s.updateNode);
  const removeNode = useRoomStore((s) => s.removeNode);
  const awarenessInfo = useRoomStore((s) => s.awarenessInfo);
  const provider = useRoomStore((s) => s.provider);
  const ownClientId = useRoomStore((s) => s.ownClientId);

  // ── Marquee-Selection Hook
  const {
    marquee,
    selectedIds,
    handlers: marqueeHandlers,
  } = useMarqueeSelection(nodes, stageRef, (singleId) =>
    setSelected({ type: "node", id: singleId }),
  );

  // ── Edge-Drag Hook: übergebe nodes, addEdge und stageRef
  const { previewEdge, startDrag } = useEdgeDrag(nodes, addEdge, stageRef);

  // ── UI-State
  const [selected, setSelected] = useState<SelectedTarget>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const snapToGrid = useSnapToGrid();
  const { width, height } = useWindowSize();

  // ── Drop neue Nodes
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setMenuVisible(false);
      const raw = e.dataTransfer.getData("application/schema-shape");

      if (!raw) return;
      const comp = JSON.parse(raw);
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = snapToGrid({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      addNode({ id: crypto.randomUUID(), position: pos, shape: comp });
    },
    [nodes, addNode, snapToGrid],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setMenuVisible(false);
  }, []);

  // ── Node bewegen / resize
  const handleChange = useCallback(
    (upd: ShapeData) => {
      const p = snapToGrid(upd.position);

      updateNode(upd.id, {
        position: p,
        shape: upd.shape,
      });
    },
    [snapToGrid, updateNode],
  );

  // ── Drag-Group
  const handleGroupDragEnd = useCallback(
    (_ids: string[], updatedShapes: ShapeData[]) => {
      moveNodes(
        updatedShapes.map((u) => ({
          id: u.id,
          position: u.position,
        })),
      );
    },
    [moveNodes],
  );

  // ── Klick auf Node
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelected({ type: "node", id: nodeId });
  }, []);

  // ── Klick auf Edge
  const handleEdgeClick = useCallback((edgeId: string) => {
    setSelected({ type: "edge", id: edgeId });
  }, []);

  // ── Leeres Stage-Feld anklicken -> Auswahl reset
  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 0 && e.target === e.target.getStage()) {
        setSelected(null);
        setMenuVisible(false);
      }
    },
    [],
  );

  const handleMouseMove = useCallback(() => {
    const stage = stageRef.current;
    const pos = stage?.getPointerPosition();

    if (!pos) return;

    const awareness = provider?.awareness;
    if (awareness) {
      awareness.setLocalStateField("cursor", { x: pos.x, y: pos.y });
    }
  }, [provider]);

  // ── Context-Menu
  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();
      if (e.target === e.target.getStage()) return;

      const stage = stageRef.current!;
      const ptr = stage.getPointerPosition()!;
      const rect = stage.container().getBoundingClientRect();

      setMenuPos({ x: rect.left + ptr.x + 4, y: rect.top + ptr.y + 4 });

      if (e.target.getClassName() === "Arrow") {
        // für Edges: Suche die Group, dann aus dem Store das richtige ShapeData
        const edgeId = e.target.id();
        const edgeData = edges.find((n) => n.id === edgeId);

        if (!edgeData) return;

        setMenuTarget({
          type: "edge",
          id: edgeId,
          edgeStart: edgeData.startStyle ?? "none",
          edgeLine: edgeData.lineStyle ?? "solid",
          edgeEnd: edgeData.endStyle ?? "filled",
          isTextEnabled: true,
        });
      } else {
        // für Nodes: Suche die Group, dann aus dem Store das richtige ShapeData
        let grp: any = e.target;

        while (grp && grp.getClassName() !== "Group") {
          grp = grp.getParent();
        }
        const nodeId = grp?.id();

        if (!nodeId) return;

        const nodeData = nodes.find((n) => n.id === nodeId);

        if (!nodeData) return;

        setMenuTarget({
          type: "node",
          id: nodeId,
          isTextEnabled: nodeData.shape.isTextEnabled,
        });
      }

      setMenuVisible(true);
      e.evt.stopPropagation();
      e.evt.stopImmediatePropagation();
    },
    [nodes],
  );

  useEffect(() => {
    const onWin = () => setMenuVisible(false);

    window.addEventListener("click", onWin);

    return () => window.removeEventListener("click", onWin);
  }, []);

  // ── Delete Key
  useKeyPress("Delete", () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => removeNode(id));
      setSelected(null);
      marqueeHandlers.clearSelection();
    } else if (selected?.type === "edge") {
      removeEdge(selected.id);
      setSelected(null);
      marqueeHandlers.clearSelection();
    } else if (selected?.type === "node") {
      removeNode(selected.id);
      setSelected(null);
      marqueeHandlers.clearSelection();
    }
  });

  // ── Memoized Layers
  const gridLayer = useMemo(
    () => (
      <GridLayer
        dash={[2, 2]}
        height={height}
        majorLineEvery={5}
        majorStrokeColor="#ccc"
        majorStrokeWidth={1}
        step={20}
        strokeColor="#ddd"
        strokeWidth={0.5}
        width={width}
      />
    ),
    [width, height],
  );

  const edgeLayer = useMemo(
    () => (
      <EdgeRenderer
        edges={edges}
        nodes={nodes}
        previewEdge={previewEdge}
        selectedEdgeId={selected?.type === "edge" ? selected.id : null}
        onEdgeClick={handleEdgeClick}
      />
    ),
    [edges, nodes, previewEdge, selected, handleEdgeClick],
  );

  const nodeLayer = useMemo(
    () => (
      <NodeLayer
        multiSelected={selectedIds}
        nodes={nodes}
        selectedNodeId={selected?.type === "node" ? selected.id : null}
        onAnchorMouseDown={startDrag}
        onChange={handleChange}
        onGroupDragEnd={handleGroupDragEnd}
        onNodeClick={handleNodeClick}
        onNodeDragMove={handleMouseMove}
        onNodeDragStart={() => setMenuVisible(false)}
      />
    ),
    [nodes, selected, startDrag, handleChange, handleNodeClick, selectedIds],
  );

  const awarenessLayer = useMemo(
    () => (
      <AwarenessLayer awarenessInfo={awarenessInfo} ownClientId={ownClientId} />
    ),
    [awarenessInfo, awarenessInfo.length, ownClientId],
  );

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
        onContextMenu={handleContextMenu}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) marqueeHandlers.onMouseDown(e);
          handleStageMouseDown(e);
        }}
        onMouseMove={() => {
          handleMouseMove();
          marqueeHandlers.onMouseMove();
        }}
        onMouseUp={marqueeHandlers.onMouseUp}
      >
        <Layer>
          <Rect
            fill="white"
            height={height}
            listening={false}
            width={width}
            x={0}
            y={0}
          />
        </Layer>
        {gridLayer}
        {edgeLayer}
        {nodeLayer}
        {awarenessLayer}

        {marquee && (
          <Layer>
            <Rect
              dash={[4, 4]}
              fill="rgba(0, 120, 215, 0.2)"
              height={Math.abs(marquee.height)}
              listening={false}
              stroke="#0078d7"
              width={Math.abs(marquee.width)}
              x={Math.min(marquee.x, marquee.x + marquee.width)}
              y={Math.min(marquee.y, marquee.y + marquee.height)}
            />
          </Layer>
        )}
      </Stage>

      <ContextMenu
        target={menuTarget}
        visible={menuVisible}
        x={menuPos.x}
        y={menuPos.y}
        onArrowStyleChange={(id, styles) => {
          const { startStyle, lineStyle, endStyle } = styles;

          updateEdge(id, {
            startStyle,
            lineStyle,
            endStyle,
          });
        }}
        onClose={() => setMenuVisible(false)}
        onDelete={(t) => {
          if (t.type === "node") removeNode(t.id);
          else removeEdge(t.id);
          setMenuVisible(false);
        }}
        onRename={(t) => {
          const promptText =
            t.type === "node"
              ? "Neuen Namen für Node eingeben:"
              : "Neuen Namen für Edge eingeben:";
          const newName = prompt(promptText, "")?.trim();

          if (newName) {
            if (t.type === "node") {
              const node = nodes.find((n) => n.id === t.id);

              if (!node) return;

              updateNode(t.id, {
                shape: {
                  ...node.shape,
                  text: newName,
                },
              });
            } else {
              updateEdge(t.id, { text: newName });
            }
          }
          setMenuVisible(false);
        }}
      />
    </div>
  );
};

export default Canvas;
