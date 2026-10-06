/**
 * v48.2 option C. The none state is one line. Names follow the band rules.
 */
import { count } from "@/lib/copy";

export const TODAY_BAND_NONE = "No one’s posted today. You’re first.";

export type TodayPoster = {
  userId: string;
  name: string;
  createdAt: string;
  photoUrl?: string | null;
  isViewer?: boolean;
};

export function todayBandCopy(posters: readonly TodayPoster[], viewerId?: string): string {
  const ordered = [...posters].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const seen = new Set<string>();
  const unique = ordered.filter((p) => {
    if (seen.has(p.userId)) return false;
    seen.add(p.userId);
    return true;
  });
  if (unique.length === 0) return TODAY_BAND_NONE;
  const me = unique.find((p) => p.isViewer || p.userId === viewerId);
  const others = unique.filter((p) => p !== me);
  const first = others[0]?.name ?? "";
  const second = others[1]?.name ?? "";
  if (me && others.length === 0) return "You posted today.";
  if (me && others.length === 1) return `You and ${first} posted today.`;
  if (me) return `You, ${first} and ${count(others.length - 1, "other")} posted today.`;
  if (others.length === 1) return `${first} posted today.`;
  if (others.length === 2) return `${first} and ${second} posted today.`;
  return `${first}, ${second} and ${count(others.length - 2, "other")} posted today.`;
}
