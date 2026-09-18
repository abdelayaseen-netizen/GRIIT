import { useQuery } from "@tanstack/react-query";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";
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
};

export type HomeBootstrap = {
  profile: ProfileFromApi | null;
  stats: StatsFromApi | null;
  activeChallenges: unknown[] | null;
  activeChallenge: ActiveChallengeFromApi | null;
  todayCheckinsForUser: TodayCheckinForUser[] | null;
  todayCheckins: TodayCheckinForUser[] | null;
  securedDateKeys: string[] | null;
  freezeStatus: HomeBootstrapFreezeStatus | null;
  followCounts: HomeBootstrapFollowCounts | null;
  failed: string[];
};

export function useHomeBootstrap(userId: string | undefined) {
  return useQuery({
    queryKey: homeBootstrapQueryKey(userId ?? ""),
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    queryFn: () => trpcQuery<HomeBootstrap>(TRPC.home.bootstrap),
  });
}
