import { config } from "dotenv";

config({ path: ".env" });

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url) {
  throw new Error(
    "[integration] EXPO_PUBLIC_SUPABASE_URL is required (load from .env; vitest.integration.config has no env block)."
  );
}
if (!serviceRole) {
  throw new Error(
    "[integration] SUPABASE_SERVICE_ROLE_KEY is required in .env for live-DB integration tests."
  );
}
if (url.includes("test.supabase.co")) {
  throw new Error(
    "[integration] Refusing to run against the unit-test placeholder URL (test.supabase.co)."
  );
}
