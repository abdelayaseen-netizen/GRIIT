import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 5 * 60 * 1000; // 5 min fresh
const GC_TIME = 10 * 60 * 1000;  // 10 min cache (gcTime is the new name for cacheTime in v5)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});
