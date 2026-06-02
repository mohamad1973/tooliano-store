/** كمية وهمية للعرض فقط — لا تُستخدم في الحجز الحقيقي أو نجاح الحملة */

export function getMaxBoostQuantity(targetQuantity: number): number {
  if (!Number.isFinite(targetQuantity) || targetQuantity < 1) return 0;
  return Math.floor(targetQuantity * 0.1);
}

export function clampBoostQuantity(
  targetQuantity: number,
  boost: number,
): number {
  const max = getMaxBoostQuantity(targetQuantity);
  if (!Number.isFinite(boost) || boost < 0) return 0;
  return Math.min(max, Math.floor(boost));
}

export function getDisplayReservedQuantity(
  targetQuantity: number,
  realReserved: number,
  boost: number,
): number {
  const real = Number.isFinite(realReserved) && realReserved > 0 ? realReserved : 0;
  const display = real + clampBoostQuantity(targetQuantity, boost);
  return Math.min(targetQuantity, Math.max(0, display));
}
