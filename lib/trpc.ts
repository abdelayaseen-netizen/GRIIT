import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import { supabase } from "./supabase";
import { getTrpcUrl, fetchWithRetry } from "./api";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
      async headers() {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      fetch: fetchWithRetry,
    }),
  ],
});
