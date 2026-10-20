/**
 * Build 92 13: one reader for both overnight runs, so build 90 and build 92 are counted the same way.
 *
 *   npx tsx agents/src/build92-compare.ts --b90 docs/reports/oct-build90 --b92 docs/reports/oct-build92
 *
 * Writes screens.csv and steps-all.csv into each run folder (same columns for both builds) and prints the
 * comparison table as markdown (also written to <b92>/compare.md).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CHUNKS, rescored, type Run } from "./build90";
import { isWasted, screensCsv, securedDay } from "./build92-report";
import type { AgentResult, Persona, StepLog } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Every <dir>/<group>/<persona>/result.json, with persona.json when the run wrote one. */
export function readRunDir(dir: string): Run[] {
  const out: Run[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const group of fs.readdirSync(dir).sort()) {
    const groupDir = path.join(dir, group);
    if (!fs.statSync(groupDir).isDirectory()) continue;
    for (const id of fs.readdirSync(groupDir).sort()) {
      const file = path.join(groupDir, id, "result.json");
      if (!fs.existsSync(file)) continue;
      const result = rescored(JSON.parse(fs.readFileSync(file, "utf8")) as AgentResult);
      const stepsFile = path.join(groupDir, id, "steps.jsonl");
      const steps = fs.existsSync(stepsFile)
        ? fs.readFileSync(stepsFile, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as StepLog)
        : [];
      const personaFile = path.join(groupDir, id, "persona.json");
      const persona = fs.existsSync(personaFile)
        ? (JSON.parse(fs.readFileSync(personaFile, "utf8")) as Persona)
        : (CHUNKS.flatMap((c) => c.personas).find((p) => p.id === id) ?? ({ id, name: id, group: result.group, chunk: result.chunk, fresh: false } as Persona));
      out.push({ result, steps, persona });
    }
  }
  return out;
}

const screenOf = (s: StepLog) => (s.screenName || s.screen || "").trim().toLowerCase();

/** A loop: 3 or more steps in a row on the same screen. Each unbroken run counts once. */
export function loops(steps: StepLog[]): number {
  let count = 0;
  let run = 0;
  let previous = "";
  for (const step of steps) {
    const screen = screenOf(step);
    run = screen === previous ? run + 1 : 1;
    previous = screen;
    if (run === 3) count += 1;
  }
  return count;
}

/** A new user: a fresh persona (started from a wiped app). Build 90 runs take the flag from its CHUNKS. */
export const isNewUser = (run: Run) => run.persona.fresh === true;

export function stepsAllCsv(runs: Run[]): string {
  const header = ["persona", "group", "step", "timestamp", "screen", "screen_name", "action", "target", "wasted", "stuck", "error", "thought"];
  const cell = (v: string | number | boolean | undefined) => `"${String(v ?? "").replace(/"/g, '""').replace(/\s+/g, " ")}"`;
  const rows = [header.join(",")];
  for (const run of runs) {
    for (const s of run.steps) {
      rows.push([run.result.personaId, run.result.group, s.step, s.timestamp, s.screen, s.screenName, s.action, s.target, isWasted(s), s.stuck ?? "", s.error, s.thought].map(cell).join(","));
    }
  }
  return rows.join("\n") + "\n";
}

export type Numbers = {
  sessions: number;
  newUsers: number;
  day1Secured: number;
  loopsPerSession: number;
  wastedPerVisit: number;
  wastedTaps: number;
  screenVisits: number;
  topWasted: { screen: string; wasted: number; visits: number }[];
  quizPeople: number;
  words: { secured: number; selfReported: number; freeze: number };
  crashSessions: number;
  costUsd: number | null;
  calls: number | null;
};

