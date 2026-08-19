import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Fresh service-role client — setup/assert only. Never use in the act phase. */
export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("[integration] EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
