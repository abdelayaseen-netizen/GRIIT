/** Center-crop a bitmap to the 4:5 viewfinder. Stored proof matches the frame. */

export type PixelRect = { originX: number; originY: number; width: number; height: number };

export function cropRectTo45(width: number, height: number): PixelRect {
  if (width <= 0 || height <= 0) {
    return { originX: 0, originY: 0, width: Math.max(0, width), height: Math.max(0, height) };
  }
  const target = 4 / 5;
  const current = width / height;
  if (current > target) {
    const w = Math.round(height * target);
    return { originX: Math.round((width - w) / 2), originY: 0, width: w, height };
  }
  const h = Math.round(width / target);
  return { originX: 0, originY: Math.round((height - h) / 2), width, height: h };
}
