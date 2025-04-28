import type { ShapeData } from "@/types/canvas";
import type Konva from "konva";

import { useState, useCallback, useRef } from "react";

interface Marquee {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function useMarqueeSelection(
  nodes: ShapeData[],
  stageRef: React.RefObject<Konva.Stage>,
  onSingleSelect?: (id: string) => void,
) {
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const marqueeRef = useRef<Marquee | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setMarquee(null);
    marqueeRef.current = null;
  }, []);

  const startMarquee = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        const pos = stageRef.current!.getPointerPosition()!;
        const rect = { x: pos.x, y: pos.y, width: 0, height: 0 };

        marqueeRef.current = rect;
        setSelectedIds([]);
        setMarquee(rect);
      }
    },
    [stageRef],
  );

  const updateMarquee = useCallback(() => {
    const prev = marqueeRef.current;

    if (!prev) return;
    const pos = stageRef.current!.getPointerPosition()!;
    const next = {
      x: prev.x,
      y: prev.y,
      width: pos.x - prev.x,
      height: pos.y - prev.y,
    };

    marqueeRef.current = next;
    setMarquee(next);
  }, [stageRef]);

  const finishMarquee = useCallback(() => {
    const rectState = marqueeRef.current;

    if (!rectState) return;

    const rect = {
      x: Math.min(rectState.x, rectState.x + rectState.width),
      y: Math.min(rectState.y, rectState.y + rectState.height),
      width: Math.abs(rectState.width),
      height: Math.abs(rectState.height),
    };

    const hits = nodes
      .filter((n) => {
        let bx = n.position.x;
        let by = n.position.y;
        let bw: number;
        let bh: number;

        if (n.shape.shape === "circle") {
          const r = n.shape.size.radius ?? 0;

          bx -= r;
          by -= r;
          bw = 2 * r;
          bh = 2 * r;
        } else {
          bw = n.shape.size.width ?? 0;
          bh = n.shape.size.height ?? 0;
        }

        const overlapX = bx < rect.x + rect.width && bx + bw > rect.x;
        const overlapY = by < rect.y + rect.height && by + bh > rect.y;

        return overlapX && overlapY;
      })
      .map((n) => n.id);

    if (hits.length > 1) {
      setSelectedIds(hits);
    } else if (hits.length === 1) {
      onSingleSelect?.(hits[0]);
    } else {
      setSelectedIds([]);
    }
    setMarquee(null);
    marqueeRef.current = null;
  }, [nodes]);

  return {
    marquee,
    selectedIds,
    handlers: {
      clearSelection: clearSelection,
      onMouseDown: startMarquee,
      onMouseMove: updateMarquee,
      onMouseUp: finishMarquee,
    } as const,
  };
}
