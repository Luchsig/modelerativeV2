import { FC, useRef, useEffect, memo } from "react";
import { Layer, Transformer } from "react-konva";
import Konva from "konva";

import ResizableTemplate from "@/pages/canvas/components/nodes/resizable-template";
import { ShapeData, AnchorName, Position } from "@/types/canvas";

export interface NodeLayerProps {
  nodes: ShapeData[];
  multiSelected: string[];
  selectedNodeId: string | null;
  onChange: (updated: ShapeData) => void;
  onAnchorMouseDown: (
    nodeId: string,
    anchor: AnchorName,
    abs: Position,
  ) => void;
  onNodeClick: (nodeId: string) => void;
  onNodeDragStart?: () => void;
  onNodeDragMove?: () => void;
  onGroupDragEnd?: (ids: string[], updated: ShapeData[]) => void;
}

const NodeLayer: FC<NodeLayerProps> = ({
  nodes,
  multiSelected,
  selectedNodeId,
  onChange,
  onAnchorMouseDown,
  onNodeClick,
  onNodeDragStart,
  onGroupDragEnd,
  onNodeDragMove,
}) => {
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // 1) Ursprungspositionen speichern
  const originRef = useRef<Record<string, Position>>({});

  // 2) Transformer konfigurieren, wenn sich die Selektion ändert
  useEffect(() => {
    const layer = layerRef.current;
    const tr = trRef.current;

    if (!layer || !tr) return;

    const selectedNodes = multiSelected
      .map((id) => layer.findOne(`#${id}`))
      .filter((n): n is Konva.Node => !!n);

    tr.nodes(selectedNodes);
    tr.getLayer()?.batchDraw();
  }, [multiSelected]);

  return (
    <Layer ref={layerRef}>
      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isMultiSelected = multiSelected.includes(node.id);

        return (
          <ResizableTemplate
            key={node.id}
            isMultiSelected={isMultiSelected}
            isSelected={isSelected}
            shapeData={node}
            onAnchorMouseDown={(id, anc, abs) =>
              onAnchorMouseDown(id, anc, abs)
            }
            onChange={onChange}
            onDragMove={onNodeDragMove}
            onDragStart={onNodeDragStart}
            onSelect={() => onNodeClick(node.id)}
          />
        );
      })}

      <Transformer
        ref={trRef}
        draggable
        enabledAnchors={[]} // nur Move, kein Resize
        rotateEnabled={false}
        onDragEnd={() => {
          const updated: ShapeData[] = trRef.current!.nodes().map((n) => {
            const old = nodes.find((s) => s.id === n.id())!;

            return {
              ...old,
              position: { x: n.x(), y: n.y() },
            };
          });

          onGroupDragEnd?.(multiSelected, updated);
        }}
        onDragStart={() => {
          originRef.current = {};
          multiSelected.forEach((id) => {
            const n = layerRef.current!.findOne(`#${id}`) as Konva.Node;

            originRef.current[id] = { x: n.x(), y: n.y() };
          });
        }}
      />
    </Layer>
  );
};

export default memo(NodeLayer);
