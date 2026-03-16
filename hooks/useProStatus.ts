import { useQuery } from "@tanstack/react-query";
import { isProUser } from "@/lib/revenue-cat";

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export function useProStatus() {
  const { data: isPro = false, isLoading, refetch } = useQuery({
    queryKey: ["pro-status"],
    queryFn: isProUser,
    staleTime: STALE_TIME_MS,
  });
  return { isPro, isLoading, refetch };
}
