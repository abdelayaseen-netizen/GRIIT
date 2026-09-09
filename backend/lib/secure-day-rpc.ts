export type SecureDayRpcRow = {
  streak: number;
  secured: boolean;
  challenge_done: boolean;
  remaining_challenges: number;
};

export function parseSecureDayRpcRow(row: unknown): SecureDayRpcRow {
  const r = (row ?? {}) as Record<string, unknown>;
  return {
    streak: Number(r.streak ?? 0),
    secured: r.secured === true,
    challenge_done: r.challenge_done === true,
    remaining_challenges: Number(r.remaining_challenges ?? 0),
  };
}
