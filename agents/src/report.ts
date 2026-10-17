import fs from "fs";
import path from "path";
import type { AgentResult, Persona, StepLog } from "./types";

const STAGES = ["opened", "discover", "challenge", "joined", "task", "completed", "photo", "shared", "social"] as const;

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] ?? ch);
}

function readSteps(file: string): StepLog[] {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as StepLog);
}

function loadResults(runDir: string): { result: AgentResult; steps: StepLog[] }[] {
  const out = [];
  for (const name of fs.readdirSync(runDir)) {
    const resultFile = path.join(runDir, name, "result.json");
    if (!fs.existsSync(resultFile)) continue;
    const result = JSON.parse(fs.readFileSync(resultFile, "utf8")) as AgentResult;
    out.push({ result, steps: readSteps(path.join(runDir, name, "steps.jsonl")) });
  }
  return out;
}

type Problem = { title: string; agents: Set<string>; screen: string; shot: string; steps: string[] };

function problemsOf(runs: { result: AgentResult; steps: StepLog[] }[]): Problem[] {
  const map = new Map<string, Problem>();
  const add = (personaId: string, title: string, screen: string, shot: string, repro: string) => {
    const key = title.toLowerCase().replace(/\s+/g, " ").slice(0, 110);
    if (!key) return;
    const row = map.get(key) ?? { title: title.slice(0, 180), agents: new Set<string>(), screen, shot, steps: [] };
    row.agents.add(personaId);
    if (!row.shot && shot) row.shot = shot;
    if (repro && row.steps.length < 4) row.steps.push(`${personaId}: ${repro}`);
    map.set(key, row);
  };
  for (const run of runs) {
    const id = run.result.personaId;
    for (const step of run.steps) {
      if (step.confusion) add(id, step.confusion, step.screen, path.join(id, step.shot), `${step.action} ${step.target}`.trim());
      if (step.error) add(id, step.error, step.screen, path.join(id, step.shot), `${step.action} ${step.target}`.trim());
    }
    for (const item of run.result.deadEnds) add(id, item, run.result.funnel, "", item);
    for (const item of run.result.wrongNumbers) add(id, item, "challenge", "", item);
    for (const item of run.result.crashes) add(id, item, "launch", "", item);
    if (run.result.giveUp && !/patience|step cap|on their own/i.test(run.result.giveUp)) add(id, run.result.giveUp, run.result.funnel, "", run.result.giveUp);
  }
  return [...map.values()].sort((a, b) => b.agents.size - a.agents.size || a.title.localeCompare(b.title));
}

export function writeOutputs(input: {
  runDir: string;
  personas: Persona[];
  spendUsd: number;
  modelNote: string;
  hidingNote: string;
  targetNote: string;
}) {
  const personaMap = new Map(input.personas.map((p) => [p.id, p]));
  const runs = loadResults(input.runDir);
  const ranked = problemsOf(runs);
  writeCsv(input.runDir, runs);
  const agentDir = path.join(input.runDir, "report", "agents");
  fs.mkdirSync(agentDir, { recursive: true });
  for (const run of runs) {
    const persona = personaMap.get(run.result.personaId);
    fs.writeFileSync(path.join(agentDir, `${run.result.personaId}.html`), agentPage(run, persona, ranked));
  }
  fs.writeFileSync(path.join(input.runDir, "report.html"), overview(input, runs, ranked, personaMap));
}

