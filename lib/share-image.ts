/**
 * v44.1 share styles A–G at 1080 × 1920.
 * Preview and the saved PNG both render `ShareImage` from this paint.
 * Caption is never part of the paint.
 *
 * Join line: SHARE_JOIN_WEB_ORIGIN stays empty until a public web domain exists.
 * Empty origin prints "Find me on GRIIT · @{username}". A set origin prints
 * "{origin}/i/{id}" from inviteUrl. Never a hard-coded host.
 *
 * Last-picked colour is per style in memory for the open sheet only.
 * profiles.onboarding_answers is the only profile jsonb and it does not fit
 * a share preference. No column is written.
 */
import { streakInARow } from "@/lib/task-complete-toast";
import { addCalendarDaysToDateKey } from "@/lib/date-utils";
import { dayParts, inviteUrl } from "@/lib/story-card";
export const SHARE_W = 1080;
export const SHARE_H = 1920;
export const SHARE_PREVIEW_W = 270;
export const SHARE_PREVIEW_H = 480;
export const SHARE_CONTENT = { x: 96, y: 250, w: 888, h: 1330 } as const;
export const SHARE_WORDMARK = "GRIIT";

/** Public origin, no trailing slash. Empty until a web domain exists. */
export const SHARE_JOIN_WEB_ORIGIN = "";

export const SHARE_SHEET_TITLE = "Share";
export const SHARE_INVITE_TITLE = "Invite";
export const SHARE_CAPTION_PLACEHOLDER = "Add a caption (optional)";
export const SHARE_TARGET_STORY = "Instagram Story";
export const SHARE_TARGET_COPY = "Copy sticker";
export const SHARE_TARGET_SAVE = "Save";
export const SHARE_TARGET_MESSAGES = "Messages";
export const SHARE_TARGET_MORE = "More";

export type ShareStyleId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ShareColourId = "ink" | "orange" | "white";
export type ShareMoment =
  | "photo_proof"
  | "self_reported"
  | "day_secured"
  | "challenge_finished"
  | "invite";

export type GridCell = "secured" | "held" | "missed" | "today" | "future";

export type SharePalette = {
  id: ShareColourId;
  label: string;
  bg: string;
  fg: string;
  sub: string;
  accent: string;
  line: string;
};

export const SHARE_PALETTES: Record<ShareColourId, SharePalette> = {
  ink: {
    id: "ink",
    label: "Ink",
    bg: "#0F0F0F",
    fg: "#F5F3EE",
    sub: "#A39E95",
    accent: "#DC5401",
    line: "#2E2B27",
  },
  orange: {
    id: "orange",
    label: "Orange",
    bg: "#DC5401",
    fg: "#0F0F0F",
    sub: "#3A1405",
    accent: "#0F0F0F",
    line: "rgba(15,15,15,0.25)",
  },
  white: {
    id: "white",
    label: "White",
    bg: "#F5F3EE",
    fg: "#0F0F0F",
    sub: "#5E5A54",
    accent: "#DC5401",
    line: "#D9D5CC",
  },
};

export const SHARE_COLOURS: ShareColourId[] = ["ink", "orange", "white"];

export const MOMENT_STYLES: Record<ShareMoment, readonly ShareStyleId[]> = {
  photo_proof: ["A", "B", "D"],
  self_reported: ["C", "B", "D"],
  day_secured: ["E", "D", "B"],
  challenge_finished: ["F", "D"],
  invite: ["G"],
};

export type ColourMemory = Partial<Record<ShareStyleId, ShareColourId>>;

export type ShareCardInput = {
  style: ShareStyleId;
  colour: ShareColourId;
  challenge: string;
  task?: string;
  day?: number;
  durationDays?: number;
  username?: string | null;
  inviteCode?: string | null;
  streak?: number;
  secured?: number;
  longestStreak?: number;
  activeLine?: string;
  dateLabel?: string;
  dateRange?: string;
  photoUri?: string | null;
  cameraSeal?: boolean;
  rule?: string;
  proofLine?: string;
  tasks?: { title: string; rule: string }[];
  membersLine?: string;
  cells?: GridCell[];
};

export type ShareText = {
  kind: "text";
  text: string;
  size: number;
  line: number;
  weight: "500" | "600" | "700" | "800";
  color: string;
  tracking?: number;
  caps?: boolean;
};

export type ShareItem =
  | ShareText
  | { kind: "baseline"; lead: ShareText; rest: ShareText }
  | { kind: "seal"; label: string; color: string }
  | { kind: "check"; disc: string; icon: string; size: number; iconSize: number }
  | { kind: "flame"; size: number; color: string }
  | { kind: "row"; gap: number; items: ShareItem[] }
  | {
      kind: "grid";
      cells: GridCell[];
      cell: number;
      gap: number;
      radius: number;
      accent: string;
      sub: string;
      line: string;
    }
  | { kind: "link"; title: string; link: string; fg: string; sub: string; plate: string };

