/**
 * Build 92 10.1 (P3-10, P3-11): Discover cards say what you do and how it is proven,
 * "New" under 5 people, and category motifs instead of photos.
 */
import { format12h } from "@/lib/task-ui";

export const DISCOVER_JOINED = "Joined";

export type DoesTask = {
  title?: string | null;
  task_type?: string | null;
  require_photo?: boolean | null;
  gate_time_mode?: string | null;
  gate_time_start?: string | null;
  gate_time_end?: string | null;
  config?: Record<string, unknown> | null;
  /** The server's canonical proof kind (taskProofKind); used when present. */
  proof?: "strava" | "camera" | "timer" | "counter" | "self" | null;
};

function meridiemOf(t: string): string {
  return t.slice(-2);
}

/** "5:00–6:30 am", "11:00 am–1:00 pm", "by 7:00 am". */
export function windowPhrase(t: DoesTask): string {
  const mode = (t.gate_time_mode ?? "").trim();
  if (mode === "by") {
    const at = format12h(t.gate_time_start);
    return at ? `by ${at}` : "";
  }
  if (mode === "between") {
    const from = format12h(t.gate_time_start);
    const to = format12h(t.gate_time_end);
    if (!from || !to) return "";
    const fromShort = meridiemOf(from) === meridiemOf(to) ? from.slice(0, -3) : from;
    return `${fromShort}–${to}`;
  }
  return "";
}

type Proof = "strava" | "camera" | "timer" | "counter" | "self";

function proofOf(t: DoesTask): Proof {
  if (t.proof) return t.proof;
  const cfg = t.config ?? {};
  if (cfg.require_strava === true || cfg.verify === "strava") return "strava";
  if (
    t.require_photo === true ||
    cfg.photo_mode === "required" ||
    cfg.require_photo_proof === true ||
    cfg.photo_required === true
  ) {
    return "camera";
  }
  const type = (t.task_type ?? "").trim();
  if (type === "timer") return "timer";
  if (type === "counter") return "counter";
  return "self";
}

/** "Run 3 mi · Strava", "Get to the gym · photo", "Pray Fajr · camera, 5:00–6:30 am". */
export function doesLine(t: DoesTask): string {
  const label = (t.title ?? "").trim() || "Task";
  const window = windowPhrase(t);
  const proof = proofOf(t);
  let how: string;
  if (proof === "strava") how = "Strava";
  else if (proof === "camera") how = window ? `camera, ${window}` : "photo";
  else if (proof === "self") how = window ? `self-reported, ${window}` : "self-reported";
  else how = window ? `${proof}, ${window}` : proof;
  return `${label} · ${how}`;
}

export function peopleLabel(n: number): string {
  const count = Math.max(0, Math.floor(n));
  return count < 5 ? "New" : `${count.toLocaleString("en-US")} people`;
}

export type MotifTexture = "hatch-135" | "crescent-rings" | "ruled-lines" | "dot-grid" | "square-grid";

/** Ink ground, textPrimary at 6–10% for the texture. No orange, no photos. */
export const CATEGORY_MOTIF = {
  Fitness: { texture: "hatch-135" },
  Faith: { texture: "crescent-rings" },
  Mind: { texture: "ruled-lines" },
  Health: { texture: "dot-grid" },
  Discipline: { texture: "square-grid" },
  Learning: { texture: "ruled-lines" },
} as const satisfies Record<string, { texture: MotifTexture }>;

const GYM = /\bgym\b|workout|lift/i;

/** Featured always includes at least one run and one gym challenge. */
export function featuredHasRunAndGym(
  items: readonly { taskType: string; task: string; title: string }[],
): boolean {
  const run = items.some((i) => i.taskType === "run");
  const gym = items.some((i) => GYM.test(i.task) || GYM.test(i.title));
  return run && gym;
}
