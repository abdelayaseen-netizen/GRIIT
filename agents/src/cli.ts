import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { probeIsTestWrite } from "./account";
import { estimate, estimateText, HAIKU_MODEL, money } from "./cost";
import { resetTextSize, restorePrivacy, UDID } from "./device";
import { loadEnv, requireEnv, safeText } from "./env";
import { runPersona, type Spend } from "./loop";
import { MaestroSession } from "./maestro";
import { buildPersonas } from "./personas";
import { writeOutputs } from "./report";
import type { Mode, Persona } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return undefined;
  return process.argv[index + 1];
}

function has(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function runDate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

function pilotPersonas(all: Persona[]): Persona[] {
  const seen = new Set<string>();
  const picked: Persona[] = [];
  for (const persona of all) {
    if (seen.has(persona.group)) continue;
    seen.add(persona.group);
    picked.push(persona);
  }
  return picked;
}

function selectPersonas(all: Persona[]): Persona[] {
  if (has("pilot")) return pilotPersonas(all);
  const per = Number(arg("per") ?? "");
  if (Number.isFinite(per) && per > 0) {
    const counts = new Map<string, number>();
    const picked: Persona[] = [];
    for (const persona of all) {
      const used = counts.get(persona.group) ?? 0;
      if (used >= per) continue;
      counts.set(persona.group, used + 1);
      picked.push(persona);
    }
    return picked;
  }
  const group = arg("group");
  const count = Number(arg("count") ?? "1");
  const modePool = group ? all.filter((persona) => persona.group === group) : all;
  if (!modePool.length) throw new Error(`No personas for group ${group ?? "(all)"}`);
  return modePool.slice(0, Number.isFinite(count) ? count : 1);
}

function vitestHiding(): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["vitest", "run", "backend/trpc/routes/hide-test-authors.test.ts"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });
    child.on("close", (code) => resolve({ ok: code === 0, output }));
  });
}

async function main() {
  loadEnv(root);
  if (!has("pilot") && !has("all") && !arg("mode") && !arg("group") && !arg("per")) {
    console.log("Usage: npm run agents -- --pilot | --all | --mode goal|free --per N | --group <name> --count N [--keep]");
    return;
  }
  const mode: Mode = has("pilot") ? "goal" : arg("mode") === "free" ? "free" : "goal";
  const full = has("all");
  console.log(estimateText(full ? "full" : "pilot"));
  if (full) {
    console.log("\nSTOP. --all waits for your OK. Nothing ran.");
    return;
  }

  const hiding = await vitestHiding();
  if (!hiding.ok) {
    console.log("is_test hiding test failed. No agents ran.");
    console.log(safeText(hiding.output).slice(-800));
    process.exitCode = 1;
    return;
  }
  const hidingNote = "is_test hiding passed: real viewers do not see test authors on the feed, Discover People (profiles.suggested, which is also friend suggestions), the friends leaderboard, the global leaderboard, or a challenge leaderboard. No SQL.";

  const probe = await probeIsTestWrite();
  if (!probe.ok) {
    console.log(`Cannot mark a new account is_test. No UI agents ran. ${probe.detail}`);
    process.exitCode = 1;
    return;
  }
  console.log(probe.detail);

  requireEnv("ANTHROPIC_API_KEY");
  const personas = buildPersonas();
  fs.writeFileSync(path.join(root, "agents", "personas.json"), JSON.stringify(personas, null, 2) + "\n");
  const skipRun = arg("skip-run");
  const capUsd = Number(arg("cap") ?? "10");
  const selected = selectPersonas(personas).filter((persona) => {
    if (!skipRun) return true;
    return !fs.existsSync(path.join(root, "agents", "runs", skipRun, persona.id, "result.json"));
  });
  const planningSteps = mode === "free" ? 40 : 40;
  const worstSteps = mode === "free" ? 120 : 80;
  const planning = estimate(selected.length, planningSteps, HAIKU_MODEL);
  const worst = estimate(selected.length, worstSteps, HAIKU_MODEL);
  const observed = estimate(selected.length, 12, HAIKU_MODEL);
  console.log(
    `Cost estimate: ${selected.length} ${mode} agents. Planning expected ${money(planning.total)} at ${planningSteps} steps. Worst ${money(worst.total)} at ${worstSteps}. Observed v2 pace ${money(observed.total)} at 12 steps. Measured stop at $${Number.isFinite(capUsd) ? capUsd : 10}.`,
  );
  const tag = arg("tag") ?? (mode === "free" ? "free" : has("pilot") ? "v2" : "goal");
  const runDir = path.join(root, "agents", "runs", `${runDate()}-${tag}`);
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, "estimate.txt"), estimateText("pilot") + "\n");
  fs.writeFileSync(path.join(runDir, "hiding.txt"), hidingNote + "\n");

  const maestro = new MaestroSession();
  const spend: Spend = { usd: 0, input: 0, output: 0, calls: 0 };
  let model = HAIKU_MODEL;
  let modelNote = "Haiku 4.5 for every agent. No second-model comparison on this run.";
  const allowedNames = ["Seed GRIIT", "seedgriit"];
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  console.log(`\nRunning ${selected.length} agents on simulator ${UDID}, one at a time. Mode ${mode}.`);
  try {
    await maestro.start();
    for (let i = 0; i < selected.length; i++) {
      const persona = selected[i]!;
      console.log(`\n${persona.id} ${persona.name} (${persona.group})`);
      const outcome = await runPersona({
        persona,
        mode,
        runDir,
        maestro,
        apiKey,
        model,
        spend,
        allowedNames,
        compare: false,
        capUsd: Number.isFinite(capUsd) && capUsd > 0 ? capUsd : 10,
        keep: has("keep"),
      });
      if (outcome.compareNote) {
        model = outcome.model;
        modelNote = outcome.compareNote;
        fs.writeFileSync(path.join(runDir, "model.json"), JSON.stringify({ model, note: modelNote }, null, 2));
      }
      writeOutputs({
        runDir,
        personas,
        spendUsd: spend.usd,
        modelNote,
        hidingNote,
        targetNote: "Production Supabase. No staging project is configured. Simulator: GRIIT iPhone 16. Agents are is_test and can see real posts; the harness blocks likes, comments, and follows except Seed GRIIT and other agents.",
      });
      if (outcome.stopAll) {
        console.log(outcome.result.giveUp);
        break;
      }
      if (spend.usd >= (Number.isFinite(capUsd) && capUsd > 0 ? capUsd : 10)) break;
    }
  } finally {
    maestro.stop();
    await resetTextSize();
    await restorePrivacy();
    writeOutputs({
      runDir,
      personas,
      spendUsd: spend.usd,
      modelNote,
      hidingNote,
      targetNote: "Production Supabase. No staging project is configured. Simulator: GRIIT iPhone 16. Agents are is_test and can see real posts; the harness blocks likes, comments, and follows except Seed GRIIT and other agents.",
    });
  }
  console.log(`\nReport: ${path.join(runDir, "report.html")}`);
  console.log(`Measured cost $${spend.usd.toFixed(2)} across ${spend.calls} calls.`);
  console.log(modelNote);
}

main().catch((err) => {
  console.log(safeText(err instanceof Error ? err.message : "agent run failed"));
  process.exitCode = 1;
});
