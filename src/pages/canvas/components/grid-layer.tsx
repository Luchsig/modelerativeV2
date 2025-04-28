// src/pages/layout/components/layout/GridLayer.tsx

import { FC, useMemo } from "react";
import { Layer, Line } from "react-konva";

interface GridLayerProps {
  width: number;
  height: number;
  step?: number;
  strokeColor?: string;
  strokeWidth?: number;
  /** Muster für gestrichelte Linien */
  dash?: number[];
  /** Alle n-ten Linien etwas stärker hervorheben */
  majorLineEvery?: number;
  majorStrokeColor?: string;
  majorStrokeWidth?: number;
}

const GridLayer: FC<GridLayerProps> = ({
  width,
  height,
  step = 20,
  strokeColor = "#ddd",
  strokeWidth = 1,
  dash = [4, 4],
  majorLineEvery = 5,
  majorStrokeColor = "#ccc",
  majorStrokeWidth = 2,
}) => {
  // vertikale Linien X-Koordinaten
  const verticals = useMemo(() => {
    const xs: number[] = [];

    for (let x = 0; x <= width; x += step) xs.push(x);

    return xs;
  }, [width, step]);

  // horizontale Linien Y-Koordinaten
  const horizontals = useMemo(() => {
    const ys: number[] = [];

    for (let y = 0; y <= height; y += step) ys.push(y);

    return ys;
  }, [height, step]);

  return (
    <Layer listening={false}>
      {/* Feine Linien */}
      {verticals.map((x, i) => (
        <Line
          key={`v-${i}`}
          dash={dash}
          points={[x, 0, x, height]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      ))}
      {horizontals.map((y, i) => (
        <Line
          key={`h-${i}`}
          dash={dash}
          points={[0, y, width, y]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      ))}

      {/* Markante Hauptlinien alle majorLineEvery Schritte */}
      {verticals
        .filter((_, i) => i % majorLineEvery === 0)
        .map((x, i) => (
          <Line
            key={`v-major-${i}`}
            points={[x, 0, x, height]}
            stroke={majorStrokeColor}
            strokeWidth={majorStrokeWidth}
          />
        ))}
      {horizontals
        .filter((_, i) => i % majorLineEvery === 0)
        .map((y, i) => (
          <Line
            key={`h-major-${i}`}
            points={[0, y, width, y]}
            stroke={majorStrokeColor}
            strokeWidth={majorStrokeWidth}
          />
        ))}
    </Layer>
  );
};

export default GridLayer;
