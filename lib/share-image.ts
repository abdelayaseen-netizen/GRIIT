/**
 * v44.1 share styles A–G at 1080 × 1920.
 * Preview and the saved PNG both render `ShareImage` from this paint.
 * Caption is never part of the paint.
 *
 * Join line: SHARE_JOIN_WEB_ORIGIN stays empty until a public web domain exists.
 * With no host, the line is "@{username}". INVITE_BASE, or a passed origin,
 * prints "@{username} · {base}/i/{id}". Never a hard-coded host.
 *
 * Last-picked colour is per style in memory for the open sheet only.
 * profiles.onboarding_answers is the only profile jsonb and it does not fit
 * a share preference. No column is written.
 */
import { INVITE_BASE } from "@/lib/config";
import { streakInARow } from "@/lib/task-complete-toast";
import { addCalendarDaysToDateKey } from "@/lib/date-utils";
import { formatDays } from "@/lib/format-days";
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

/**
 * A photo proof · B transparent glow sticker (build 90 04.6: no moment reaches it) ·
 * C self-reported check · D progress grid · E streak · F finished · G invite ·
 * H day stamp (build 90 04.6).
 */
export type ShareStyleId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "photo" | "week" | "glow" | "ring";
export type ShareColourId = "ink" | "orange" | "white";

/** Build 92 05: the four stickers of Part 1.3. Photo and Week strip are free; the transparent two are GRIIT Pro. */
export type StickerStyleKey = "photo" | "week" | "glow" | "ring";
export const STICKER_STYLES = [
  { key: "photo", label: "Photo", pro: false, transparent: false },
  { key: "week", label: "Week strip", pro: false, transparent: false },
  { key: "glow", label: "Streak glow", pro: true, transparent: true },
  { key: "ring", label: "Progress ring", pro: true, transparent: true },
] as const satisfies readonly { key: StickerStyleKey; label: string; pro: boolean; transparent: boolean }[];
export const STICKER_FREE = "Free";
export const STICKER_PRO = "GRIIT Pro";
export const STICKER_UNLOCK = "Unlock with GRIIT Pro";
export const STICKER_PLAIN_CARD = "plain card";
/** Footer word ("@{handle} · GRIIT", or "GRIIT" with no handle). A word on a picture, not a link. */
export const STICKER_FOOTER_WORD = "GRIIT";
export type ProofSource = "camera" | "strava" | "self";

export function isStickerStyle(id: ShareStyleId): id is StickerStyleKey {
  return STICKER_STYLES.some((s) => s.key === id);
}

export function stickerStyleMeta(id: ShareStyleId): { key: string; label: string; pro: boolean; transparent: boolean } {
  return STICKER_STYLES.find((s) => s.key === id) ?? { key: id, label: "", pro: false, transparent: id === "B" };
}

/** "Photo · plain card" when there is no proof photo (P1-14). */
export function stickerStyleLabel(id: ShareStyleId, hasPhoto: boolean): string {
  const meta = stickerStyleMeta(id);
  if (id === "photo" && !hasPhoto) return `${meta.label} · ${STICKER_PLAIN_CARD}`;
  return meta.label;
}

/** Verified only for camera or Strava proof; everything else is Self-reported. */
export function stickerMark(input: { proofSource?: ProofSource | null; cameraSeal?: boolean }): "Verified" | "Self-reported" {
  const source = input.proofSource ?? (input.cameraSeal ? "camera" : "self");
  return source === "camera" || source === "strava" ? "Verified" : "Self-reported";
}

/** The last 7 days ending today: from the challenge cells when known, else the streak. */
export function weekStripCells(input: { cells?: readonly GridCell[]; streak?: number | null }): boolean[] {
  const cells = input.cells ?? [];
  const todayIndex = cells.findIndex((c) => c === "today");
  if (cells.length > 0) {
    const end = todayIndex >= 0 ? todayIndex : cells.length - 1;
    const out: boolean[] = [];
    for (let i = end - 6; i <= end; i += 1) {
      const cell = i >= 0 ? cells[i] : undefined;
      out.push(cell === "secured" || cell === "today" || cell === "held");
    }
    return out;
  }
  const streak = Math.max(0, Math.floor(input.streak ?? 0));
  return Array.from({ length: 7 }, (_, i) => 7 - i <= streak);
}
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

/**
 * Build 90 04.6: four different stickers, not colour variants of one.
 * 1 Day stamp (H) · 2 Streak (E, hidden at 0) · 3 Progress (D) · 4 Photo proof (A, only with a photo).
 * The glow / landscape sticker (B) is gone from every moment.
 */
