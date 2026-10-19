/**
 * Build 92 12.4: which saved agent accounts can be a Social partner or a returning (Day 2) user.
 * Reads only the account's own rows. Prints counts, never emails or passwords.
 *
 *   npx tsx agents/tools/b92-candidates.ts <runs dir with <chunk>/<persona>/account.json>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { agentClient, readOwnRows, signInAgent } from "../src/account";
import { loadEnv } from "../src/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function main() {
  loadEnv(root);
  const dir = path.resolve(process.argv[2] ?? "");
  const files: string[] = [];
  for (const chunk of fs.readdirSync(dir)) {
    const chunkDir = path.join(dir, chunk);
    if (!fs.statSync(chunkDir).isDirectory()) continue;
    for (const persona of fs.readdirSync(chunkDir)) {
      const file = path.join(chunkDir, persona, "account.json");
      if (fs.existsSync(file)) files.push(file);
    }
  }
  for (const file of files.sort()) {
    const label = path.relative(dir, path.dirname(file));
    const account = JSON.parse(fs.readFileSync(file, "utf8")) as { email?: string; password?: string; anonymous?: boolean };
    if (!account.email || !account.password || account.anonymous) {
      console.log(`${label}\tno password login`);
      continue;
    }
    const client = agentClient();
    const session = await signInAgent(client, account.email, account.password);
    if (!session) {
      console.log(`${label}\tsign-in failed`);
      continue;
    }
    await client.auth.setSession({ access_token: session.accessToken, refresh_token: session.refreshToken });
    const rows = await readOwnRows(client, session.userId);
    const secured = rows.enrollments.map((row) => row.last_secured_date_key).filter(Boolean);
    const proofs = rows.checkins.filter((row) => row.proof_url).length;
    console.log(
      `${label}\tenrollments=${rows.enrollments.length}\tsecured=${secured.join(",") || "-"}\tcheckins=${rows.checkins.length}\tproofs=${proofs}\tcreated=${rows.created.length}\tdays=${[...new Set(rows.checkins.map((row) => row.date_key))].join(",")}`,
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
