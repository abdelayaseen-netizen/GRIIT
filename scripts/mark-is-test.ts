/**
 * Sets profiles.is_test for one user id. Run only through:
 * railway run --service grit-backend npx tsx scripts/mark-is-test.ts <user-id>
 * The service role stays in the server environment.
 */
import { createClient } from "@supabase/supabase-js";

const userId = process.argv[2]?.trim() ?? "";
if (!/^[0-9a-f-]{36}$/i.test(userId)) {
  console.error("need a user id");
  process.exit(1);
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("server env is missing");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { error } = await supabase.from("profiles").update({ is_test: true }).eq("user_id", userId);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  const { data, error: readError } = await supabase.from("profiles").select("is_test").eq("user_id", userId).maybeSingle();
  if (readError || data?.is_test !== true) {
    console.error(readError?.message || "is_test did not stay true");
    process.exit(1);
  }
  console.log("is_test true");
}

main();
