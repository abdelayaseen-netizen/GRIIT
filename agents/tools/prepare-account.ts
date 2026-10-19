/**
 * Build 92 12.4: create one is_test account with onboarding done and save its login, e.g. the History
 * account the seed in docs/sql/build92.sql writes 34 days of history for. Prints the user id only.
 * The out path must be git-ignored (docs/reports/** /account.json is).
 *
 *   npx tsx agents/tools/prepare-account.ts <persona id> <display name> <out account.json>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prepareAgentAccount } from "../src/account";
import { loadEnv } from "../src/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function main() {
  loadEnv(root);
  const [id, name, out] = process.argv.slice(2);
  if (!id || !name || !out) throw new Error("usage: prepare-account.ts <persona id> <display name> <out account.json>");
  const prepared = await prepareAgentAccount(id, name);
  if (!prepared.ok || !prepared.creds || !prepared.userId) throw new Error(prepared.detail);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(path.resolve(out), JSON.stringify({ ...prepared.creds, userId: prepared.userId, isTest: true, anonymous: false }, null, 2) + "\n");
  console.log(`user_id ${prepared.userId}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
