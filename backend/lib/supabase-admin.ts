/**
 * Supabase client with service role for cron/jobs that need to read all users' data.
 * Only use in server-side cron; never expose to the client.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin() {
  if (!supabaseUrl) throw new Error("EXPO_PUBLIC_SUPABASE_URL is required");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for cron");
  return createClient(supabaseUrl, serviceRoleKey);
}

export function hasSupabaseAdmin(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}
