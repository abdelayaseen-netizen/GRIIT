/**
 * Server-side Supabase client with service role for operations that must
 * run without the user's JWT (e.g. OAuth callback writing connected_accounts).
 * Never expose this client or service role key to the frontend.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseServer(): ReturnType<typeof createClient> | null {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}
