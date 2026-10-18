/**
 * Build 92 04.1 / 04.2 / 04.5: what a post says about its result, its one badge, and the own-post like line.
 * Copy from design/handoff/b92/part1-finish-loop/README.md rows "Post results", "Badges", "Own post".
 */
import type { PostBadge, PostResult } from "@/backend/lib/post-result";

export type { PostBadge, PostResult };

const KM_PER_MI = 1.609344;

export const fmtQty = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  if (Number.isInteger(r)) return String(r);
  return r.toFixed(r * 10 === Math.round(r * 10) ? 1 : 2);
};

/** h:mm:ss over an hour, else m:ss. */
export function hms(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

export type ResultLine = {
  /** "Run", "Workout", "Counter", "Timer", "Journal" */
  kind: string;
  /** The big line: "3 mi · 27:30 · 9:10 /mi", "Lift · 45 min", "12 pages", "20 min", "Journal entry" */
  big: string;
  /** Under the big line, when there is one. */
  sub?: string;
};

export const JOURNAL_ENTRY = "Journal entry";
export const JOURNAL_PRIVATE = "The entry stays private.";

/** Null when the post has nothing to show beyond its badge (photo check-offs, build 91 posts). */
export function resultLine(r: PostResult | null | undefined): ResultLine | null {
  if (!r) return null;
  switch (r.kind) {
    case "run": {
      const km = r.distance_km ?? 0;
      const unit = r.distance_unit ?? "km";
      const d = unit === "mi" ? km / KM_PER_MI : km;
      const sec = (r.duration_min ?? 0) * 60;
      if (d <= 0) return null;
      const pace = sec > 0 ? ` · ${hms(sec / d)} /${unit}` : "";
      const time = sec > 0 ? ` · ${hms(sec)}` : "";
      return { kind: "Run", big: `${fmtQty(d)} ${unit}${time}${pace}` };
    }
    case "workout": {
      const m = Math.round(r.duration_min ?? 0);
      const kind = (r.workout_kind ?? "").trim() || "Workout";
      return { kind: "Workout", big: m > 0 ? `${kind} · ${m} min` : kind };
    }
    case "counter": {
      if (typeof r.count !== "number") return null;
      const unit = (r.unit ?? "").trim();
      return { kind: "Counter", big: unit ? `${fmtQty(r.count)} ${unit}` : fmtQty(r.count) };
    }
    case "timer": {
      const m = Math.round(r.duration_min ?? 0);
      if (m <= 0) return null;
      return { kind: "Timer", big: `${m} min` };
    }
    case "journal":
      // Never the text.
      return { kind: "Journal", big: JOURNAL_ENTRY, sub: JOURNAL_PRIVATE };
    default:
      return null;
  }
}

/** Build 92 04.2: exactly one badge. Falls back from the stored badge to what the card knows. */
export function postBadge(post: { badge?: PostBadge | null; verifiedBy?: string | null; proofPhotoUrl?: string | null }): PostBadge {
  if (post.badge) return post.badge;
  if (post.verifiedBy === "strava") return "Verified by Strava";
  if (post.proofPhotoUrl) return "Verified";
  return "Self-reported";
}

/** Build 92 04.5: the like line on your own post. Null when nobody has liked it yet. */
export function likedByLine(name: string | null | undefined, count: number): string | null {
  if (!name || count <= 0) return null;
  const others = count - 1;
  if (others <= 0) return `Liked by ${name}`;
  return `Liked by ${name} and ${others} ${others === 1 ? "other" : "others"}`;
}
