// src/pages/layout/components/layout/edge-renderer.tsx
import React, {useMemo} from "react";
import { Layer, Arrow, Text, Group } from "react-konva";

import { Edge, ShapeData, Position } from "@/types/canvas.ts";
import {
  buildCurvedPoints,
  calcBoundaryPoint,
  getCenter,
  getLineIntersection,
} from "@/pages/canvas/components/edges/geometry.ts";
import { CustomTip } from "@/pages/canvas/components/edges/custom-tip.tsx";

interface Props {
  edges: Edge[];
  nodes: ShapeData[];
  selectedEdgeId: string | null;
  onEdgeClick: (edgeId: string) => void;
  previewEdge?: { from: Position; to: Position };
}

export const EdgeRenderer: React.FC<Props> = ({
  edges,
  nodes,
  selectedEdgeId,
  onEdgeClick,
  previewEdge,
}) => {
  type Segment = {
    id: string;
    start: Position;
    end: Position;
    text: string | undefined;
  };
  const segments = useMemo<Segment[]>(() => {
    return edges
      .map<Segment | null>((e) => {
        const src = nodes.find((n) => n.id === e.from);
        const tgt = nodes.find((n) => n.id === e.to);

        if (!src || !tgt) return null;

        return {
          id: e.id,
          start: calcBoundaryPoint(src, getCenter(tgt)),
          end: calcBoundaryPoint(tgt, getCenter(src)),
          text: e.text,
        };
      })
      .filter((s): s is Segment => s !== null);
  }, [edges, nodes]);

  const intersections = useMemo(() => {
    const result: { a: string; b: string; p: Position }[] = [];

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const s1 = segments[i];
        const s2 = segments[j];
        const p = getLineIntersection(s1.start, s1.end, s2.start, s2.end);

        if (p) result.push({ a: s1.id, b: s2.id, p });
      }
    }

    return result;
  }, [segments]);

  // 3) Grad & Zuordnung der Schnitte
  const cutsMap = useMemo(() => {
    const degree = new Map<string, number>();

    segments.forEach((s) => degree.set(s.id, 0));
    intersections.forEach(({ a, b }) => {
      degree.set(a, (degree.get(a) || 0) + 1);
      degree.set(b, (degree.get(b) || 0) + 1);
    });

    let primary: string | null = null,
      max = -1;

    degree.forEach((d, id) => {
      if (d > max) {
        max = d;
        primary = id;
      }
    });

    const map = new Map<string, Position[]>();

    segments.forEach((s) => map.set(s.id, []));
    intersections.forEach(({ a, b, p }) => {
      const target =
        a === primary || b === primary
          ? primary!
          : degree.get(a)! < degree.get(b)!
            ? a
            : b;

      map.get(target)!.push(p);
    });

    return map;
  }, [segments, intersections]);

  return (
    <Layer>
      {segments.map(({ id, start, end, text }) => {
        const eD = edges.find((e) => e.id === id);

        if (!eD) return null;

        const isSelected = id === selectedEdgeId;
        const pts = buildCurvedPoints(start, end, cutsMap.get(id) || []);
        const dashArr = eD.lineStyle === "dashed" ? [10, 5] : [];
        const ang = Math.atan2(end.y - start.y, end.x - start.x);
        const strokeColor = isSelected ? "#007aff" : "#333";
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        return (
          <Group key={id} id={id}>
            <Arrow
              dash={dashArr}
              fill={strokeColor}
              hitStrokeWidth={20}
              id={id}
              pointerLength={0}
              pointerWidth={0}
              points={pts}
              stroke={strokeColor}
              strokeWidth={isSelected ? 4 : 2}
              tension={0}
              onClick={(e) => {
                e.evt.cancelBubble = true;
                onEdgeClick(id);
              }}
            />
            <CustomTip
              angle={ang + Math.PI}
              stroke={strokeColor}
              style={eD.startStyle}
              x={start.x}
              y={start.y}
            />
            <CustomTip
              angle={ang}
              stroke={strokeColor}
              style={eD.endStyle}
              x={end.x}
              y={end.y}
            />
            {text !== undefined && (
              <Text
                align="center"
                fill={isSelected ? "#007aff" : "#333"}
                height={14}
                listening={false}
                text={text}
                verticalAlign="middle"
                width={150}
                x={midX - 75}
                y={midY - 18}
              />
            )}
          </Group>
        );
      })}
      {previewEdge && (
        <Arrow
          dash={[4, 4]}
          pointerLength={6}
          pointerWidth={6}
          points={[
            previewEdge.from.x,
            previewEdge.from.y,
            previewEdge.to.x,
            previewEdge.to.y,
          ]}
          stroke="#888"
          strokeWidth={2}
          tension={0}
        />
      )}
    </Layer>
  );
};
