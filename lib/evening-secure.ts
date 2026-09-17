/**
 * Frame 57 evening copy. Count first. No exclamation marks.
 * 20:00 names the remaining work. 22:00 names the streak at midnight.
 */
export const EVENING_TITLE = "GRIIT";

export type EveningHour = 20 | 22;

export type EveningRemaining = {
  remaining: number;
  total: number;
  challenge: string;
  cameraRemaining?: number;
};

export type EveningCopyInput = EveningRemaining & {
  hour: EveningHour;
  streak: number;
};

export function eveningSecureCopy(input: EveningCopyInput): { title: typeof EVENING_TITLE; body: string } {
  const remaining = Math.max(0, Math.floor(input.remaining));
  const total = Math.max(remaining, Math.floor(input.total));
  const challenge = input.challenge.trim() || "GRIIT";
  const streak = Math.max(0, Math.floor(input.streak));
  const cameraRemaining = Math.max(0, Math.floor(input.cameraRemaining ?? 0));

  if (input.hour === 20) {
    if (remaining > 0 && cameraRemaining === remaining) {
      const cameraLine =
        remaining === 1
          ? `${remaining} left, and it needs a photo`
          : `${remaining} left, both need a photo`;
      return { title: EVENING_TITLE, body: `${challenge}: ${cameraLine}. Four hours to secure.` };
    }
    if (remaining === total) {
      return {
        title: EVENING_TITLE,
        body: `${challenge}: ${total} tasks left today. Four hours to secure.`,
      };
    }
    return {
      title: EVENING_TITLE,
      body: `${challenge}: ${remaining} of ${total} left today. Four hours to secure.`,
    };
  }

  if (streak > 0) {
    return {
      title: EVENING_TITLE,
      body: `${remaining} left. A ${streak}-day streak ends at midnight.`,
    };
  }
  return { title: EVENING_TITLE, body: `${remaining} left. Two hours to secure today.` };
}
