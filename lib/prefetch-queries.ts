import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const ACTIVE_STALE_MS = 2 * 60 * 1000;

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