export type SharePaint = {
  width: number;
  height: number;
  background: string;
  transparent: boolean;
  photo: boolean;
  scrim: boolean;
  wordmark: { text: string; x: number; y: number; size: number; color: string; tracking: number } | null;
  block: {
    x: number;
    y: number;
    w: number;
    h: number;
    plate: { color: string; radius: number; pad: number } | null;
    gap: number;
    shadow: { color: string; radius: number } | null;
    items: ShareItem[];
  };
};

export function stylesForMoment(moment: ShareMoment): readonly ShareStyleId[] {
  return MOMENT_STYLES[moment];
}

export function defaultStyle(moment: ShareMoment): ShareStyleId {
  return MOMENT_STYLES[moment][0] ?? "A";
}

export function colourForStyle(memory: ColourMemory, style: ShareStyleId): ShareColourId {
  return memory[style] ?? "ink";
}

export function rememberColour(
  memory: ColourMemory,
  style: ShareStyleId,
  colour: ShareColourId,
): ColourMemory {
  return { ...memory, [style]: colour };
}

/** No origin: username line. Origin set: invite URL with the challenge id. */
export function shareJoinLine(args: {
  username?: string | null;
  inviteId?: string | null;
  origin?: string;
}): string {
  const base = (args.origin ?? SHARE_JOIN_WEB_ORIGIN).trim().replace(/\/$/, "");
  if (base) {
    const id = args.inviteId?.trim() ?? "";
    if (!id) return "";
    return inviteUrl(base, id);
  }
  const name = args.username?.trim().replace(/^@/, "") ?? "";
  if (!name) return "";
  return `Find me on GRIIT · @${name}`;
}

export function shareMessageBody(caption: string, joinLine: string): string {
  const cap = caption.trim();
  return cap || joinLine;
}

export function storyUsesSticker(style: ShareStyleId): boolean {
  return style === "B";
}

export function shareDateLabel(date = new Date()): string {
  const raw = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return raw.replace(",", "");
}

export function atUser(username: string | null | undefined): string {
  const name = username?.trim().replace(/^@/, "") ?? "";
  return name ? `@${name}` : "";
}

export function defaultGrid(input: {
  durationDays?: number;
  secured?: number;
  day?: number;
}): GridCell[] {
  const n = Math.max(0, Math.floor(input.durationDays ?? 0));
  if (!n) return [];
  const secured = Math.max(0, Math.min(n, Math.floor(input.secured ?? 0)));
  const today = Math.max(0, Math.min(n - 1, Math.floor((input.day ?? 1) - 1)));
  return Array.from({ length: n }, (_, i) => {
    if (i === today) return "today";
    if (i < secured) return "secured";
    if (i < today) return "missed";
    return "future";
  });
}

/** Squares for one enrollment. Done, missed, held, and future come from that enrollment's dates. */
export function shareDayCells(input: {
  startDateKey: string;
  durationDays: number;
  todayKey: string;
  securedDateKeys: readonly string[];
  frozenDateKeys?: readonly string[];
}): GridCell[] {
  const total = Math.max(0, Math.min(90, Math.floor(input.durationDays)));
  if (!total || !input.startDateKey || !input.todayKey) return [];
  const secured = new Set(input.securedDateKeys);
  const frozen = new Set(input.frozenDateKeys ?? []);
  const cells: GridCell[] = [];
  for (let i = 0; i < total; i += 1) {
    const key = addCalendarDaysToDateKey(input.startDateKey, i);
    if (key > input.todayKey) cells.push("future");
    else if (secured.has(key)) cells.push("secured");
    else if (frozen.has(key)) cells.push("held");
    else if (key === input.todayKey) cells.push("today");
    else cells.push("missed");
  }
  return cells;
}

export function gridMetrics(count: number): { cell: number; gap: number; radius: number } {
  const cols = 7;
  const rows = Math.max(1, Math.ceil(Math.max(count, 1) / cols));
  let cell = 104;
  let gap = 14;
  const width = () => cols * cell + (cols - 1) * gap;
  const height = () => rows * cell + (rows - 1) * gap;
  if (width() > SHARE_CONTENT.w) {
    const scale = SHARE_CONTENT.w / width();
    cell = Math.floor(cell * scale);
    gap = Math.floor(gap * scale);
  }
  const maxH = 640;
  if (height() > maxH) {
    const scale = maxH / height();
    cell = Math.max(18, Math.floor(cell * scale));
    gap = Math.max(4, Math.floor(gap * scale));
  }
  return { cell, gap, radius: Math.max(6, Math.round(cell * (22 / 104))) };
}