function writeCsv(runDir: string, runs: { result: AgentResult; steps: StepLog[] }[]) {
  const header = ["persona", "group", "chunk", "step", "timestamp", "screen", "screen_name", "route", "action", "target", "thought", "confusion", "emotion", "latency_ms", "done_to_sheet_ms", "done_to_visible_ms", "error"];
  const lines = [header.join(",")];
  const cell = (value: string | number | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  for (const run of runs) {
    for (const step of run.steps) {
      lines.push(
        [run.result.personaId, run.result.group, step.chunk ?? run.result.chunk ?? "", step.step, step.timestamp, step.screen, step.screenName ?? step.screen, step.route, step.action, step.target, step.thought, step.confusion, step.emotion, step.latencyMs, step.doneToSheetMs, step.doneToVisibleMs, step.error].map(cell).join(","),
      );
    }
  }
  fs.writeFileSync(path.join(runDir, "data.csv"), lines.join("\n") + "\n");
}

function overview(
  input: { runDir: string; spendUsd: number; modelNote: string; hidingNote: string; targetNote: string },
  runs: { result: AgentResult; steps: StepLog[] }[],
  ranked: Problem[],
  personas: Map<string, Persona>,
): string {
  const steps = runs.reduce((sum, run) => sum + run.steps.length, 0);
  const dbGoals = runs.flatMap((run) => run.result.goals.filter((goal) => goal.kind === "db"));
  const dbPass = dbGoals.filter((goal) => goal.pass).length;
  const crashes = runs.reduce((sum, run) => sum + run.result.crashes.length, 0);
  const funnelRows = STAGES.map((stage) => {
    const hit = runs.filter((run) => run.result.stages.includes(stage)).length;
    const pct = runs.length ? Math.round((hit / runs.length) * 100) : 0;
    return `<tr><td>${stage}</td><td>${hit}</td><td>${pct}%</td><td>${runs.length - hit} did not reach it</td></tr>`;
  }).join("");
  const groupRows = groupTable(runs, ranked);
  const top = ranked.slice(0, 10).map((problem, index) => {
    const shot = problem.shot ? `<div><img src="${esc(problem.shot)}" alt=""></div>` : "";
    return `<section><h3>${index + 1}. ${esc(problem.title)}</h3><p>${problem.agents.size} agents. Screen: ${esc(problem.screen)}</p>${shot}<ol>${problem.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol></section>`;
  }).join("");
  const confusion = confusionBlocks(runs);
  const dwell = dwellTable(runs);
  const emotion = emotionTable(runs);
  const links = runs.map((run) => `<li><a href="report/agents/${esc(run.result.personaId)}.html">${esc(run.result.personaId)}</a> ${esc(personas.get(run.result.personaId)?.name ?? "")} · ${esc(run.result.funnel)} · ${run.result.steps} steps</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>GRIIT agent pilot</title>
<style>
body{font:16px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;margin:32px auto;max-width:960px;color:#1a1918;background:#f7f5f1}
h1{font-size:28px;margin-bottom:8px} h2{margin-top:32px;font-size:20px}
table{border-collapse:collapse;width:100%;background:#fff} td,th{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
img{width:180px;border-radius:8px;background:#111}
section{background:#fff;padding:12px 16px;margin:12px 0;border-radius:10px}
code{font-size:13px}
</style></head><body>
<h1>GRIIT agent pilot</h1>
<p>${esc(input.targetNote)}</p>
<p>${esc(input.modelNote)}</p>
<p>${esc(input.hidingNote)}</p>
<h2>Overview</h2>
<table><tr><th>Agents</th><td>${runs.length}</td></tr>
<tr><th>Steps</th><td>${steps}</td></tr>
<tr><th>Measured API cost</th><td>$${input.spendUsd.toFixed(2)}</td></tr>
<tr><th>Database goals passed</th><td>${dbPass} / ${dbGoals.length}</td></tr>
<tr><th>Crashes</th><td>${crashes}</td></tr></table>
<h2>Funnel</h2>
<p>Counts are agents who reached the stage. Returned is not measured. Multi-day mode is not built.</p>
<table><tr><th>Stage</th><th>Agents</th><th>Share</th><th>Drop-off</th></tr>${funnelRows}</table>
${groupRows}
<h2>Where they spend time</h2>
${dwell}
<h2>Free-roam</h2>
<p>Not run. This report is goal mode only.</p>
<h2>Stuck</h2>
${ranked.filter((p) => /repeated|gave up|stuck/i.test(p.title)).slice(0, 8).map((p) => `<p>${esc(p.title)} (${p.agents.size})</p>`).join("") || "<p>No repeated-screen give-ups.</p>"}
<h2>Confusion</h2>
${confusion || "<p>No confusion notes.</p>"}
<h2>Emotion</h2>
${emotion}
<h2>Top 10 fixes</h2>
${top || "<p>No problems recorded.</p>"}
<h2>Agents</h2>
<ul>${links}</ul>
</body></html>`;
}

function groupTable(runs: { result: AgentResult; steps: StepLog[] }[], ranked: Problem[]): string {
  const groups = [...new Set(runs.map((run) => run.result.group))];
  const rows = groups.map((group) => {
    const mine = runs.filter((run) => run.result.group === group);
    const goals = mine.flatMap((run) => run.result.goals.filter((goal) => goal.kind === "db"));
    const passed = goals.filter((goal) => goal.pass).length;
    const rate = goals.length ? Math.round((passed / goals.length) * 100) : 0;
    const avg = mine.length ? Math.round(mine.reduce((sum, run) => sum + run.result.steps, 0) / mine.length) : 0;
    const top = ranked.filter((problem) => [...problem.agents].some((id) => mine.some((run) => run.result.personaId === id))).slice(0, 3);
    return `<tr><td>${esc(group)}</td><td>${rate}% (${passed}/${goals.length || 0})</td><td>${avg}</td><td>${top.map((problem) => esc(problem.title)).join("<br>")}</td></tr>`;
  });
  return `<h2>Per group</h2><table><tr><th>Group</th><th>DB goal pass rate</th><th>Avg steps</th><th>Top problems</th></tr>${rows.join("")}</table>`;
}

function dwellTable(runs: { result: AgentResult; steps: StepLog[] }[]): string {
  const stats = new Map<string, { entries: number; steps: number; ms: number; backs: number }>();
  for (const run of runs) {
    let prev = "";
    for (const step of run.steps) {
      const row = stats.get(step.screen) ?? { entries: 0, steps: 0, ms: 0, backs: 0 };
      if (step.screen !== prev) row.entries += 1;
      row.steps += 1;
      row.ms += step.latencyMs;
      if (step.action === "back") row.backs += 1;
      stats.set(step.screen, row);
      prev = step.screen;
    }
  }
  const rows = [...stats.entries()].sort((a, b) => b[1].steps - a[1].steps).map(([screen, row]) => `<tr><td>${esc(screen)}</td><td>${row.entries}</td><td>${row.steps}</td><td>${Math.round(row.ms / 1000)}s</td><td>${row.backs}</td></tr>`);
  return `<table><tr><th>Screen</th><th>Entries</th><th>Steps</th><th>Time</th><th>Backs</th></tr>${rows.join("")}</table>`;
}

function emotionTable(runs: { steps: StepLog[] }[]): string {
  const stats = new Map<string, { all: number; frustrated: number }>();
  for (const run of runs) {
    for (const step of run.steps) {
      const row = stats.get(step.screen) ?? { all: 0, frustrated: 0 };
      row.all += 1;
      if (step.emotion === "frustrated") row.frustrated += 1;
      stats.set(step.screen, row);
    }
  }
  const rows = [...stats.entries()].map(([screen, row]) => `<tr><td>${esc(screen)}</td><td>${row.all ? Math.round((row.frustrated / row.all) * 100) : 0}%</td></tr>`);
  return `<table><tr><th>Screen</th><th>Frustrated</th></tr>${rows.join("")}</table>`;
}

function confusionBlocks(runs: { result: AgentResult; steps: StepLog[] }[]): string {
  const lines: string[] = [];
  for (const run of runs) {
    for (const step of run.steps) {
      if (!step.confusion) continue;
      lines.push(`<li><strong>${esc(run.result.group)}</strong> · ${esc(step.screen)} · ${esc(step.confusion)}</li>`);
    }
  }
  return lines.length ? `<ul>${lines.join("")}</ul>` : "";
}

function agentPage(run: { result: AgentResult; steps: StepLog[] }, persona: Persona | undefined, ranked: Problem[]): string {
  const timeline = run.steps.map((step) => `<article><img src="../../${esc(run.result.personaId)}/${esc(step.shot)}" alt=""><div><p><strong>${step.step}. ${esc(step.screen)}</strong> ${esc(step.action)} ${esc(step.target)}</p><p>${esc(step.thought)}</p>${step.confusion ? `<p>Confusion: ${esc(step.confusion)}</p>` : ""}${step.error ? `<p>Error: ${esc(step.error)}</p>` : ""}<p>${esc(step.emotion)} · ${step.latencyMs}ms</p></div></article>`).join("");
  const goals = run.result.goals.map((goal) => `<li>${goal.pass ? "Pass" : "Fail"} · ${esc(goal.kind)} · ${esc(goal.text)} <br><small>${esc(goal.detail)}</small></li>`).join("");
  const issues = ranked.filter((problem) => problem.agents.has(run.result.personaId)).slice(0, 8).map((problem) => `<li>${esc(problem.title)}</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(run.result.personaId)}</title>
<style>body{font:16px/1.45 -apple-system,sans-serif;margin:24px auto;max-width:880px;background:#f7f5f1} article{display:flex;gap:12px;background:#fff;padding:12px;margin:10px 0;border-radius:10px} img{width:200px;height:auto;background:#111;border-radius:8px} a{color:#7a2e10}</style></head><body>
<p><a href="../../report.html">All agents</a></p>
<h1>${esc(persona?.name ?? run.result.personaId)}</h1>
<p>${esc(persona?.background ?? "")}</p>
<p>${esc(persona?.why ?? "")} Tech ${esc(persona?.tech ?? "")}, patience ${persona?.patience ?? ""}, phone ${esc(persona?.phone ?? "")}, text ${esc(persona?.textSize ?? "")}, ${esc(persona?.motivation ?? "")}, English ${esc(persona?.english ?? "")}.</p>
<p>Funnel stage: ${esc(run.result.funnel)}. Stages: ${esc(run.result.stages.join(" → ") || "none")}. Steps ${run.result.steps}. ${run.result.durationSec}s. is_test ${String(run.result.isTest)}. ${esc(run.result.giveUp)}</p>
<p>${esc(run.result.device)} Text size applied: ${esc(run.result.textSizeApplied)}. Cleanup: ${esc(run.result.cleanup)}</p>
<h2>Goals</h2><ul>${goals}</ul>
<h2>Issues</h2><ul>${issues}</ul>
<h2>Timeline</h2>${timeline}
</body></html>`;
}