export const MOMENT_STYLES: Record<ShareMoment, readonly ShareStyleId[]> = {
  // Build 92 05.1: Photo · Week strip · Streak glow · Progress ring, always all four (P1-12 … P1-17).
  photo_proof: ["photo", "week", "glow", "ring"],
  self_reported: ["photo", "week", "glow", "ring"],
  day_secured: ["photo", "week", "glow", "ring"],
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
  /** Days due so far. The "of N days" fraction uses this, not the full length. */
  due?: number;
  longestStreak?: number;
  activeLine?: string;
  dateLabel?: string;
  dateRange?: string;
  photoUri?: string | null;
  cameraSeal?: boolean;
  /** Build 92 05.4: camera or Strava → "Verified"; else "Self-reported". Falls back to cameraSeal. */
  proofSource?: ProofSource | null;
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
  | { kind: "link"; title: string; link: string; fg: string; sub: string; plate: string }
  /** Build 92 05: Verified / Self-reported with its small mark. */
  | { kind: "mark"; label: "Verified" | "Self-reported"; color: string; size: number }
  /** M T W T F S S with done discs. `done` is the disc fill, `tick` the check colour, `empty` the open ring. */
  | { kind: "week"; days: boolean[]; done: string; tick: string; empty: string; letter: string; size: number }
  /** A flame with a soft orange glow behind it (ink flame on the Orange plate, no glow). */
  | { kind: "glowflame"; size: number; color: string; glow: string | null }
  /** Progress ring: stroke is the type colour, never orange. */
  | { kind: "ring"; size: number; width: number; progress: number; stroke: string; track: string; items: ShareItem[] };

export type SharePaint = {
  width: number;
  height: number;
  background: string;
  transparent: boolean;
  photo: boolean;
  /** Build 92 05: the photo sits in this inset frame instead of full bleed (White / Orange Photo card). */
  photoFrame?: { x: number; y: number; w: number; h: number; radius: number } | null;
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
    justify: "flex-start" | "center" | "flex-end";
    items: ShareItem[];
  };
};

/**
 * The cards for a moment. The Streak card needs a streak of 1 or more; the Photo
 * card needs the user's own photo. With no facts given, the full list comes back.
 */
export function stylesForMoment(
  moment: ShareMoment,
  facts?: { streak?: number | null; hasPhoto?: boolean },
): readonly ShareStyleId[] {
  const all = MOMENT_STYLES[moment];
  if (!facts) return all;
  const streak = typeof facts.streak === "number" && Number.isFinite(facts.streak) ? Math.floor(facts.streak) : 0;
  return all.filter((id) => {
    if (id === "E" && (moment === "photo_proof" || moment === "self_reported")) return streak >= 1;
    if (id === "A") return facts.hasPhoto === true;
    return true;
  });
}

export function defaultStyle(moment: ShareMoment): ShareStyleId {
  return MOMENT_STYLES[moment][0] ?? "A";
}