export function numbers(runs: Run[], spendFile: string): Numbers {
  const fresh = runs.filter(isNewUser);
  const perScreen = new Map<string, { wasted: number; visits: number }>();
  let visits = 0;
  let wasted = 0;
  for (const run of runs) {
    let previous = "";
    for (const s of run.steps) {
      const screen = screenOf(s);
      const e = perScreen.get(screen) ?? { wasted: 0, visits: 0 };
      if (screen !== previous) {
        e.visits += 1;
        visits += 1;
      }
      previous = screen;
      if (isWasted(s)) {
        e.wasted += 1;
        wasted += 1;
      }
      perScreen.set(screen, e);
    }
  }
  const quiz = runs.filter((r) => r.result.interview?.asked);
  const spend = fs.existsSync(spendFile) ? fs.readFileSync(spendFile, "utf8") : "";
  const usd = spend.match(/^([\d.]+) USD/);
  const calls = spend.match(/(\d+) calls/);
  return {
    sessions: runs.length,
    newUsers: fresh.length,
    day1Secured: fresh.filter(securedDay).length,
    loopsPerSession: runs.length ? runs.reduce((n, r) => n + loops(r.steps), 0) / runs.length : 0,
    wastedPerVisit: visits ? wasted / visits : 0,
    wastedTaps: wasted,
    screenVisits: visits,
    topWasted: [...perScreen.entries()].map(([screen, e]) => ({ screen, ...e })).filter((e) => e.wasted > 0).sort((a, b) => b.wasted - a.wasted).slice(0, 5),
    quizPeople: quiz.length,
    words: {
      secured: quiz.filter((r) => r.result.interview!.securedRight).length,
      selfReported: quiz.filter((r) => r.result.interview!.selfReportedRight).length,
      freeze: quiz.filter((r) => r.result.interview!.freezeRight).length,
    },
    crashSessions: runs.filter((r) => r.result.crashes.length > 0).length,
    costUsd: usd ? Number(usd[1]) : null,
    calls: calls ? Number(calls[1]) : null,
  };
}

const pct = (n: number, of: number) => (of ? `${n} of ${of} (${Math.round((100 * n) / of)}%)` : "—");

export function compareTable(a: Numbers, b: Numbers): string[] {
  const word = (n: Numbers, k: keyof Numbers["words"]) => pct(n.words[k], n.quizPeople);
  const cost = (n: Numbers) => (n.costUsd == null ? "—" : `$${n.costUsd.toFixed(2)}${n.calls ? ` (${n.calls} calls)` : ""}`);
  return [
    "| | Build 90 (Oct 17) | Build 92 |",
    "|---|---|---|",
    `| Day 1 secured, new users | ${pct(a.day1Secured, a.newUsers)} | ${pct(b.day1Secured, b.newUsers)} |`,
    `| Loops per session (3+ steps in a row on one screen) | ${a.loopsPerSession.toFixed(2)} (${a.sessions} sessions) | ${b.loopsPerSession.toFixed(2)} (${b.sessions} sessions) |`,
    `| Wasted taps per screen visit | ${a.wastedPerVisit.toFixed(2)} (${a.wastedTaps} of ${a.screenVisits} visits) | ${b.wastedPerVisit.toFixed(2)} (${b.wastedTaps} of ${b.screenVisits} visits) |`,
    `| Words understood: Secured | ${word(a, "secured")} | ${word(b, "secured")} |`,
    `| Words understood: Self-reported | ${word(a, "selfReported")} | ${word(b, "selfReported")} |`,
    `| Words understood: Freeze | ${word(a, "freeze")} | ${word(b, "freeze")} |`,
    "| Words understood: Rest | not asked | not asked (no \"Rest\" word in the app) |",
    `| Sessions with a crash | ${a.crashSessions} of ${a.sessions} | ${b.crashSessions} of ${b.sessions} |`,
    `| Cost | ${cost(a)} | ${cost(b)} |`,
  ];
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i < 0 ? undefined : process.argv[i + 1];
}

function main() {
  const b90 = path.resolve(arg("b90") ?? path.join(root, "docs/reports/oct-build90"));
  const b92 = path.resolve(arg("b92") ?? path.join(root, "docs/reports/oct-build92"));
  const results: Numbers[] = [];
  for (const dir of [b90, b92]) {
    const runs = readRunDir(dir);
    fs.writeFileSync(path.join(dir, "screens.csv"), screensCsv(runs));
    fs.writeFileSync(path.join(dir, "steps-all.csv"), stepsAllCsv(runs));
    results.push(numbers(runs, path.join(dir, "spend.txt")));
  }
  const [a, b] = results as [Numbers, Numbers];
  const top = (n: Numbers) => n.topWasted.map((t) => `${t.screen} ${t.wasted} (${t.visits} visits)`).join("; ") || "none";
  const md = [
    ...compareTable(a, b),
    "",
    `Most wasted taps, build 90: ${top(a)}.`,
    `Most wasted taps, build 92: ${top(b)}.`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(b92, "compare.md"), md);
  console.log(md);
  console.log(JSON.stringify({ b90: a, b92: b }));
}

const entry = process.argv[1] ?? "";
if (/build92-compare\.ts$/.test(entry)) main();
