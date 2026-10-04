/**
 * Renders share-card HTML from the same paint the app component uses.
 * Review only — not a second layout.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  SHARE_COLOURS,
  SHARE_H,
  SHARE_PALETTES,
  SHARE_PREVIEW_H,
  SHARE_PREVIEW_W,
  SHARE_W,
  buildSharePaint,
  type GridCell,
  type ShareCardInput,
  type ShareColourId,
  type ShareItem,
  type ShareStyleId,
  type ShareText,
} from "../lib/share-image";

const CODE = "K7Q2M";

function grid30(): GridCell[] {
  return Array.from({ length: 30 }, (_, i) => {
    if (i === 17) return "today";
    if (i < 12) return "secured";
    if (i < 17) return "missed";
    return "future";
  });
}

function grid7(): GridCell[] {
  return Array.from({ length: 7 }, (_, i) => (i < 6 ? "secured" : "today"));
}

function base(style: ShareStyleId, colour: ShareColourId): ShareCardInput {
  if (style === "A" || style === "B") {
    return {
      style,
      colour,
      challenge: "Show Up 7",
      task: "Go to the gym",
      day: 3,
      durationDays: 7,
      username: "noahb",
      inviteCode: CODE,
      streak: 3,
      cameraSeal: style === "A",
      photoUri: null,
    };
  }
  if (style === "C") {
    return {
      style,
      colour,
      challenge: "10 Pages a Day",
      task: "Read 10 pages",
      day: 3,
      durationDays: 14,
      username: "noahb",
      inviteCode: CODE,
      cameraSeal: false,
    };
  }
  if (style === "D") {
    return {
      style,
      colour,
      challenge: "Iron man",
      day: 18,
      durationDays: 30,
      secured: 12,
      username: "yaseen",
      inviteCode: CODE,
      cells: grid30(),
    };
  }
  if (style === "E") {
    return {
      style,
      colour,
      challenge: "Iron man",
      streak: 7,
      username: "yaseen",
      inviteCode: CODE,
      activeLine: "Iron man · Daily Gratitude",
      dateLabel: "Saturday 3 October",
    };
  }
  if (style === "F") {
    return {
      style,
      colour,
      challenge: "Quick Steps",
      durationDays: 7,
      secured: 6,
      longestStreak: 5,
      username: "yaseen",
      inviteCode: CODE,
      dateRange: "Sep 26–Oct 2",
      cells: grid7(),
    };
  }
  return {
    style,
    colour,
    challenge: "Show Up 7",
    day: 1,
    durationDays: 7,
    username: "noahb",
    inviteCode: CODE,
    proofLine: "7 days · Camera · Gym",
    tasks: [{ title: "Go to the gym", rule: "Camera · At your gym" }],
    membersLine: "Amir, Sami and Noah are in it",
  };
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textHtml(item: ShareText, shadow: string): string {
  const shown = item.caps ? item.text.toUpperCase() : item.text;
  const tracking = item.tracking ? `letter-spacing:${item.tracking}px;` : "";
  return `<div style="color:${item.color};font-size:${item.size}px;line-height:${item.line}px;font-weight:${item.weight};${tracking}font-variant-numeric:${item.weight === "800" ? "tabular-nums" : "normal"};${shadow}">${esc(shown)}</div>`;
}

function itemHtml(item: ShareItem, shadow: string): string {
  if (item.kind === "text") return textHtml(item, shadow);
  if (item.kind === "baseline") {
    return `<div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;">${textHtml(item.lead, shadow)}${textHtml(item.rest, shadow)}</div>`;
  }
  if (item.kind === "row") {
    return `<div style="display:flex;align-items:center;gap:${item.gap}px;">${item.items.map((child) => itemHtml(child, shadow)).join("")}</div>`;
  }
  if (item.kind === "seal") {
    return `<div style="display:flex;align-items:center;gap:16px;"><div style="width:72px;height:72px;border-radius:36px;border:3px solid ${item.color}99;"></div>${textHtml({ kind: "text", text: item.label, size: 36, line: 44, weight: "500", color: item.color }, shadow)}</div>`;
  }
  if (item.kind === "check") {
    return `<div style="width:${item.size}px;height:${item.size}px;border-radius:999px;background:${item.disc};display:flex;align-items:center;justify-content:center;"><svg width="${item.iconSize}" height="${item.iconSize}" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" fill="none" stroke="${item.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  }
  if (item.kind === "flame") {
    return `<svg width="${item.size}" height="${item.size}" viewBox="0 0 24 24" style="display:block;flex:none;"><path fill="${item.color}" d="M12 2s2 3 2 5-1 3-1 3 2 1 3 3 1 6-4 8-6-1-6-4 1-4 1-4-3 2-3 5 2 6 6 6 8-4 8-8-2-6-2-6 3-1 3-4-2-4-2-4z"/></svg>`;
  }
  if (item.kind === "grid") {
    const cells = item.cells
      .map((state) => {
        const secured = state === "secured" || state === "today";
        const bg = secured ? item.accent : state === "held" ? `${item.sub}99` : state === "future" ? item.line : "transparent";
        const border = state === "missed" ? `3px solid ${item.sub}` : state === "today" ? `6px solid ${item.accent}` : "0";
        return `<div style="width:${item.cell}px;height:${item.cell}px;border-radius:${item.radius}px;background:${bg};border:${border};box-sizing:border-box;"></div>`;
      })
      .join("");
    return `<div style="display:flex;flex-wrap:wrap;gap:${item.gap}px;width:${7 * item.cell + 6 * item.gap}px;">${cells}</div>`;
  }
  return `<div style="background:${item.plate};border-radius:40px;padding:28px 36px;">${textHtml({ kind: "text", text: item.title, size: 34, line: 42, weight: "500", color: item.sub }, shadow)}<div style="height:8px"></div>${textHtml({ kind: "text", text: item.link, size: 54, line: 64, weight: "500", color: item.fg }, shadow)}</div>`;
}

export function shareCardHtml(input: ShareCardInput): string {
  const paint = buildSharePaint(input);
  const shadow = paint.block.shadow
    ? `text-shadow:0 0 ${paint.block.shadow.radius}px ${paint.block.shadow.color};`
    : "";
  const plate = paint.block.plate;
  const inner = paint.block.items.map((item) => itemHtml(item, shadow)).join("");
  const block = plate
    ? `<div style="background:${plate.color};border-radius:${plate.radius}px;padding:${plate.pad}px;display:flex;flex-direction:column;gap:${paint.block.gap}px;">${inner}</div>`
    : `<div style="display:flex;flex-direction:column;gap:${paint.block.gap}px;">${inner}</div>`;
  const word = paint.wordmark
    ? `<div style="position:absolute;left:${paint.wordmark.x}px;top:${paint.wordmark.y}px;color:${paint.wordmark.color};font-size:${paint.wordmark.size}px;line-height:${paint.wordmark.size}px;font-weight:600;letter-spacing:${paint.wordmark.tracking}px;">${esc(paint.wordmark.text)}</div>`
    : "";
  const scrim = paint.scrim
    ? `<div style="position:absolute;left:0;right:0;bottom:0;height:1100px;background:linear-gradient(transparent,rgba(15,15,15,0.85));"></div>`
    : "";
  const checker = paint.transparent
    ? "background:repeating-conic-gradient(#3A3833 0 25%,#24221F 0 50%) 0 0/40px 40px;"
    : `background:${paint.background};`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:#111;}
    body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",sans-serif;}
  </style></head><body>
  <div id="card" style="position:relative;width:${paint.width}px;height:${paint.height}px;${checker}overflow:hidden;">
    ${scrim}${word}
    <div style="position:absolute;left:${paint.block.x}px;top:${paint.block.y}px;width:${paint.block.w}px;height:${paint.block.h}px;display:flex;flex-direction:column;justify-content:flex-end;">
      ${block}
    </div>
  </div>
  </body></html>`;
}

export function writeShareReview(dir: string): string[] {
  mkdirSync(dir, { recursive: true });
  const files: string[] = [];
  const styles: ShareStyleId[] = ["A", "B", "C", "D", "E", "F", "G"];
  for (const style of styles) {
    for (const colour of SHARE_COLOURS) {
      const name = `${style}-${colour}.html`;
      const path = resolve(dir, name);
      writeFileSync(path, shareCardHtml(base(style, colour)));
      files.push(path);
    }
  }
  const sheet = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:#000;font-family:-apple-system,sans-serif;color:#F5F3EE;}
    .phone{width:402px;height:874px;background:#0F0F0F;position:relative;overflow:hidden;}
    .header{height:44px;display:flex;align-items:center;padding:54px 8px 0;}
    .title{flex:1;text-align:center;font-size:17px;line-height:22px;font-weight:500;}
    .preview{width:${SHARE_PREVIEW_W}px;height:${SHARE_PREVIEW_H}px;margin:12px auto 0;border-radius:16px;overflow:hidden;border:1px solid #2E2B27;box-shadow:0 10px 30px rgba(0,0,0,0.6);}
    .preview iframe{width:${SHARE_W}px;height:${SHARE_H}px;border:0;transform:scale(${SHARE_PREVIEW_W / SHARE_W});transform-origin:top left;}
    .dots{display:flex;gap:6px;justify-content:center;margin-top:14px;}
    .dot{width:6px;height:6px;border-radius:3px;background:#A39E95;}
    .dot.on{width:18px;background:#F5F3EE;}
    .colours{display:flex;justify-content:center;gap:22px;margin-top:16px;font-size:13px;}
    .swatch{width:28px;height:28px;border-radius:14px;margin:0 auto 6px;box-shadow:0 0 0 2px #F5F3EE,0 0 0 6px rgba(245,243,238,0.35);}
    .field{margin:16px 20px 0;height:44px;border-radius:12px;background:#1A1917;color:#A39E95;display:flex;align-items:center;padding:0 14px;font-size:15px;}
    .targets{position:absolute;left:0;right:0;bottom:34px;display:flex;justify-content:space-evenly;}
    .circle{width:52px;height:52px;border-radius:26px;background:#1A1917;border:1px solid #2E2B27;margin:0 auto 6px;}
    .circle.on{background:#BB471D;border-color:#BB471D;}
    .label{font-size:11px;text-align:center;width:76px;}
  </style></head><body><div class="phone">
    <div class="header"><div style="width:44px;text-align:center;">✕</div><div class="title">Share</div><div style="width:44px"></div></div>
    <div class="preview"><iframe src="./A-ink.html"></iframe></div>
    <div class="dots"><div class="dot on"></div><div class="dot"></div><div class="dot"></div></div>
    <div class="colours">
      <div><div class="swatch" style="background:${SHARE_PALETTES.ink.bg};border:1px solid #2E2B27;"></div>Ink</div>
      <div><div style="width:28px;height:28px;border-radius:14px;background:${SHARE_PALETTES.orange.bg};margin:0 auto 6px;"></div>Orange</div>
      <div><div style="width:28px;height:28px;border-radius:14px;background:${SHARE_PALETTES.white.bg};margin:0 auto 6px;"></div>White</div>
    </div>
    <div class="field">Add a caption (optional)</div>
    <div class="targets">
      <div class="label"><div class="circle on"></div>Instagram Story</div>
      <div class="label"><div class="circle"></div>Save</div>
      <div class="label"><div class="circle"></div>Messages</div>
      <div class="label"><div class="circle"></div>More</div>
    </div>
  </div></body></html>`;
  const sheetPath = resolve(dir, "sheet.html");
  writeFileSync(sheetPath, sheet);
  files.push(sheetPath);
  return files;
}

const out = process.argv[2] ?? resolve(process.cwd(), "tmp/share-review");
const written = writeShareReview(out);
console.log(written.length);
console.log(out);
