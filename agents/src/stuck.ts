import type { El } from "./screen";
import { visualSame } from "./pixels";

/** How many times this screen has come up unchanged. A scroll that moves the picture resets it. */
export function nextStreak(input: {
  text: string;
  visual: Buffer | null;
  lastText: string;
  lastVisual: Buffer | null;
  streak: number;
  ignore: boolean;
}): number {
  if (input.ignore) return 1;
  const textSame = input.text.length > 0 && input.text === input.lastText;
  if (!textSame) return 1;
  if (input.visual && input.lastVisual && !visualSame(input.visual, input.lastVisual)) return 1;
  return input.streak + 1;
}

/**
 * Build 92 12b.5: a screen that comes up unchanged 3 times is a nudge, never an exit. Sessions end on
 * the step budget, the spend cap, the time cap, or STUCK_LIMIT stuck notes on one screen.
 */
export function repeatedScreen(same: number): { nudge: boolean; stop: false } {
  return { nudge: same >= 3, stop: false };
}

export const REPEAT_NUDGE = "The screen has not changed for 3 steps. Do something different: scroll, a different button, the tab bar, or back.";

/** Taps in a row on one target that left the screen exactly as it was. */
export type TapRepeat = { target: string; count: number };

const norm = (target: string) => target.trim().toLowerCase();

/**
 * Build 92 12.2. `last` is the previous step's tap and the screen signature before it; `sigNow` is the
 * screen after it. A changed screen, another action or another target resets the count.
 */
export function nextTapRepeat(prev: TapRepeat | null, last: { action: string; target: string; sigBefore: string } | null, sigNow: string): TapRepeat | null {
  if (!last || !/^(tap|double_tap)$/.test(last.action) || !last.target.trim()) return null;
  if (!last.sigBefore || last.sigBefore !== sigNow) return null;
  if (prev && norm(prev.target) === norm(last.target)) return { target: last.target, count: prev.count + 1 };
  return { target: last.target, count: 1 };
}

/** After 2 dead taps on one target the persona must do something else. */
export const DEAD_TAPS = 2;
/** The session stops at this many stuck notes on one screen. */
export const STUCK_LIMIT = 3;

export function isRepeatOfDeadTarget(repeat: TapRepeat | null, decision: { action: string; target: string }): boolean {
  return !!repeat && repeat.count >= DEAD_TAPS && /^(tap|double_tap)$/.test(decision.action) && norm(decision.target) === norm(repeat.target);
}

export function stuckPrompt(repeat: TapRepeat): string {
  return `You tapped "${repeat.target}" ${repeat.count} times and nothing changed. Do something different now: scroll, dismiss the keyboard, go back, or use another control. Start your thought with "stuck:" and say in a few words why you are stuck.`;
}

/** The persona's own "stuck: why" if it wrote one; otherwise, when the harness forced a change, the harness's note. */
export function stuckNote(thought: string, forced: TapRepeat | null): string {
  const own = thought.match(/^\s*stuck\s*:\s*(.+)/i);
  if (own) return `stuck: ${own[1]!.trim()}`;
  return forced ? `stuck: tapped "${forced.target}" ${forced.count} times with no change` : "";
}

export function countStuck(counts: Map<string, number>, screen: string, note: string): number {
  if (!note) return counts.get(screen) ?? 0;
  const next = (counts.get(screen) ?? 0) + 1;
  counts.set(screen, next);
  return next;
}

export type EndTag = "app bug" | "agent stuck" | "finished" | "harness stop";

/** Build 92 12.5: every session end is either the app's fault, the agent's, a clean finish, or a harness limit. */
export function endTag(result: { giveUp: string; crashes: string[]; wrongNumbers?: string[]; errors?: string[] }): EndTag {
  if (result.crashes.length) return "app bug";
  if ((result.wrongNumbers ?? []).length) return "app bug";
  const end = result.giveUp;
  if (/stuck note|repeated \d+ times|two failed taps|did not open/i.test(end)) return /did not open/i.test(end) ? "app bug" : "agent stuck";
  if (/cap|20 minutes|step cap|account|is_test|review login|skipped/i.test(end)) return "harness stop";
  return "finished";
}

/**
 * The name of a chip or tab the agent is about to tap that is already selected.
 * Tapping it does not change the screen.
 */
export function selectedChip(target: string, els: El[]): string | null {
  const needle = target
    .trim()
    .toLowerCase()
    .replace(/ \(selected\)$/, "");
  if (!needle || needle.includes("%")) return null;
  for (const el of els) {
    if (!el.selected) continue;
    const text = el.text.replace(/\s+/g, " ").trim();
    const a11y = el.a11y.replace(/\s+/g, " ").trim();
    const names = [text, a11y, a11y.replace(/^filter by\s+/i, "")]
      .map((item) => item.toLowerCase())
      .filter(Boolean);
    if (!names.includes(needle)) continue;
    return text || a11y.replace(/^filter by\s+/i, "") || needle;
  }
  return null;
}
