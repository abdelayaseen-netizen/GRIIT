import { describe, expect, it } from "vitest";
import { cropRectTo45 } from "@/lib/crop-to-45";

describe("cropRectTo45", () => {
  it("center-crops a wide frame to 4:5", () => {
    const r = cropRectTo45(4000, 3000);
    expect(r.height).toBe(3000);
    expect(r.width).toBe(2400);
    expect(r.originX).toBe(800);
    expect(r.originY).toBe(0);
    expect(r.width / r.height).toBeCloseTo(4 / 5);
  });

  it("center-crops a tall frame to 4:5", () => {
    const r = cropRectTo45(3000, 5000);
    expect(r.width).toBe(3000);
    expect(r.height).toBe(3750);
    expect(r.originY).toBe(625);
    expect(r.width / r.height).toBeCloseTo(4 / 5);
  });
});
