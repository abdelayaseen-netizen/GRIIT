import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { captureError } from "@/lib/sentry";

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
      staleTime: 60_000, // 1 min — most data is fresh enough
      gcTime: 5 * 60_000, // 5 min memory cache
      retry: 1,
      refetchOnWindowFocus: false, // RN doesn't have window focus the way web does
      refetchOnReconnect: true,
    },
  },
});
