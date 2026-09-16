/**
 * Home pull-to-refresh. RefreshControl must track isRefetching, not isFetching:
 * the cold-start bootstrap fetch is isPending+isFetching, and Home already has
 * a loading prop for that. isFetching true with data is a pull (or a loop).
 */

export function homePullRefreshing(isRefetching: boolean): boolean {
  return isRefetching;
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
