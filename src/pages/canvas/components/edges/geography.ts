import {ShapeData, ShapeType} from "@/types/canvas.ts";

/** Compute the center point of a node (circle uses its position; rect adds half width/height) */
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
 * Find the intersection point on the boundary of a shape
 * along the line from its center toward targetPos.
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