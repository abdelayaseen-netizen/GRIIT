import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

const CHALLENGE_STALE_MS = 5 * 60 * 1000;
const ACTIVE_STALE_MS = 2 * 60 * 1000;

/** Matches `app/challenge/[id].tsx` — `trpcQuery(TRPC.challenges.getById, { id })`. */
export function prefetchChallengeById(queryClient: QueryClient, id: string) {
  return queryClient.prefetchQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery(TRPC.challenges.getById, { id }),
    staleTime: CHALLENGE_STALE_MS,
  });
}

/** Matches `app/challenge/active/[activeChallengeId].tsx` Supabase `active_challenges` query. */
export function prefetchActiveChallengeById(queryClient: QueryClient, activeChallengeId: string) {
  return queryClient.prefetchQuery({
    queryKey: ["activeChallenge", activeChallengeId],
    staleTime: ACTIVE_STALE_MS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_challenges")
        .select(
          `
          *,
          challenges (
            id, title, description, duration_days, difficulty, category, duration_type,
            challenge_tasks ( id, title, task_type, order_index )
          )
        `
        )
        .eq("id", activeChallengeId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
