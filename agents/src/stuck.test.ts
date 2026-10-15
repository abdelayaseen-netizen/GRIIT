import zlib from "zlib";
import { describe, expect, it } from "vitest";
import { parseHierarchy, visibleLines } from "./screen";
import { nextShotStreak, nextStreak, selectedChip, mayQuit } from "./stuck";
import { samplePng, visualSame } from "./pixels";

function png(w: number, h: number, paint: (x: number, y: number) => [number, number, number]): Buffer {
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b] = paint(x, y);
      raw[row + 1 + x * 3] = r;
      raw[row + 1 + x * 3 + 1] = g;
      raw[row + 1 + x * 3 + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const chunk = (type: string, data: Buffer) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, "ascii");
    data.copy(out, 8);
    const crc = zlib.crc32(Buffer.concat([Buffer.from(type), data]));
    out.writeUInt32BE(crc >>> 0, 8 + data.length);
    return out;
  };
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]);
}

describe("stuck screens", () => {
  it("does not count a scroll that changes the picture", () => {
    const top = png(80, 80, (x, y) => (y < 8 ? [x, 0, 0] : [10, 10, 10]));
    const scrolled = png(80, 80, (x, y) => (y < 8 ? [x, 0, 0] : y < 40 ? [200, 200, 200] : [10, 10, 10]));
    const a = samplePng(top);
    const b = samplePng(scrolled);
    expect(visualSame(a, b)).toBe(false);
    expect(nextStreak({ text: "Discover|Fitness", visual: b, lastText: "Discover|Fitness", lastVisual: a, streak: 2, ignore: false })).toBe(1);
  });

  it("still stops when the picture and the labels stay the same", () => {
    const shot = png(80, 80, () => [20, 20, 20]);
    const visual = samplePng(shot);
    expect(visualSame(visual, samplePng(shot))).toBe(true);
    expect(nextStreak({ text: "Discover", visual, lastText: "Discover", lastVisual: visual, streak: 2, ignore: false })).toBe(3);
  });

  it("ignores a clock change in the status bar", () => {
    const first = png(80, 80, (x, y) => (y < 6 ? [x, 1, 1] : [30, 30, 30]));
    const later = png(80, 80, (x, y) => (y < 6 ? [255 - x, 2, 2] : [30, 30, 30]));
    expect(visualSame(samplePng(first), samplePng(later))).toBe(true);
  });

  it("counts three unchanged screenshots and ignores the screen name", () => {
    const shot = png(80, 80, () => [20, 20, 20]);
    const visual = samplePng(shot);
    expect(nextShotStreak({ visual, lastVisual: visual, streak: 2, ignore: false })).toBe(3);
    const moved = samplePng(png(80, 80, (x, y) => (y < 40 ? [200, 0, 0] : [20, 20, 20])));
    expect(nextShotStreak({ visual: moved, lastVisual: visual, streak: 2, ignore: false })).toBe(0);
    expect(mayQuit(14, false)).toBe(false);
    expect(mayQuit(15, false)).toBe(true);
    expect(mayQuit(2, true)).toBe(true);
  });

  it("tells the agent a selected chip is already selected and does not count that tap", () => {
    const raw = JSON.stringify({
      elements: [
        { b: "[16,120][90,160]", txt: "Faith", a11y: "Faith", selected: true },
        { b: "[100,120][180,160]", txt: "Fitness", a11y: "Fitness" },
      ],
    });
    const els = parseHierarchy(raw);
    expect(visibleLines(els)).toContain("Faith (selected)");
    expect(selectedChip("Faith", els)).toBe("Faith");
    expect(selectedChip("Fitness", els)).toBeNull();
    expect(selectedChip("Filter by Faith", [{ text: "", a11y: "Filter by Faith", id: "", bounds: "", value: "", selected: true }])).toBe("Faith");
    expect(nextStreak({ text: "same", visual: null, lastText: "same", lastVisual: null, streak: 2, ignore: true })).toBe(1);
  });
});