function text(
  value: string,
  size: number,
  line: number,
  color: string,
  weight: ShareText["weight"] = "500",
  tracking?: number,
): ShareText {
  return { kind: "text", text: value, size, line, weight, color, tracking };
}

function caps(value: string, size: number, line: number, color: string): ShareText {
  return { ...text(value, size, line, color, "500", size * 0.06), caps: true };
}

function stickerShadow(colour: ShareColourId): { color: string; radius: number } {
  if (colour === "white") return { color: "rgba(15,15,15,0.6)", radius: 18 };
  if (colour === "orange") return { color: "rgba(15,15,15,0.5)", radius: 18 };
  return { color: "rgba(245,243,238,0.55)", radius: 18 };
}

function checkDisc(colour: ShareColourId): string {
  if (colour === "orange") return "rgba(15,15,15,0.12)";
  if (colour === "white") return "#F8E3D5";
  return "#3A1F10";
}

function dayRow(day: number, of: number, daySize: number, color: string, restColor: string): ShareItem {
  const parts = dayParts(day, of);
  return {
    kind: "baseline",
    lead: text(`Day ${parts.day}`, daySize, daySize, color, "700", daySize * -0.025),
    rest: text(`of ${parts.of}`, 60, 64, restColor, "500"),
  };
}

function joinItem(input: ShareCardInput, color: string): ShareItem | null {
  const line = shareJoinLine({ username: input.username, inviteId: input.inviteCode });
  if (!line) return null;
  return text(line, 30, 38, color, "500");
}

function userItem(input: ShareCardInput, color: string): ShareItem | null {
  const user = atUser(input.username);
  if (!user) return null;
  return text(user, 36, 44, color, "500");
}

function cellsFor(input: ShareCardInput): GridCell[] {
  if (input.cells && input.cells.length > 0) return input.cells;
  return defaultGrid({
    durationDays: input.durationDays,
    secured: input.secured ?? (input.day ? Math.max(0, input.day) : 0),
    day: input.day,
  });
}

