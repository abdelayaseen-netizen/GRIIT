/**
 * Build 90 chunk 08.3: Discover search copy and row mapping. Pure.
 */
import { parseInviteCode, searchKind } from "@/lib/invite-code";

export { parseInviteCode, searchKind };

export const SEARCH_PLACEHOLDER = "Search challenges or paste an invite code";
export const SEARCH_LABEL = "Search";
export const SEARCH_RESULTS_HEADING = "Results";
export const SEARCH_CODE_HEADING = "From your invite code";

export type SearchResultRow = {
  id: string;
  title: string | null;
  duration_days: number | null;
  participation_type: string | null;
  participants_count: number | null;
  is_hard_mode?: boolean | null;
  difficulty?: string | null;
};

export type SearchResponse = {
  code: string | null;
  exact: SearchResultRow | null;
  results: SearchResultRow[];
};

export function searchEmptyLine(q: string, response: SearchResponse | null | undefined): string | null {
  if (!response) return null;
  const kind = searchKind(q);
  if (kind === "empty") return null;
  if (kind === "code") return response.exact ? null : "No challenge has that code.";
  return response.results.length === 0 ? `No challenge named "${q.trim()}".` : null;
}

function participation(pt: string | null | undefined): string {
  if (pt === "duo") return "Duo";
  if (pt === "team") return "Team";
  if (pt === "shared_goal") return "Shared goal";
  return "Solo";
}

export function searchRowSubtitle(row: SearchResultRow): string {
  const days = row.duration_days && row.duration_days > 0 ? row.duration_days : 1;
  const dayWord = days === 1 ? "1 day" : `${days} days`;
  const mode = row.is_hard_mode === true || row.difficulty === "hard" ? "Strict" : "Standard";
  const parts = [dayWord, participation(row.participation_type), mode];
  const people = row.participants_count ?? 0;
  if (people > 0) parts.push(people === 1 ? "1 person" : `${people} people`);
  return parts.join(" · ");
}

export function searchRowTitle(row: SearchResultRow): string {
  return (row.title ?? "").trim() || "Challenge";
}

/** Tapping an exact-code result opens the page as the invite link would (the code is the key). */
export function openHrefForResult(challengeHref: string, viaInvite: boolean): string {
  return viaInvite ? `${challengeHref}?invite=1&source=discover` : `${challengeHref}?source=discover`;
}
