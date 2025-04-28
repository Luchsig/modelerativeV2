import type Konva from "konva";
import type {Position, ShapeData} from "@/types/canvas.ts";

import {useCallback, useEffect, useRef, useState} from "react";

import {calcBoundaryPoint} from "@/pages/canvas/components/edges/geometry.ts";

export interface EdgePreview {
  from: Position;
  to: Position;
  fromNodeId: string;
}

export function useEdgeDrag(
  nodes: ShapeData[],
  addEdge: (edge: { id: string; from: string; to: string }) => void,
  stageRef: React.RefObject<Konva.Stage>,
) {
  const [previewEdge, setPreviewEdge] = useState<EdgePreview | undefined>(
    undefined,
  );
  const dragFromRef = useRef<string | null>(null);

  const onMouseMove = useCallback(() => {
    const nodeId = dragFromRef.current;
    const stage = stageRef.current;

    if (!nodeId || !stage) return;
    const pos = stage.getPointerPosition();

    if (!pos) return;

    const src = nodes.find((n) => n.id === nodeId)!;
    const from = calcBoundaryPoint(src, pos);

    setPreviewEdge({ from, to: pos, fromNodeId: nodeId });
  }, [nodes, stageRef]);

  const onMouseUp = useCallback(() => {
    const nodeId = dragFromRef.current;
    const stage = stageRef.current;

    if (nodeId && stage) {
      const pos = stage.getPointerPosition();

      if (pos) {
        let grp = stage.getStage().getIntersection(pos);

        while (grp && grp.getClassName() !== "Group") {
          grp = (grp as any).getParent?.();
        }
        const toId = grp?.id();

        if (toId && toId !== nodeId) {
          addEdge({ id: crypto.randomUUID(), from: nodeId, to: toId });
        }
      }
    }

    // cleanup
    dragFromRef.current = null;
    setPreviewEdge(undefined);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [addEdge, onMouseMove, stageRef]);

  // Called by your component when an anchor is pressed
  const startDrag = useCallback(
    (nodeId: string) => {
      dragFromRef.current = nodeId;
      setPreviewEdge(undefined);
      // bind global listeners (always uses current handlers!)
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onMouseMove, onMouseUp],
  );

  // cleanup if component unmounts during drag
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return {
    /** Attach this as ref={stageRef} to your <Stage> */
    stageRef,
    /** undefined unless a drag is in progress */
    previewEdge,
    /** Call when the user presses an anchor-point on a node */
    startDrag,
  };
}
