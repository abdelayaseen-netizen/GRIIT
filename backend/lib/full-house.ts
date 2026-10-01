import { dateKeyFromIsoInTimeZone } from "./date-utils";

export type FullHouseEnrollment = {
  challenge_id: string;
  user_id: string;
  status: string;
  ended_at?: string | null;
  participation_type?: string | null;
};

const TEAM = "team";
const COMPLETED = "completed";

/** Earliest local date the viewer finished a team run where every member completed. Solo never counts. */
export function fullHouseAtFromRoster(
  userId: string,
  rows: readonly FullHouseEnrollment[],
  timezone: string,
): string | null {
  const byChallenge = new Map<string, FullHouseEnrollment[]>();
  for (const row of rows) {
    const list = byChallenge.get(row.challenge_id) ?? [];
    list.push(row);
    byChallenge.set(row.challenge_id, list);
  }

  let earliestIso: string | null = null;
  for (const members of byChallenge.values()) {
    if (members.some((m) => (m.participation_type ?? "").toLowerCase() !== TEAM)) continue;
    const mine = members.find((m) => m.user_id === userId);
    if (!mine || mine.status !== COMPLETED) continue;
    if (members.length === 0 || members.some((m) => m.status !== COMPLETED)) continue;
    const at = mine.ended_at;
    if (!at) continue;
    if (!earliestIso || at < earliestIso) earliestIso = at;
  }
  if (!earliestIso) return null;
  return dateKeyFromIsoInTimeZone(earliestIso, timezone) || null;
}
