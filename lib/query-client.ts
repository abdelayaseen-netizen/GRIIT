import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { captureError } from "@/lib/sentry";

const STALE_TIME = 5 * 60 * 1000; // 5 min fresh
const GC_TIME = 10 * 60 * 1000;  // 10 min cache (gcTime is the new name for cacheTime in v5)

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      captureError(error, "ReactQuery");
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      captureError(error, "ReactMutation");
    },
  }),
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
