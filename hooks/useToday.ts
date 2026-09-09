import { useQuery, type QueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { type TodayState } from "@/lib/today-state";

export const TODAY_QUERY_KEY = ["today", "get"] as const;

export function useToday() {
  const { user } = useAuth();
  const isGuest = useIsGuest();
  return useQuery({
    queryKey: [...TODAY_QUERY_KEY, user?.id ?? ""],
    enabled: !isGuest && !!user?.id,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
    queryFn: () => trpcQuery(TRPC.today.get) as Promise<TodayState>,
  });
}

export function invalidateToday(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: TODAY_QUERY_KEY });
}
