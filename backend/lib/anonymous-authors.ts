/**
 * Everyone feed / social counts: drop anonymous Supabase sessions.
 * Spec 120 resolved: is_anonymous. Flag is auth.users.is_anonymous
 * (service-role admin.getUserById). Anon upgrade keeps the same uid
 * and sets is_anonymous false.
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

export const ANON_AUTHOR_CACHE_TTL_MS = 10 * 60 * 1000;
export const ANON_AUTHOR_LOOKUP_CONCURRENCY = 8;

const cache = new Map<string, { anon: boolean; at: number }>();

export function clearAnonymousAuthorCache(): void {
  cache.clear();
}

export function isAnonymousAuthUser(
  user: { is_anonymous?: boolean } | null | undefined,
): boolean {
  return user?.is_anonymous === true;
}

async function mapPool<T>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  const n = Math.min(limit, items.length);
  if (n === 0) return;
  async function worker() {
    while (i < items.length) {
      const idx = i;
      i += 1;
      await fn(items[idx]!);
    }
  }
  await Promise.all(Array.from({ length: n }, () => worker()));
}

export async function anonymousUserIdSet(
  admin: AdminUserLookup,
  userIds: readonly string[],
  now = Date.now(),
): Promise<Set<string>> {
  const out = new Set<string>();
  const unique = [...new Set(userIds.filter(Boolean))];
  const miss: string[] = [];
  for (const id of unique) {
    const hit = cache.get(id);
    if (hit && now - hit.at < ANON_AUTHOR_CACHE_TTL_MS) {
      if (hit.anon) out.add(id);
    } else {
      miss.push(id);
    }
  }
  await mapPool(miss, ANON_AUTHOR_LOOKUP_CONCURRENCY, async (id) => {
    try {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (error || !data.user) return;
      const anon = isAnonymousAuthUser(data.user);
      cache.set(id, { anon, at: now });
      if (anon) out.add(id);
    } catch {
      // Lookup errors: not anonymous, do not cache.
    }
  });
  return out;
}

export function excludeAnonymousUserIds<T extends { user_id: string }>(
  rows: readonly T[],
  anonymousIds: ReadonlySet<string>,
): T[] {
  return rows.filter((row) => !anonymousIds.has(row.user_id));
}
