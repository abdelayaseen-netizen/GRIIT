import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _initError: Error | null = null;

function initClient(): SupabaseClient {
  if (_initError) throw _initError;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    const missing = [
      !url ? "EXPO_PUBLIC_SUPABASE_URL" : null,
      !anon ? "EXPO_PUBLIC_SUPABASE_ANON_KEY" : null,
    ].filter(Boolean) as string[];
    _initError = new Error(`Backend Supabase config missing: ${missing.join(", ")}`);
    throw _initError;
  }
  _client = createClient(url, anon);
  return _client;
}

/** Returns the shared anon Supabase client; throws on first use if env is missing. */
export function getSupabase(): SupabaseClient {
  if (_initError) throw _initError;
  if (_client) return _client;
  return initClient();
}

/** Liveness / config probe only — no network; does not throw. */
export function getSupabaseConfigStatus(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()) {
    missing.push("EXPO_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }
  return { ok: missing.length === 0, missing };
}

/**
 * Backwards-compatible lazy client: import sites stay the same; first property access
 * initializes (or throws with a clear error if env is missing).
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client as object, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
