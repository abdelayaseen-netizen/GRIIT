import { QueryClient } from "@tanstack/react-query";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes — data is fresh, no refetch
const GC_TIME = 10 * 60 * 1000;   // 10 minutes — cache kept (formerly cacheTime)

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