export function buildSharePaint(input: ShareCardInput): SharePaint {
  const palette = SHARE_PALETTES[input.colour];
  const box = SHARE_CONTENT;
  const day = input.day ?? 1;
  const total = input.durationDays ?? day;
  const challenge = input.challenge.trim() || "Challenge";
  const task = input.task?.trim() ?? "";
  const base: SharePaint = {
    width: SHARE_W,
    height: SHARE_H,
    background: palette.bg,
    transparent: false,
    photo: false,
    scrim: false,
    wordmark: {
      text: SHARE_WORDMARK,
      x: 96,
      y: 270,
      size: 40,
      color: input.style === "A" ? "#F5F3EE" : palette.fg,
      tracking: 40 * 0.14,
    },
    block: {
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      plate: null,
      gap: 24,
      shadow: null,
      items: [],
    },
  };

  const push = (item: ShareItem | null) => {
    if (item) base.block.items.push(item);
  };

  if (input.style === "A") {
    base.photo = true;
    base.scrim = true;
    base.background = "#4A4237";
    base.block.plate = { color: palette.bg, radius: 40, pad: 48 };
    push(caps(challenge, 36, 44, palette.sub));
    if (task) push(text(task, 56, 66, palette.fg));
    push(dayRow(day, total, 150, palette.fg, palette.fg));
    if (input.cameraSeal) push({ kind: "seal", label: "Camera", color: palette.fg });
    push(userItem(input, palette.fg));
    push(joinItem(input, "#F5F3EE"));
    return base;
  }

  if (input.style === "B") {
    const color = "#F5F3EE";
    base.transparent = true;
    base.background = "transparent";
    base.wordmark = null;
    base.block.shadow = stickerShadow(input.colour);
    push(caps(challenge, 40, 48, color));
    push(dayRow(day, total, 170, color, color));
    push({
      kind: "row",
      gap: 16,
      items: [
        { kind: "flame", size: 64, color: "#DC5401" },
        text(String(input.streak ?? 0), 56, 62, color, "700", 56 * -0.025),
        text(streakInARow(input.streak ?? 0), 36, 44, color, "500"),
      ],
    });
    if (input.cameraSeal) push({ kind: "seal", label: "Camera", color });
    push(text(SHARE_WORDMARK, 44, 52, color, "600", 44 * 0.14));
    push(joinItem(input, color));
    return base;
  }

  if (input.style === "C") {
    push({
      kind: "check",
      disc: checkDisc(input.colour),
      icon: palette.fg,
      size: 140,
      iconSize: 76,
    });
    push(caps(challenge, 40, 48, palette.sub));
    if (task) push(text(task, 96, 108, palette.fg));
    push(dayRow(day, total, 150, palette.fg, palette.fg));
    push(text("Self-reported", 38, 46, palette.sub));
    push(userItem(input, palette.fg));
    if (input.rule?.trim()) push(text(input.rule.trim(), 34, 42, palette.sub));
    push(joinItem(input, palette.fg));
    return base;
  }

  if (input.style === "D" || input.style === "F") {
    const cells = cellsFor(input);
    const metrics = gridMetrics(cells.length);
    if (input.style === "F") {
      push(caps("Finished", 36, 44, palette.accent));
      push(text(challenge, 96, 108, palette.fg));
      const secured = input.secured ?? 0;
      push({
        kind: "baseline",
        lead: text(String(secured), 200, 190, palette.fg, "800"),
        rest: text(`of ${total} days secured`, 44, 52, palette.fg, "500"),
      });
      push({
        kind: "row",
        gap: 16,
        items: [
          { kind: "flame", size: 44, color: palette.accent },
          text(`Longest streak ${input.longestStreak ?? 0} days`, 44, 52, palette.fg),
        ],
      });
    } else {
      push(caps(challenge, 40, 48, palette.sub));
      const secured = input.secured ?? 0;
      push({
        kind: "baseline",
        lead: text(String(secured), 170, 170, palette.fg, "800"),
        rest: text(`of ${total} days`, 60, 64, palette.fg, "500"),
      });
    }
    if (cells.length) {
      push({
        kind: "grid",
        cells,
        cell: metrics.cell,
        gap: metrics.gap,
        radius: metrics.radius,
        accent: palette.accent,
        sub: palette.sub,
        line: palette.line,
      });
    }
    if (input.style === "D") push(text(`Day ${day} of ${total}`, 36, 44, palette.fg));
    if (input.style === "F" && input.dateRange?.trim()) {
      push(text(input.dateRange.trim(), 34, 42, palette.sub));
    }
    push(userItem(input, palette.fg));
    push(joinItem(input, palette.fg));
    return base;
  }

  if (input.style === "E") {
    push({ kind: "flame", size: 140, color: palette.accent });
    push(text(String(input.streak ?? 0), 520, 470, palette.fg, "800", -0.02 * 520));
    push(text(streakInARow(input.streak ?? 0), 72, 84, palette.fg));
    if (input.activeLine?.trim()) push(text(input.activeLine.trim(), 38, 46, palette.sub));
    const date = input.dateLabel?.trim() || shareDateLabel();
    const user = atUser(input.username);
    push(text(user ? `${date} · ${user}` : date, 36, 44, palette.fg));
    push(joinItem(input, palette.fg));
    return base;
  }

  const proof = input.proofLine?.trim() || `${total} days`;
  push(caps("Join my challenge", 44, 52, palette.accent));
  push(text(challenge, 120, 128, palette.fg));
  push(text(proof, 48, 56, palette.sub));
  for (const row of input.tasks ?? []) {
    push(text(row.title, 48, 56, palette.fg));
    if (row.rule.trim()) push(text(row.rule.trim(), 34, 42, palette.sub));
  }
  if (!input.tasks?.length && task) {
    push(text(task, 48, 56, palette.fg));
    if (input.rule?.trim()) push(text(input.rule.trim(), 34, 42, palette.sub));
  }
  if (input.membersLine?.trim()) push(text(input.membersLine.trim(), 36, 44, palette.fg));
  const link = shareJoinLine({ username: input.username, inviteId: input.inviteCode });
  if (link) {
    push({
      kind: "link",
      title: "",
      link,
      fg: palette.fg,
      sub: palette.sub,
      plate: input.colour === "ink" ? "#1A1917" : "rgba(15,15,15,0.08)",
    });
  }
  const from = atUser(input.username);
  if (from && link.startsWith("Join me ·")) push(text(`from ${from}`, 34, 42, palette.sub));
  return base;
}

export function paintStrings(paint: SharePaint): string[] {
  const out: string[] = [];
  const walk = (item: ShareItem) => {
    if (item.kind === "text") out.push(item.caps ? item.text.toUpperCase() : item.text);
    else if (item.kind === "baseline") {
      walk(item.lead);
      walk(item.rest);
    } else if (item.kind === "row") item.items.forEach(walk);
    else if (item.kind === "seal") out.push(item.label);
    else if (item.kind === "link") {
      if (item.title) out.push(item.title);
      if (item.link) out.push(item.link);
    }
  };
  if (paint.wordmark) out.push(paint.wordmark.text);
  paint.block.items.forEach(walk);
  return out;
}
