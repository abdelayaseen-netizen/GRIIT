import type { El } from "./screen";

function boundsBox(bounds: string): { x1: number; y1: number; x2: number; y2: number } | null {
  const match = bounds.match(/\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/);
  if (!match) return null;
  return { x1: Number(match[1]), y1: Number(match[2]), x2: Number(match[3]), y2: Number(match[4]) };
}

export function boundsHeight(bounds: string): number {
  const box = boundsBox(bounds);
  return box ? Math.abs(box.y2 - box.y1) : 0;
}

function boundsArea(bounds: string): number {
  const box = boundsBox(bounds);
  if (!box) return 0;
  return Math.abs(box.x2 - box.x1) * Math.abs(box.y2 - box.y1);
}

export function screenSize(els: El[]): { w: number; h: number } {
  const roots = els
    .map((el) => boundsBox(el.bounds))
    // SE 375×667 up to Pro Max 440×956; a taller window read as 393×852 sends every tap low and right.
    .filter((box): box is NonNullable<ReturnType<typeof boundsBox>> => Boolean(box && box.x1 <= 0 && box.y1 <= 0 && box.x2 >= 300 && box.y2 >= 560 && box.y2 <= 1000));
  const window = roots.sort((a, b) => b.y2 - a.y2)[0];
  if (window) return { w: window.x2, h: window.y2 };
  return { w: 393, h: 852 };
}

export function centerPoint(bounds: string, size: { w: number; h: number }): string | null {
  const box = boundsBox(bounds);
  if (!box || size.w <= 0 || size.h <= 0) return null;
  const x = Math.min(99, Math.max(1, Math.round((((box.x1 + box.x2) / 2) / size.w) * 100)));
  const y = Math.min(99, Math.max(1, Math.round((((box.y1 + box.y2) / 2) / size.h) * 100)));
  return `${x}%,${y}%`;
}

/** A Maestro point. Rejects 50%,400% and anything outside the screen. */
export function usablePoint(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})%,(\d{1,2})%$/);
  if (!match) return null;
  const x = Number(match[1]);
  const y = Number(match[2]);
  if (x < 1 || y < 1 || x > 99 || y > 99) return null;
  return `${x}%,${y}%`;
}

/** Match a requested label to the real control. A short name hits the longer accessibility label. */
/** Bottom-right, just inside the box: a tap there leaves the caret after the last character of a multiline field. */
export function endPoint(bounds: string, size: { w: number; h: number }): string | null {
  const box = boundsBox(bounds);
  if (!box || size.w <= 0 || size.h <= 0) return null;
  const x = Math.min(99, Math.max(1, Math.floor(((box.x2 - 8) / size.w) * 100)));
  const y = Math.min(99, Math.max(1, Math.floor(((box.y2 - 8) / size.h) * 100)));
  return `${x}%,${y}%`;
}

export function resolveTarget(target: string, els: El[]): { point: string; end: string | null; label: string; value: string; below: boolean } | null {
  const trimmed = target.trim();
  const direct = usablePoint(trimmed);
  if (direct) return { point: direct, end: null, label: trimmed, value: "", below: false };
  const needle = trimmed.toLowerCase();
  if (!needle) return null;
  const matches: { el: El; score: number; height: number }[] = [];
  for (const el of els) {
    const label = (el.a11y || el.text).replace(/\s+/g, " ").trim();
    if (!label) continue;
    const hay = label.toLowerCase();
    if (hay === "passwords" && needle !== "passwords") continue;
    let score = 0;
    if (hay === needle) score = 100;
    else if (hay.startsWith(needle)) score = 90;
    else if (hay.includes(needle)) score = 70;
    if (!score) continue;
    matches.push({ el, score, height: boundsHeight(el.bounds) });
  }
  const strong = matches.filter((item) => item.score >= 90);
  const pool = strong.length ? strong : matches;
  // An exact control (button height) beats a bigger prefix match: on Day 2 the feed card "{task}. Self-reported…"
  // is bigger than the "{task}" button. A small exact caption ("Email" over its field) still loses to the field.
  const exactControls = pool.filter((item) => item.score === 100 && item.height >= 36);
  const ranked = exactControls.length ? exactControls : pool;
  const best = ranked.sort((a, b) => boundsArea(b.el.bounds) - boundsArea(a.el.bounds) || b.score - a.score)[0];
  if (!best) return null;
  const size = screenSize(els);
  const point = centerPoint(best.el.bounds, size);
  if (!point) return null;
  const box = boundsBox(best.el.bounds);
  const below = box ? (box.y1 + box.y2) / 2 > size.h - 8 : false;
  return { point, end: endPoint(best.el.bounds, size), label: (best.el.a11y || best.el.text).replace(/\s+/g, " ").trim(), value: best.el.value, below };
}

export function systemAlert(lines: string[], deny: boolean): string | null {
  const denyLabel = lines.find((line) => /don.?t allow/i.test(line));
  const allow = lines.find((line) => line === "Allow");
  if (!allow || !denyLabel) return null;
  return deny ? denyLabel : allow;
}
