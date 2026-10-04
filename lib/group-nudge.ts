/**
 * v45 nudge. Stored on in_app_notifications (type general). No free text.
 * Production has no nudges table.
 */

export const NUDGE_MESSAGES = [
  "2 hours left.",
  "Don't break the chain.",
  "We're waiting on you.",
] as const;

export const GROUP_PUSH_CAP = 2;

export function nudgeMessage(key: number): string | null {
  if (!Number.isInteger(key) || key < 0 || key > 2) return null;
  return NUDGE_MESSAGES[key] ?? null;
}

export function nudgeBlocked(args: {
  senderId: string;
  recipientId: string;
  sameChallenge: boolean;
  recipientSecured: boolean;
  alreadyNudged: boolean;
  messageKey: number;
}): string | null {
  if (args.senderId === args.recipientId) return "You can't nudge yourself.";
  if (!args.sameChallenge) return "You can only nudge someone in this challenge.";
  if (args.recipientSecured) return "They already secured today.";
  if (nudgeMessage(args.messageKey) == null) return "Pick one of the three lines.";
  if (args.alreadyNudged) return "You already nudged them today.";
  return null;
}

export function groupPushAllowed(sentToday: number): boolean {
  return Math.max(0, Math.floor(sentToday)) < GROUP_PUSH_CAP;
}

export function pushedCounts(
  rows: readonly { metadata?: { kind?: string; date_key?: string; pushed?: boolean } | null }[],
  dateKey: string,
): { nudges: number; joined: number } {
  let nudges = 0;
  let joined = 0;
  for (const row of rows) {
    const meta = row.metadata;
    if (!meta?.pushed || meta.date_key !== dateKey) continue;
    if (meta.kind === "nudge") nudges += 1;
    else if (meta.kind === "joined") joined += 1;
  }
  return { nudges, joined };
}

/** Nudge outranks a joined ping. A joined ping leaves one slot open until a nudge has used one. */
export function groupPushSend(
  kind: "nudge" | "joined",
  counts: { nudges: number; joined: number },
): boolean {
  const total = counts.nudges + counts.joined;
  if (total >= GROUP_PUSH_CAP) return false;
  if (kind === "nudge") return true;
  if (counts.nudges === 0 && counts.joined >= GROUP_PUSH_CAP - 1) return false;
  return true;
}

export function isNudgeRow(row: {
  actor_id?: string | null;
  metadata?: { kind?: string; challenge_id?: string; date_key?: string } | null;
}, senderId: string, challengeId: string, dateKey: string): boolean {
  const meta = row.metadata;
  return (
    row.actor_id === senderId &&
    meta?.kind === "nudge" &&
    meta.challenge_id === challengeId &&
    meta.date_key === dateKey
  );
}