/** Build 90 04.6: "Copy sticker" copies the painted PNG of any card. */
export function copyStickerAvailable(_style: ShareStyleId): boolean {
  return true;
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

/** "@handle · {base}/i/{code}". The handle is not repeated when the link is missing. */
export function shareJoinLine(args: {
  username?: string | null;
  inviteId?: string | null;
  origin?: string;
}): string {
  const name = args.username?.trim().replace(/^@/, "") ?? "";
  const base = (args.origin ?? INVITE_BASE ?? SHARE_JOIN_WEB_ORIGIN).trim().replace(/\/$/, "");
  const id = args.inviteId?.trim() ?? "";
  const link = base && id ? inviteUrl(base, id) : "";
  const handle = name ? `@${name}` : "";
  if (handle && link) return `${handle} · ${link}`;
  return handle || link;
}

export function shareMessageBody(caption: string, joinLine: string): string {
  const cap = caption.trim();
  return cap || joinLine;
}

/**
 * Build 90 04.6 follow-up: every card is a sticker. Instagram Story gets the PNG as
 * `stickerImage` over the palette background, never as a full-bleed `backgroundImage`.
 */
/**
 * Build 92 05.5: view-shot sizes in points × the device scale. This target gives exactly
 * SHARE_W × SHARE_H pixels on any device (3× → 360×640 pt, 2× → 540×960 pt).
 */
export function storyShotSize(scale: number): { width: number; height: number } {
  const s = scale > 0 ? scale : 1;
  return { width: SHARE_W / s, height: SHARE_H / s };
}

export function storyUsesSticker(_style: ShareStyleId): boolean {
  return true;
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

function cellsFor(input: ShareCardInput): GridCell[] {
  if (input.cells && input.cells.length > 0) return input.cells;
  return defaultGrid({
    durationDays: input.durationDays,
    secured: input.secured ?? (input.day ? Math.max(0, input.day) : 0),
    day: input.day,
  });
}

const INK = "#0F0F0F";
const PAPER = "#F5F3EE";
const FLAME = "#DC5401";

function stickerFooter(input: ShareCardInput, color: string): ShareItem {
  const handle = atUser(input.username);
  return text(handle ? `${handle} · ${STICKER_FOOTER_WORD}` : STICKER_FOOTER_WORD, 30, 38, color, "500");
}

function markItem(input: ShareCardInput, color: string): ShareItem {
  return { kind: "mark", label: stickerMark(input), color, size: 34 };
}

/** Type colour of a transparent sticker: ink over a bright photo, paper over a dark one, ink on the Orange plate. */
function transparentType(colour: ShareColourId): string {
  return colour === "white" ? PAPER : INK;
}

function alpha(color: string, a: number): string {
  if (color === INK) return `rgba(15,15,15,${a})`;
  if (color === PAPER) return `rgba(245,243,238,${a})`;
  return color;
}

/**
 * Build 92 05: Photo · Week strip · Streak glow · Progress ring per theme, under the orange rule.
 * Ink: orange only on the flame and the done checks. White: orange only on the flame.
 * Orange: orange ground / plate, ink type, ink flame. The ring stroke is the type colour.
 */
function paintSticker(
  base: SharePaint,
  input: ShareCardInput,
  palette: SharePalette,
  facts: { day: number; total: number; challenge: string; task: string },
): void {
  const push = (item: ShareItem | null) => {
    if (item) base.block.items.push(item);
  };
  const { day, total, challenge, task } = facts;
  const streak = Math.max(0, Math.floor(input.streak ?? 0));
  base.wordmark = null;
  base.block.gap = 20;

  if (input.style === "photo") {
    if (input.photoUri) {
      base.photo = true;
      if (input.colour === "ink") {
        base.scrim = true;
        base.background = INK;
        push(text(`Day ${day}`, 200, 200, PAPER, "800", -0.025 * 200));
        push(text(`${challenge} · Day ${day} of ${total}`, 44, 54, PAPER, "500"));
        push(markItem(input, PAPER));
        push(stickerFooter(input, alpha(PAPER, 0.8)));
        return;
      }
      base.photoFrame = { x: 96, y: 150, w: 888, h: 1090, radius: 48 };
      base.block.y = 1290;
      base.block.h = SHARE_H - 1290 - 120;
      base.block.justify = "flex-start";
      push(text(`Day ${day}`, 200, 200, palette.fg, "800", -0.025 * 200));
      push(text(`${challenge} · Day ${day} of ${total}`, 44, 54, palette.fg, "500"));
      push(markItem(input, palette.fg));
      push(stickerFooter(input, palette.sub));
      return;
    }
    // 05.2: no proof photo → a plain card in the theme colour. Never a stock photo.
    push(text(challenge, 40, 48, palette.sub, "500"));
    push(text(`Day ${day}`, 260, 250, palette.fg, "800", -0.025 * 260));
    push(text(task ? `${task} · done` : `Day ${day} of ${total}`, 48, 58, palette.fg, "500"));
    push(markItem(input, palette.fg));
    push(stickerFooter(input, palette.sub));
    return;
  }

  if (input.style === "week") {
    const flame = input.colour === "orange" ? INK : FLAME;
    const done = input.colour === "ink" ? FLAME : INK;
    const tick = input.colour === "ink" ? INK : input.colour === "white" ? PAPER : palette.bg;
    base.block.justify = "center";
    push({
      kind: "row",
      gap: 24,
      items: [{ kind: "flame", size: 120, color: flame }, text(String(streak), 300, 290, palette.fg, "800", -0.03 * 300)],
    });
    push(text(streakInARow(streak), 64, 76, palette.fg, "500"));
    push({
      kind: "week",
      days: weekStripCells({ cells: input.cells, streak }),
      done,
      tick,
      empty: palette.line,
      letter: palette.sub,
      size: 96,
    });
    push(markItem(input, palette.fg));
    push(stickerFooter(input, palette.sub));
    return;
  }

  // Transparent stickers.
  base.transparent = true;
  base.background = "transparent";
  base.block.justify = "center";
  const type = transparentType(input.colour);
  const onPlate = input.colour === "orange";
  if (onPlate) {
    base.block.plate = { color: FLAME, radius: 72, pad: 96 };
    base.block.x = 140;
    base.block.w = SHARE_W - 280;
  } else {
    base.block.shadow = stickerShadow(input.colour);
  }

  if (input.style === "glow") {
    push({ kind: "glowflame", size: 200, color: onPlate ? INK : FLAME, glow: onPlate ? null : "rgba(220,84,1,0.55)" });
    push(text(String(streak), 440, 420, type, "800", -0.03 * 440));
    push(text(streakInARow(streak), 72, 84, type, "500"));
    push(markItem(input, type));
    push(stickerFooter(input, alpha(type, 0.8)));
    return;
  }

  // ring
  const progress = total > 0 ? Math.max(0, Math.min(1, day / total)) : 0;
  push({
    kind: "ring",
    size: 640,
    width: 30,
    progress,
    stroke: type,
    track: alpha(type, 0.18),
    items: [text(`Day ${day}`, 140, 150, type, "800", -0.025 * 140), text(`of ${total}`, 48, 56, type, "500")],
  });
  push(text(challenge, 60, 72, type, "500"));
  push(markItem(input, type));
  push(stickerFooter(input, alpha(type, 0.8)));
}

export function buildSharePaint(input: ShareCardInput): SharePaint {
  const palette = SHARE_PALETTES[input.colour];
  const box = SHARE_CONTENT;
  const day = input.day ?? 1;
  const total = input.durationDays ?? day;
  const due = input.due ?? total;
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
      justify: "flex-end",
      items: [],
    },
  };

  const push = (item: ShareItem | null) => {
    if (item) base.block.items.push(item);
  };

  if (isStickerStyle(input.style)) {
    paintSticker(base, input, palette, { day, total, challenge, task });
    return base;
  }

  if (input.style === "A") {
    base.photo = true;
    base.scrim = true;
    base.background = "#4A4237";
    base.block.plate = { color: palette.bg, radius: 40, pad: 48 };
    push(caps(challenge, 36, 44, palette.sub));
    if (task) push(text(task, 56, 66, palette.fg));
    push(dayRow(day, total, 150, palette.fg, palette.fg));
    if (input.cameraSeal) push({ kind: "seal", label: "Camera", color: palette.fg });
    push(joinItem(input, "#F5F3EE"));
    return base;
  }

  if (input.style === "H") {
    // Day stamp: the challenge, the task and the day on a plain Ink / Orange / White ground.
    push(caps(challenge, 40, 48, palette.sub));
    if (task) push(text(task, 64, 74, palette.fg));
    push(dayRow(day, total, 200, palette.fg, palette.fg));
    if (input.cameraSeal) push({ kind: "seal", label: "Camera", color: palette.fg });
    push(joinItem(input, palette.fg));
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
        rest: text(`of ${formatDays(due)} secured`, 44, 52, palette.fg, "500"),
      });
      push({
        kind: "row",
        gap: 16,
        items: [
          { kind: "flame", size: 44, color: palette.accent },
          text(`Longest streak ${formatDays(input.longestStreak ?? 0)}`, 44, 52, palette.fg),
        ],
      });
    } else {
      push(caps(challenge, 40, 48, palette.sub));
      // Build 90 04.6: a task moment knows the day, not the secured count. Dots plus "Day 2 of 7".
      if (typeof input.secured === "number") {
        push({
          kind: "baseline",
          lead: text(String(input.secured), 170, 170, palette.fg, "800"),
          rest: text(`of ${formatDays(due)}`, 60, 64, palette.fg, "500"),
        });
      } else {
        push(dayRow(day, total, 150, palette.fg, palette.fg));
      }
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
    if (input.style === "D" && typeof input.secured === "number") push(text(`Day ${day} of ${total}`, 36, 44, palette.fg));
    if (input.style === "F" && input.dateRange?.trim()) {
      push(text(input.dateRange.trim(), 34, 42, palette.sub));
    }
    push(joinItem(input, palette.fg));
    return base;
  }

  if (input.style === "E") {
    if (base.wordmark) base.wordmark.y = 140;
    base.block.y = 280;
    base.block.h = SHARE_H - 280 - 140;
    base.block.justify = "center";
    push({ kind: "flame", size: 140, color: palette.accent });
    push(text(String(input.streak ?? 0), 520, 470, palette.fg, "800", -0.02 * 520));
    push(text(streakInARow(input.streak ?? 0), 72, 84, palette.fg));
    if (input.activeLine?.trim()) push(text(input.activeLine.trim(), 38, 46, palette.sub));
    const date = input.dateLabel?.trim() || shareDateLabel();
    push(text(date, 36, 44, palette.fg));
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
  return base;
}

export function paintStrings(paint: SharePaint): string[] {
  const out: string[] = [];
  const walk = (item: ShareItem) => {
    if (item.kind === "text") out.push(item.caps ? item.text.toUpperCase() : item.text);
    else if (item.kind === "baseline") {
      walk(item.lead);
      walk(item.rest);
    } else if (item.kind === "row" || item.kind === "ring") item.items.forEach(walk);
    else if (item.kind === "seal" || item.kind === "mark") out.push(item.label);
    else if (item.kind === "link") {
      if (item.title) out.push(item.title);
      if (item.link) out.push(item.link);
    }
  };
  if (paint.wordmark) out.push(paint.wordmark.text);
  paint.block.items.forEach(walk);
  return out;
}
