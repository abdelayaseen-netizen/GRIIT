import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 2 * 60 * 1000; // 2 min fresh
const GC_TIME = 10 * 60 * 1000;  // 10 min cache (gcTime is the new name for cacheTime in v5)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});
