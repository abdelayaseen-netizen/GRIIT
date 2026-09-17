/**
 * Home pull-to-refresh. RefreshControl tracks a local isPulling flag, never a
 * query's isRefetching: focus, window-focus, feed refetch, and reconcile
 * invalidate all set isRefetching without a user pull.
 */

export async function runHomePullRefresh(
  work: () => Promise<unknown>,
  setPulling: (value: boolean) => void,
): Promise<void> {
  setPulling(true);
  try {
    await work();
  } finally {
    setPulling(false);
  }
}

/**
 * useFocusEffect re-runs when the callback identity changes while focused.
 * The whole useQuery result is a new object after every fetch — listing it as
 * a dep calls refetch again, so isRefetching never settles.
 */
export function homeFocusRefetchDeps(
  isGuest: boolean,
  userId: string | undefined,
  refetch: () => unknown,
): readonly [boolean, string | undefined, () => unknown] {
  return [isGuest, userId, refetch];
}
