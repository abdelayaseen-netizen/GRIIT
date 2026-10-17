/**
 * Build 90 10.4 chunk 6: the exit interview. Three words, each scored right or wrong against what
 * the app says (lib/concept-once.ts, lib/day-sticker.ts, the Join sheet):
 *   secured       = every task of the day is done, so the day counts toward the streak
 *   freeze        = a missed day that does not break the streak (a pass you can use)
 *   self-reported = the person marked the task done themselves, with no photo or other proof
 */
import type { Interview } from "./types";

function field(rec: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = rec[key];
    if (value != null && String(value).trim()) return String(value).replace(/\s+/g, " ").trim().slice(0, 240);
  }
  return "";
}

function unsure(text: string): boolean {
  return !text || /never explained|not explained|don.?t know|no idea|not sure|didn.?t see|did not see|wasn.?t shown|unclear|no definition/i.test(text);
}

export function securedRight(text: string): boolean {
  if (unsure(text)) return false;
  const t = text.toLowerCase();
  const allTasks = /\b(all|every|each)\b.*\btasks?\b|\btasks?\b.*\b(all|every|each)\b|finish(ed)? (all|every|the day|today)|complete(d)? (all|every|the day)|every task/i.test(t);
  const dayCounts = /day (counts|is counted|is locked|is safe|is done|is complete|is banked|is secured|is saved|counts toward)|streak (continues|grows|is safe|counts|goes up|stays|is protected|won.?t be broken|is not broken)|counts (for|toward) (the|your) streak|locked in|banked|in the bag|kept (the|your) streak/i.test(t);
  // "completed the daily requirement and it's recorded for that day": the day's work is done and credited.
  const dailyDone = /(complet|finish|done|did)[^.]*\b(daily|today|for (the|that) day|the day'?s|day \d+|requirement|goal)\b/i.test(t);
  // "secured" itself is left out: every answer repeats the question word.
  const credited = /\b(recorded|counted|counts|credited|logged|locked|banked|earned|streak|progress)\b/i.test(t);
  return allTasks || dayCounts || (dailyDone && credited);
}

export function freezeRight(text: string): boolean {
  if (unsure(text)) return false;
  const t = text.toLowerCase();
  const missed = /miss(ed|ing)? (a )?day|skip(ped)? (a )?day|day off|rest day|don.?t (do|finish|complete)|can.?t (do|finish|complete)|not (do|finish|complete)|fail(ed)? (a )?day|without (doing|finishing|completing)/i.test(t);
  const streakKept = /(keep|keeps|kept|save|saves|saved|protect|protects|protected|hold|holds|preserve|preserves|preserved|without (losing|breaking|resetting|ending))[^.]*streak|streak[^.]*(safe|intact|alive|kept|saved|protected|not (break|reset|lost|end)|doesn.?t (break|reset|end|die)|won.?t (break|reset|end))|(doesn|don|won|didn).?t (break|reset|end|lose) (the|your|my|a) streak|not (break|reset|lose) (the|your|my|a) streak/i.test(t);
  const pass = /\b(pass|skip|pause|shield|protection|safety net|grace|get out of jail|buffer|lifeline|free day|spare)\b/i.test(t);
  return (missed && streakKept) || (pass && /streak/.test(t)) || (streakKept && /\b(one|1|a|the)\b (day|miss)/.test(t));
}

export function selfReportedRight(text: string): boolean {
  if (unsure(text)) return false;
  const t = text.toLowerCase();
  const noProof = /no (photo|proof|picture|camera|evidence|verification|check|strava|tracker)|without (a )?(photo|proof|picture|camera|evidence|verification)|not (verified|checked|proven|proved)|isn.?t (verified|checked|proven)|unverified|honor system|honou?r|trust|on (your|my|their) word|takes? (your|my|their) word|yourself|myself|themselves|you (just )?(say|tell|mark|confirm|tap|check)|i (just )?(say|tell|mark|confirm|tap|check)|marked? (it )?(as )?done (by )?(yourself|myself|manually)|manually|self.?declared|you report|i report/i.test(t);
  return noProof;
}

export function scoreInterview(raw: string): Interview {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  let rec: Record<string, unknown> = {};
  if (start >= 0 && end > start) {
    try {
      rec = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      rec = {};
    }
  }
  const secured = field(rec, "secured", "day_secured");
  const freeze = field(rec, "freeze");
  const selfReported = field(rec, "self_reported", "selfReported", "self-reported");
  const tomorrow = field(rec, "tomorrow");
  return {
    secured,
    freeze,
    selfReported,
    tomorrow,
    securedRight: securedRight(secured),
    freezeRight: freezeRight(freeze),
    selfReportedRight: selfReportedRight(selfReported),
    asked: Boolean(secured || freeze || selfReported || tomorrow),
  };
}

/** The 1–10 number at the start of the tomorrow answer, or null. */
export function tomorrowScore(text: string): number | null {
  const match = text.match(/\b(10|[1-9])\b/);
  return match ? Number(match[1]) : null;
}
