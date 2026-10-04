/**
 * profiles.is_test. A real viewer does not see test authors.
 * A test viewer still does.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileFlag = { user_id?: string | null; is_test?: boolean | null };

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
