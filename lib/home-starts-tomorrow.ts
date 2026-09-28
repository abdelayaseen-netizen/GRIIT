export const HOME_STARTS_TOMORROW = "Starts tomorrow";

export type QueuedHomeRow = {
  id: string;
  challengeId: string;
  name: string;
};

export function queuedHomeRows(
  rows: {
    id?: string;
    challenge_id?: string;
    challenges?: { id?: string | null; title?: string | null } | null;
  }[] | null | undefined,
): QueuedHomeRow[] {
  return (rows ?? [])
    .map((r) => ({
      id: r.id ?? "",
      challengeId: r.challenges?.id ?? r.challenge_id ?? "",
      name: (r.challenges?.title ?? "").trim() || "Challenge",
    }))
    .filter((r) => r.id.length > 0);
}
