/**
 * Standalone test: run the same Supabase query as getFeatured (challenges) using anon key.
 * Use: npx tsx scripts/test-discover.ts
 * If this returns 0 rows, the problem is RLS or data. If it returns rows, the problem is tRPC/network.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Load .env or set in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Exact same filters as backend getFeatured (no search/category)
  const { data, error, count } = await supabase
    .from("challenges")
    .select("*, challenge_tasks (*)", { count: "exact" })
    .eq("visibility", "PUBLIC")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("participants_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(0, 49);

  if (error) {
    console.error("Supabase query error:", error.message, error.code, error.details);
    process.exit(1);
  }

  console.log("Count (total matching):", count ?? "null");
  console.log("Rows returned:", data?.length ?? 0);
  if (data && data.length > 0) {
    console.log("First challenge id:", (data[0] as { id: string }).id);
    console.log("First challenge title:", (data[0] as { title?: string }).title);
  }
}

main();
