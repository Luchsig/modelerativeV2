import { Position, ShapeData, ShapeType } from "@/types/canvas.ts";

/**
 * Computes the center point of a node.
 *
 * - For circles, the center is simply the node's position.
 * - For rectangles (and custom shapes using width/height), the center
 *   is offset by half the width and half the height from the node's position.
 *
 * @param node - The shape data for which to compute the center.
 * @returns The `{ x, y }` coordinates of the shape's center.
 */
export function getCenter(node: ShapeData): { x: number; y: number } {
  const { x: px, y: py } = node.position;

  if (node.shape.shape === ShapeType.Circle) {
    return { x: px, y: py };
  }

  const w = node.shape.size.width ?? 50;
  const h = node.shape.size.height ?? 50;

  return { x: px + w / 2, y: py + h / 2 };
}

/**
 * Calculates the point on the boundary of a shape where a straight
 * line from the shape's center toward `targetPos` would intersect.
 *
 * - For circles, this is found by normalizing the direction vector
 *   and scaling by the circle's radius.
 * - For rectangles, this finds the minimum t such that moving
 *   from center by (dx * t, dy * t) lands on one of the edges.
 *
 * @param node - The source shape data.
 * @param targetPos - The point to which the boundary intersection is calculated.
 * @returns The `{ x, y }` coordinates on the shape boundary.
 */
export function calcBoundaryPoint(
  node: ShapeData,
  targetPos: { x: number; y: number },
): { x: number; y: number } {
  const { x: cx, y: cy } = getCenter(node);
  const dx = targetPos.x - cx;
  const dy = targetPos.y - cy;

  if (node.shape.shape === ShapeType.Circle) {
    const r = node.shape.size.radius ?? 25;
    const len = Math.hypot(dx, dy);

    return {
      x: cx + (dx / len) * r,
      y: cy + (dy / len) * r,
    };
  }

  const w = node.shape.size.width ?? 50;
  const h = node.shape.size.height ?? 50;
  const tX = dx !== 0 ? w / 2 / Math.abs(dx) : Infinity;
  const tY = dy !== 0 ? h / 2 / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);

  return {
    x: cx + dx * t,
    y: cy + dy * t,
  };
}

/**
 * Computes the intersection point between two line segments AB and CD, if any.
 *
 * This uses the standard two-line intersection formula and then checks
 * whether the intersection lies within both segments.
 *
 * @param A - Start point of the first segment.
 * @param B - End point of the first segment.
 * @param C - Start point of the second segment.
 * @param D - End point of the second segment.
 * @returns The `{ x, y }` coordinates of the intersection, or `null` if they do not intersect.
 */
export function getLineIntersection(
  A: Position,
  B: Position,
  C: Position,
  D: Position,
): Position | null {
  const a1 = B.y - A.y,
    b1 = A.x - B.x,
    c1 = a1 * A.x + b1 * A.y;
  const a2 = D.y - C.y,
    b2 = C.x - D.x,
    c2 = a2 * C.x + b2 * C.y;
  const det = a1 * b2 - a2 * b1;

  if (Math.abs(det) < 1e-6) return null;

  const x = (b2 * c1 - b1 * c2) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  const onSeg = (P: Position, Q: Position) =>
    x >= Math.min(P.x, Q.x) - 1e-6 &&
    x <= Math.max(P.x, Q.x) + 1e-6 &&
    y >= Math.min(P.y, Q.y) - 1e-6 &&
    y <= Math.max(P.y, Q.y) + 1e-6;

  return onSeg(A, B) && onSeg(C, D) ? { x, y } : null;
}

/**
 * Builds a polyline (list of [x,y,...]) from `start` to `end`, inserting
 * small semicircular detours around each cut point to visualize crossings.
 *
 * - If there are no `cuts`, returns a straight line.
 * - Otherwise sorts cut points along the AB direction, then for each:
 *   1. Adds a point just before the cut (`E1`)
 *   2. Interpolates a semicircle of `segments` steps around the cut
 *   3. Adds a point just after the cut (`E2`)
 * - Finally appends the true `end`.
 *
 * @param start - The starting coordinate of the line.
 * @param end - The ending coordinate of the line.
 * @param cuts - An array of intersection points along the line.
 * @param radius - The radius of the semicircular detour (default 6).
 * @param segments - Number of steps to approximate the semicircle (default 8).
 * @returns A flat array of numbers `[x0, y0, x1, y1, …, xN, yN]` for use in Konva points.
 */
export function buildCurvedPoints(
  start: Position,
  end: Position,
  cuts: Position[],
  radius = 6,
  segments = 8,
): number[] {
  if (cuts.length === 0) {
    return [start.x, start.y, end.x, end.y];
  }

  const dx = end.x - start.x,
    dy = end.y - start.y,
    len2 = dx * dx + dy * dy;
  const sorted = [...cuts].sort(
    (A, B) =>
      ((A.x - start.x) * dx + (A.y - start.y) * dy) / len2 -
      ((B.x - start.x) * dx + (B.y - start.y) * dy) / len2,
  );

  const pts: number[] = [start.x, start.y];

  sorted.forEach((C) => {
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length,
      uy = dy / length;
    const E1 = { x: C.x - ux * radius, y: C.y - uy * radius };
    const E2 = { x: C.x + ux * radius, y: C.y + uy * radius };

    // point just before the cut
    pts.push(E1.x, E1.y);

    let a0 = Math.atan2(E1.y - C.y, E1.x - C.x);
    let a1 = Math.atan2(E2.y - C.y, E2.x - C.x);
    let delta = a1 - a0;

    if (delta < 0) delta += 2 * Math.PI;
    if (delta > Math.PI) delta -= 2 * Math.PI;

    // interpolate semicircle
    for (let k = 1; k < segments; k++) {
      const a = a0 + (delta * k) / segments;

      pts.push(C.x + Math.cos(a) * radius, C.y + Math.sin(a) * radius);
    }

    // point just after the cut
    pts.push(E2.x, E2.y);
  });

  // final endpoint
  pts.push(end.x, end.y);

  return pts;
}
