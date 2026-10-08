/** Port of design/handoff/v50 storyCard.ts. Do not import the handoff file. */

const DAY_MS = 86_400_000;

export function dayIndex(startedOn: string, today: string): number {
  return Math.round((Date.parse(today) - Date.parse(startedOn)) / DAY_MS) + 1;
}

export function dayParts(index: number, durationDays: number): { day: number; of: number } {
  const of = Math.max(0, Math.floor(durationDays));
  const day = Math.min(Math.max(0, Math.floor(index)), of || Math.max(0, Math.floor(index)));
  return { day, of };
}

export function dayLine(index: number, durationDays: number): string {
  const parts = dayParts(index, durationDays);
  return `Day ${parts.day} of ${parts.of}`;
}

/** Footer link. Callers pass INVITE_BASE. Never a hard-coded host. */
export function inviteUrl(base: string, code: string): string {
  return `${base.replace(/\/$/, "")}/i/${code}`;
}
