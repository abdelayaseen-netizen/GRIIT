/**
 * Everyone feed / social counts: drop anonymous Supabase sessions.
 * Flag is auth.users.is_anonymous (service-role admin.getUserById).
 * Anon upgrade keeps the same uid and sets is_anonymous false.
 * There is no profiles.is_guest column — do not filter usernames.
 */

export type AdminUserLookup = {
  auth: {
    admin: {
      getUserById: (id: string) => Promise<{
        data: { user: { is_anonymous?: boolean } | null };
        error?: { message?: string } | null;
      }>;
    };
  };
};

export function isAnonymousAuthUser(
  user: { is_anonymous?: boolean } | null | undefined,
): boolean {
  return user?.is_anonymous === true;
}

export async function anonymousUserIdSet(
  admin: AdminUserLookup,
  userIds: readonly string[],
): Promise<Set<string>> {
  const out = new Set<string>();
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(
    unique.map(async (id) => {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (error || !data.user) return;
      if (isAnonymousAuthUser(data.user)) out.add(id);
    }),
  );
  return out;
}

export function excludeAnonymousUserIds<T extends { user_id: string }>(
  rows: readonly T[],
  anonymousIds: ReadonlySet<string>,
): T[] {
  return rows.filter((row) => !anonymousIds.has(row.user_id));
}
