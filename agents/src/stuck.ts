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
