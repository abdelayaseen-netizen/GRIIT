/**
 * profiles.is_test. A real viewer does not see test authors.
 * A test viewer still does.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { isMaestroTestEmail } from "../../lib/maestro-account";

type ProfileFlag = { user_id?: string | null; is_test?: boolean | null };

/** App Review was created without is_test. Hide that display name until the pending SQL flags the row. */
function looksLikeMaestroHandle(value: string | null | undefined): boolean {
  return /^b8\d/i.test((value ?? "").trim());
}

export function isHiddenFromRealViewers(row: {
  is_test?: boolean | null;
  display_name?: string | null;
  username?: string | null;
  email?: string | null;
}): boolean {
  if (row.is_test === true) return true;
  if ((row.display_name ?? "").trim().toLowerCase() === "app review") return true;
  if (row.email && isMaestroTestEmail(row.email)) return true;
  return looksLikeMaestroHandle(row.username) || looksLikeMaestroHandle(row.display_name);
}

export function participantCountWithoutTest(stored: number, testEnrolled: number): number {
  const base = Number.isFinite(stored) ? Math.floor(stored) : 0;
  const hidden = Number.isFinite(testEnrolled) ? Math.max(0, Math.floor(testEnrolled)) : 0;
  return Math.max(0, base - hidden);
}

export async function subtractTestParticipantCounts<T extends { id: string; participants_count?: number | null }>(
  supabase: SupabaseClient,
  rows: T[],
): Promise<T[]> {
  if (rows.length === 0) return rows;
  const ids = rows.map((row) => row.id);
  const { data: flagged, error: flagError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("is_test", true)
    .limit(500);
  if (flagError || !flagged?.length) return rows;
  const testIds = (flagged as { user_id?: string }[]).map((row) => row.user_id).filter((id): id is string => Boolean(id));
  if (testIds.length === 0) return rows;
  const { data: enrolled, error: enrollError } = await supabase
    .from("active_challenges")
    .select("challenge_id")
    .in("challenge_id", ids)
    .in("user_id", testIds)
    .eq("status", "active")
    .limit(2000);
  if (enrollError || !enrolled) return rows;
  const extra = new Map<string, number>();
  for (const row of enrolled as { challenge_id?: string }[]) {
    if (!row.challenge_id) continue;
    extra.set(row.challenge_id, (extra.get(row.challenge_id) ?? 0) + 1);
  }
  return rows.map((row) => ({
    ...row,
    participants_count: participantCountWithoutTest(Number(row.participants_count) || 0, extra.get(row.id) ?? 0),
  }));
}

export function dropTestAuthors(
  ids: readonly string[],
  testIds: ReadonlySet<string>,
  viewerIsTest: boolean,
): string[] {
  if (viewerIsTest) return [...ids];
  return ids.filter((id) => !testIds.has(id));
}

export async function viewerIsTestAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_test")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as ProfileFlag | null)?.is_test === true;
}

export async function testAuthorIdSet(
  supabase: SupabaseClient,
  userIds: readonly string[],
): Promise<Set<string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const out = new Set<string>();
  for (let i = 0; i < unique.length; i += 100) {
    const slice = unique.slice(i, i + 100);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, is_test")
      .in("user_id", slice)
      .limit(slice.length);
    for (const row of (data ?? []) as ProfileFlag[]) {
      if (row.is_test === true && row.user_id) out.add(row.user_id);
    }
  }
  return out;
}
