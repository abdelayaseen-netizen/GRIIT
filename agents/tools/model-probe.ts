/**
 * Build 92 12.1: one real call per configured model with a screenshot and the persona system prompt.
 * Prints whether the reply parsed as a decision, tokens and cost. Never prints the key.
 *
 *   npx tsx agents/tools/model-probe.ts <screenshot.png>
 */
import path from "path";
import { fileURLToPath } from "url";
import { askModel } from "../src/claude";
import { loadConfig } from "../src/config";
import { loadEnv, requireEnv } from "../src/env";
import { parseDecision } from "../src/gate";
import { systemPrompt } from "../src/prompt";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function main() {
  loadEnv(root);
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const config = loadConfig();
  const imagePath = path.resolve(process.argv[2] ?? "");
  const prompt = "You are Sam, 30, trying GRIIT for the first time. Screen text:\nHome\nDiscover\nJoin a challenge\n7K Steps\nPick your next action. Reply with one JSON object only.";
  for (const model of [...new Set([config.models.default, config.models.firstDay])]) {
    const started = Date.now();
    const ask = await askModel({ apiKey, model, system: systemPrompt(), prompt, imagePath });
    const decision = parseDecision(ask.raw);
    console.log(`${model}: ${ask.error ? `error ${ask.error}` : "ok"}, parsed=${decision ? `${decision.action} "${decision.target}"` : "no"}, in=${ask.inputTokens} out=${ask.outputTokens} usd=${ask.usd.toFixed(4)} ms=${Date.now() - started}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
