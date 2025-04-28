import { useCallback } from "react";

import { Position } from "@/types/canvas";

export function useSnapToGrid() {
  return useCallback(
    (p: Position): Position => ({
      x: Math.round(p.x),
      y: Math.round(p.y),
    }),
    [],
  );
}
