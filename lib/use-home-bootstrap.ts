import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";
import { traceMark } from "@/lib/startup-trace";
import { peekHomeBootstrapCache, readHomeBootstrapCache, writeHomeBootstrapCache } from "@/lib/home-bootstrap-cache";
import type { ActiveChallengeFromApi, ProfileFromApi, StatsFromApi, TodayCheckinForUser } from "@/types";

export { HOME_BOOTSTRAP_QUERY_KEY, homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";

export type HomeBootstrapFreezeStatus = {
  remaining: number;
  limit: number;
  isPro: boolean;
  lastFreezeUsedAt?: string | null;
};

export type HomeBootstrapFollowCounts = {
  followers: number;
  following: number;
  friends?: number;
};

export type HomeBootstrap = {
  profile: ProfileFromApi | null;
  stats: StatsFromApi | null;
  activeChallenges: unknown[] | null;
  queuedChallenges: unknown[] | null;
  activeChallenge: ActiveChallengeFromApi | null;
  todayCheckinsForUser: TodayCheckinForUser[] | null;
  todayCheckins: TodayCheckinForUser[] | null;
  securedDateKeys: string[] | null;
  freezeStatus: HomeBootstrapFreezeStatus | null;
  followCounts: HomeBootstrapFollowCounts | null;
  failed: string[];
};

/**
 * `fromCache` (Home only): while the first fetch is in flight, show the last complete bootstrap
 * saved on this device as placeholder data. Placeholder data leaves `isFetched` false and sets
 * `isPlaceholderData`, so anything that acts on the answer waits for the live one.
 */
export function useHomeBootstrap(userId: string | undefined, opts?: { fromCache?: boolean }) {
  const fromCache = opts?.fromCache === true && !!userId;
  const [cached, setCached] = useState<HomeBootstrap | null>(() =>
    fromCache && userId ? (peekHomeBootstrapCache(userId) ?? null) : null
  );
  useEffect(() => {
    if (!fromCache || !userId) {
      setCached(null);
      return;
    }
    let live = true;
    void readHomeBootstrapCache(userId).then((data) => {
      if (!live) return;
      if (data) traceMark("home_cache");
      setCached(data);
    });
    return () => {
      live = false;
    };
  }, [fromCache, userId]);

  return useQuery({
    queryKey: homeBootstrapQueryKey(userId ?? ""),
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev ?? cached ?? undefined,
    queryFn: async () => {
      traceMark("bootstrap_start");
      const data = await trpcQuery<HomeBootstrap>(TRPC.home.bootstrap);
      traceMark("bootstrap_done");
      if (userId) writeHomeBootstrapCache(userId, data);
      return data;
    },
  });
}
