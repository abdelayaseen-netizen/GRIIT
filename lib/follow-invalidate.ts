import type { QueryClient } from "@tanstack/react-query";
import { HOME_BOOTSTRAP_QUERY_KEY } from "@/lib/home-bootstrap-key";

/** Keys a follow/unfollow must refresh so Home and own Profile stay aligned. */
export function followInvalidateKeys(viewerId: string, ownerId?: string): unknown[][] {
  const keys: unknown[][] = [
    [...HOME_BOOTSTRAP_QUERY_KEY],
    ["profile", viewerId, "followCounts"],
  ];
  if (ownerId && ownerId !== viewerId) {
    keys.push(["profile", ownerId, "followCounts"]);
    keys.push(["followStatus", ownerId]);
  }
  return keys;
}

export async function invalidateAfterFollow(
  queryClient: QueryClient,
  viewerId: string,
  ownerId?: string,
): Promise<void> {
  await Promise.all(
    followInvalidateKeys(viewerId, ownerId).map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}
