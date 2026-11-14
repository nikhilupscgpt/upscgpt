/**
 * Coordinate conversion helpers for question-block-local ink (§3.7).
 * Strokes drawn on the question block are stored relative to the unscaled
 * question block top-left so they scale identically during Step 1 -> Step 2 transitions.
 */

export interface BlockTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function stageToBlockPoint(
  stageX: number,
  stageY: number,
  transform: BlockTransform
): [number, number] {
  const s = transform.scale > 0 ? transform.scale : 1;
  return [
    (stageX - transform.offsetX) / s,
    (stageY - transform.offsetY) / s,
  ];
}

export function blockToStagePoint(
  blockX: number,
  blockY: number,
  transform: BlockTransform
): [number, number] {
  const s = transform.scale > 0 ? transform.scale : 1;
  return [
    transform.offsetX + blockX * s,
    transform.offsetY + blockY * s,
  ];
}
