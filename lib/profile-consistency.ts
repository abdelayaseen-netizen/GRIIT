/**
 * Own-profile consistency from the same bootstrap fields Home's week strip uses.
 * "No due days" only when there is no active challenge.
 */
export function profileConsistencyFromBootstrap(input: {
  activeChallenges: unknown[] | null | undefined;
  securedDateKeys: string[] | null | undefined;
  weekDateKeys: string[];
}): string {
  const active = Array.isArray(input.activeChallenges) ? input.activeChallenges : [];
  if (active.length === 0) return "No due days";
  const n = input.weekDateKeys.length;
  if (n === 0) return "No due days";
  const set = new Set(input.securedDateKeys ?? []);
  const filled = input.weekDateKeys.filter((k) => set.has(k)).length;
  return `${filled} of ${n}`;
}
