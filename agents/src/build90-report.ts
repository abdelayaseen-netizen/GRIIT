/**
 * Build 90 10.4: the combined morning report.
 *
 *   npx tsx agents/src/build90-report.ts --out /path/to/docs/reports/oct-build90 [--sha 5d3de5b] [--build 91] [--notes <out>/NOTES.md]
 *
 * NOTES.md (hand-written, optional) goes in as "What the screenshots show" after the scorecard.
 *
 * Reads <out>/<chunk>/ (result.json, steps.jsonl, summary.json) and writes REPORT.md, REPORT.html and
 * REPORT.pdf (WebKit, agents/tools/html2pdf.swift). Scores in the 10-category scorecard are rules from the
 * numbers; the "why" column says which numbers. Judgment lines can be edited in REPORT.md afterwards.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CHUNKS, cleanTiming, rescored } from "./build90";
import { tomorrowScore } from "./interview";
import type { AgentResult, Persona, StepLog } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index < 0 ? undefined : process.argv[index + 1];
}

type Run = { result: AgentResult; steps: StepLog[]; persona: Persona; chunk: string };

function readAll(out: string): Run[] {
  const runs: Run[] = [];
  for (const chunk of CHUNKS) {
    for (const persona of chunk.personas) {
      const file = path.join(out, chunk.slug, persona.id, "result.json");
      if (!fs.existsSync(file)) continue;
      const result = rescored(JSON.parse(fs.readFileSync(file, "utf8")) as AgentResult);
      const stepsFile = path.join(out, chunk.slug, persona.id, "steps.jsonl");
      const steps = fs.existsSync(stepsFile) ? fs.readFileSync(stepsFile, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as StepLog) : [];
      runs.push({ result, steps, persona, chunk: chunk.slug });
    }
  }
  return runs;
}

function median(values: number[]): number | null {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");
const ms = (v: number | null | undefined) => (v == null ? "—" : `${v} ms`);
const sawText = (run: Run, re: RegExp) => run.steps.some((step) => re.test(`${step.screenName} ${step.target} ${step.thought} ${step.error} ${step.confusion}`));

export function buildReport(out: string, sha: string, build: string, notes = ""): string {
  const runs = readAll(out);
  const fresh = runs.filter((r) => r.persona.fresh);
  const secured = (r: Run) => sawText(r, /day secured/i) || r.result.doneTimings.some((t) => /day secured/i.test(t.marker));
  const freshSecured = fresh.filter(secured);
  const joined = runs.filter((r) => r.result.stages.includes("joined"));
  const firstTask = runs.filter((r) => r.result.stages.includes("task"));
  const completed = runs.filter((r) => r.result.stages.includes("completed"));
  const photo = runs.filter((r) => r.result.stages.includes("photo"));
  const timings = runs.flatMap((r) => r.result.doneTimings.map(cleanTiming));
  const doneToSheet = median(timings.map((t) => t.toSheetMs ?? NaN));
  const doneToVisible = median(timings.map((t) => t.toVisibleMs ?? NaN));
  const photoPost = median(timings.filter((t) => /post/i.test(t.choice)).map((t) => t.toVisibleMs ?? NaN));
  const asked = runs.filter((r) => r.result.interview?.asked);
  const right = (key: "securedRight" | "freezeRight" | "selfReportedRight") => asked.filter((r) => r.result.interview?.[key]).length;
  const concept = asked.length ? Math.round(((right("securedRight") + right("freezeRight") + right("selfReportedRight")) / (asked.length * 3)) * 100) : 0;
  const tomorrow = asked.map((r) => tomorrowScore(r.result.interview?.tomorrow ?? "")).filter((n): n is number => n != null);
  const crashes = runs.filter((r) => r.result.crashes.length);
  const under15 = runs.filter((r) => r.result.steps < 15 && !r.result.crashes.length);
  const welcome = fresh.filter((r) => r.result.startedOn === "welcome");
  const gaveUpRepeat = runs.filter((r) => /repeated 3 times/.test(r.result.giveUp));
  const stoppedOwn = runs.filter((r) => /on their own/.test(r.result.giveUp));
  const spendFile = path.join(out, "spend.txt");
  const spend = fs.existsSync(spendFile) ? fs.readFileSync(spendFile, "utf8").trim() : "not recorded";
  const chunkFolders = CHUNKS.map((c) => c.slug).concat("6-words").map((slug) => `${slug}: ${fs.existsSync(path.join(out, slug, "summary.md")) ? "written" : "missing"}${fs.existsSync(path.join(out, slug, "crash.txt")) ? " (crash.txt present)" : ""}`);

  // Problems, ranked by how many sessions hit them.
  const problems = new Map<string, Set<string>>();
  const add = (key: string, id: string) => {
    const clean = key.replace(/\s+/g, " ").trim().slice(0, 120);
    if (!clean) return;
    const set = problems.get(clean) ?? new Set<string>();
    set.add(id);
    problems.set(clean, set);
  };
  for (const r of runs) {
    for (const step of r.steps) {
      if (step.confusion) add(`${step.screenName || step.screen}: ${step.confusion}`, r.result.personaId);
      if (step.error && !/refused|owed/.test(step.error)) add(`${step.screenName || step.screen}: ${step.error}`, r.result.personaId);
    }
    for (const item of r.result.deadEnds) add(item, r.result.personaId);
    for (const item of r.result.wrongNumbers) add(item, r.result.personaId);
    for (const item of r.result.crashes) add(`crash: ${item}`, r.result.personaId);
  }
  const ranked = [...problems.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 12);

  // Scorecard: rules from the numbers. Same 10 categories as 12 and 14 Oct; loop, onboarding and data weighted double.
  const share = fresh.length ? freshSecured.length / fresh.length : 0;
  const score = (value: number, bands: [number, number][]): number => {
    for (const [min, s] of bands) if (value >= min) return s;
    return bands[bands.length - 1]?.[1] ?? 1;
  };
  const loopScore = score(runs.length ? completed.length / runs.length : 0, [[0.8, 9], [0.6, 8], [0.45, 7], [0.3, 6], [0.15, 5], [0, 3]]);
  const onboardingScore = score(share, [[0.7, 9], [0.5, 8], [0.35, 7], [0.25, 6], [0.15, 5], [0, 3]]);
  const perfScore = doneToVisible == null ? 4 : doneToVisible <= 500 ? 9 : doneToVisible <= 1000 ? 8 : doneToVisible <= 2000 ? 6 : 4;
  const reliabilityScore = crashes.length === 0 ? 8 : crashes.length <= 2 ? 6 : 4;
  const wrongNumbers = runs.reduce((n, r) => n + r.result.wrongNumbers.length, 0);
  const dataScore = wrongNumbers === 0 ? 8 : wrongNumbers <= 2 ? 6 : 4;
  const safetyRuns = runs.filter((r) => r.chunk === "5-safety-edge");
  const blockedSeen = safetyRuns.filter((r) => sawText(r, /not allowed|isn.?t allowed|can.?t use|blocked|try another|pick another|language|contains|inappropriate|choose a different|that word/i)).length;
  const rude = /shit|bullshit|fuck|\bass\b/i;
  // The server filter only answers when the text is submitted: a type step with a rude word followed by a
  // save/create/post/comment tap. Typing alone (step 1 of Create says "Looks good" for length) is not a test.
  const submittedRude = safetyRuns.filter((r) => {
    const typedAt = r.steps.findIndex((s) => s.action === "type" && rude.test(s.text ?? ""));
    return typedAt >= 0 && r.steps.slice(typedAt + 1).some((s) => s.action === "tap" && /^(save|create|post|publish|comment|send|start challenge|done)/i.test(s.target));
  });
  const typedRude = safetyRuns.filter((r) => r.steps.some((s) => s.action === "type" && rude.test(s.text ?? "")));
  // Nothing submitted means the filter was not exercised; that is "not measured" (5), not a failure.
  const securityScore = !submittedRude.length && blockedSeen === 0 ? 5 : blockedSeen >= 3 ? 8 : blockedSeen >= 1 ? 6 : 4;
  const conceptScoreBand = concept >= 60 ? 8 : concept >= 35 ? 6 : concept > 0 ? 4 : 2;
  const rows: [string, number, string][] = [
    ["Product loop", loopScore, `${completed.length} of ${runs.length} finished a task, ${photo.length} with a photo.`],
    ["UX and onboarding", onboardingScore, `${freshSecured.length} of ${fresh.length} fresh personas reached Day secured; ${welcome.length} of ${fresh.length} started at Welcome.`],
    ["Frontend", Math.min(8, Math.max(4, Math.round((loopScore + perfScore) / 2))), `Done → sheet median ${ms(doneToSheet)}; ${gaveUpRepeat.length} sessions ended on a repeated screen after 15 steps.`],
    ["Backend", reliabilityScore, `${crashes.length} crashes; server /api/health 0d36821; 429s and server errors are in the per-step errors below if any.`],
    ["Data integrity", dataScore, `${wrongNumbers} day-number mismatches between the screen and the database (a secured day showing current_day − 1 is the app's displayDay rule and is not counted).`],
    ["Performance", perfScore, `Median sheet choice → done marker ${ms(doneToVisible)}; photo post ${ms(photoPost)}. Release build on the simulator; measured by polling the view hierarchy (one poll ≈ 0.5–1 s, so read ± 1 s). Done → sheet ${ms(doneToSheet)} is the pure UI step.`],
    ["Reliability", reliabilityScore, `${crashes.length} of ${runs.length} sessions hit a launch or step crash.`],
    ["Security and privacy", securityScore, `${blockedSeen} of ${safetyRuns.length} safety personas saw a blocked-word message; ${typedRude.length} typed a rude word (${typedRude.map((r) => r.result.personaId).join(", ") || "none"}), ${submittedRude.length} submitted it to the server. ${submittedRude.length ? "" : "Not measured in this run; the filter is covered by chunk 07 tests. "}is_test on every account.`],
    ["Tests", 7, "Chunk 01–09 vitest files 469/469 in one run; full vitest the 4 baseline failures only; tsc 5 baseline errors."],
    ["Words (concept)", conceptScoreBand, `Concept score ${concept}%: secured ${right("securedRight")}, freeze ${right("freezeRight")}, self-reported ${right("selfReportedRight")} of ${asked.length}.`],
  ];
  const weights = [2, 2, 1, 1, 2, 1, 1, 1, 1, 1];
  const overall = (rows.reduce((sum, row, i) => sum + row[1] * weights[i]!, 0) / weights.reduce((a, b) => a + b, 0)).toFixed(1);

  const lines: string[] = [];
  lines.push(`# Overnight report, build 90, ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "America/New_York" }).format(new Date())}`);
  lines.push("");
  lines.push(`App commit \`${sha}\` (About shows it). TestFlight build number ${build}, internal group "Team (Expo)". Server \`/api/health\` commit \`0d36821\`. Simulator: GRIIT iPhone 16, iOS 26.4, Release build of the same commit (a TestFlight binary cannot be installed on a simulator). Harness: \`feat/agent-testers\` (agents/src/build90.ts). Spend: ${spend}.`);
  lines.push("");
  lines.push("## Main number");
  lines.push("");
  lines.push(`**${freshSecured.length} of ${fresh.length} fresh personas reached Day secured (${pct(freshSecured.length, fresh.length)}).** Oct 15 baseline: about 10 of 38 (26%).`);
  lines.push("");
  lines.push("## Also");
  lines.push("");
  lines.push("| Number | Value |");
  lines.push("|---|---|");
  lines.push(`| Sessions | ${runs.length} |`);
  lines.push(`| Joined | ${joined.length} (${pct(joined.length, runs.length)}) |`);
  lines.push(`| First task opened | ${firstTask.length} (${pct(firstTask.length, runs.length)}) |`);
  lines.push(`| Task finished | ${completed.length} (${pct(completed.length, runs.length)}) |`);
  lines.push(`| Photo | ${photo.length} (${pct(photo.length, runs.length)}) |`);
  lines.push(`| Median Done → post-or-private sheet | ${ms(doneToSheet)} (${timings.filter((t) => t.toSheetMs != null).length} finishes) |`);
  lines.push(`| Median sheet choice → task shows as done | ${ms(doneToVisible)} (${timings.filter((t) => t.toVisibleMs != null).length} finishes) |`);
  lines.push(`| Median photo post (Post to friends → done marker) | ${ms(photoPost)} |`);
  lines.push(`| Concept score (exit interview) | ${concept}% of ${asked.length} interviews × 3 words |`);
  lines.push(`| Would open tomorrow (median of 10) | ${median(tomorrow) ?? "—"} |`);
  lines.push(`| Fresh personas that started at Welcome | ${welcome.length} of ${fresh.length} (Oct 15: 7 of 38) |`);
  lines.push(`| Sessions under 15 steps, not a crash | ${under15.length} (Oct 15: 11 ended early) |`);
  lines.push(`| Ended on a repeated screen (after 15 steps) | ${gaveUpRepeat.length} (Oct 15: 26) |`);
  lines.push(`| Stopped on their own (after 15 steps) | ${stoppedOwn.length} |`);
  lines.push(`| Crashes | ${crashes.length} |`);
  lines.push("");
  const invalidJson = runs.map((r) => [r.result.personaId, r.steps.filter((s) => /not valid JSON/.test(s.error ?? "")).length] as const).filter(([, n]) => n > 0);
  lines.push("## Read with this in mind");
  lines.push("");
  lines.push(`- The agents are Haiku 4.5 on a simulator, not people. A photo finish uses the simulator camera, which returns a stand-in image, and ${invalidJson.length ? `they refused to type the rude words the safety personas were given (${invalidJson.map(([id, n]) => `${id}: ${n} empty replies`).join(", ")})` : "they typed every word they were given"}. The server-side filter itself is covered by chunk 07's vitest and the build90-safety Maestro flow, not by this run.`);
  lines.push(`- "Ended on a repeated screen" counts sessions the harness stopped after 15 steps because the same screen came back three times. ${gaveUpRepeat.length} of ${runs.length} here. It is a harness stop rule as much as a product signal; read the per-session rows before treating it as a dead end.`);
  lines.push(`- Done timing: Done → sheet is measured on every self-reported finish (${timings.filter((t) => t.toSheetMs != null).length}). Choice → done marker is only counted when the marker showed inside the 20 s watch window (${timings.filter((t) => t.toVisibleMs != null).length}); "only after more taps" rows mean the agent left the screen before the marker was seen, not that the app was slow.`);
  lines.push(`- Day-number check: ${runs.reduce((n, r) => n + r.result.wrongNumbers.length, 0)} real mismatches. The 202 raw entries in result.json are "Day 1 on screen, current_day 2 stored" on a secured day, which is lib/challenge-day.ts displayDay (current_day points at tomorrow once today is secured); they are dropped when the report reads the runs.`);
  lines.push(`- Offline (p5-06) was not applied: no network conditioner on this Mac's simulator. p5-06 ran as a normal post.`);
  lines.push("");
  lines.push("## Scorecard");
  lines.push("");
  lines.push(`Overall **${overall}** (product loop, onboarding and data integrity weighted double, as on 12 and 14 Oct; 14 Oct was 5.2). Scores are rules from the numbers in this run; the why column says which.`);
  lines.push("");
  lines.push("| # | Category | Score | Why |");
  lines.push("|---|---|---|---|");
  rows.forEach((row, i) => lines.push(`| ${i + 1} | ${row[0]} | ${row[1]} | ${row[2]} |`));
  lines.push("");
  if (notes.trim()) lines.push("## What the screenshots show", "", notes.trim(), "");
  lines.push("## Chunks");
  lines.push("");
  for (const chunk of CHUNKS) {
    const summaryFile = path.join(out, chunk.slug, "summary.md");
    if (!fs.existsSync(summaryFile)) {
      lines.push(`### ${chunk.slug}`, "", "No summary. See crash.txt in the folder.", "");
      continue;
    }
    const body = fs.readFileSync(summaryFile, "utf8").split("\n").slice(1).map((line) => (line.startsWith("## ") ? `#${line}` : line));
    lines.push(`### ${chunk.slug}: ${chunk.title}`, ...body, "");
  }
  const wordsFile = path.join(out, "6-words", "summary.md");
  if (fs.existsSync(wordsFile)) lines.push("### 6-words: Words", ...fs.readFileSync(wordsFile, "utf8").split("\n").slice(1).map((line) => (line.startsWith("## ") ? `#${line}` : line)), "");
  lines.push("## Top problems");
  lines.push("");
  if (!ranked.length) lines.push("None recorded.");
  ranked.forEach(([title, ids], i) => lines.push(`${i + 1}. ${title} (${ids.size}: ${[...ids].slice(0, 6).join(", ")})`));
  lines.push("");
  lines.push("## Quotes");
  lines.push("");
  const quotes = runs.flatMap((r) => r.steps.filter((s) => s.confusion).slice(0, 1).map((s) => `- ${r.persona.name} (${r.chunk}, ${s.screenName || s.screen}): "${s.confusion}"`)).slice(0, 15);
  lines.push(...(quotes.length ? quotes : ["No confusion quotes."]));
  lines.push("");
  lines.push("## Folders");
  lines.push("");
  lines.push(...chunkFolders.map((line) => `- ${line}`));
  lines.push("");
  lines.push("## Data");
  lines.push("");
  lines.push("Per chunk: `<chunk>/data.csv` (persona, chunk, step, screen, screen_name, action, target, thought, confusion, emotion, latency_ms, done_to_sheet_ms, done_to_visible_ms, error), `<chunk>/report.html`, `<chunk>/<persona>/steps.jsonl`, `result.json`, `interview.json`, `shots/`. Account files hold passwords and are not committed.");
  lines.push("");
  return lines.join("\n");
}

function esc(value: string): string {
  return value.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch] ?? ch);
}

/** Enough Markdown for this report: headings, tables, lists, paragraphs, bold, code. */
export function markdownToHtml(md: string): string {
  const out: string[] = [];
  const lines = md.split("\n");
  let i = 0;
  const inline = (text: string) => esc(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
  while (i < lines.length) {
    const line = lines[i]!;
    if (/^#{1,4} /.test(line)) {
      const level = line.match(/^(#+)/)![1]!.length;
      out.push(`<h${level}>${inline(line.replace(/^#+ /, ""))}</h${level}>`);
      i++;
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i]!.startsWith("|")) {
        const cells = lines[i]!.slice(1, -1).split("|").map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push("<table>");
      if (head) out.push(`<tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`);
      for (const row of body) out.push(`<tr>${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
      out.push("</table>");
      continue;
    }
    if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line);
      out.push(ordered ? "<ol>" : "<ul>");
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i]!)) {
        out.push(`<li>${inline(lines[i]!.replace(/^(- |\d+\. )/, ""))}</li>`);
        i++;
      }
      out.push(ordered ? "</ol>" : "</ul>");
      continue;
    }
    if (line.trim()) out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><title>Build 90 overnight report</title><style>
body{font:12px/1.4 -apple-system,Helvetica,sans-serif;color:#1a1918;margin:28px}
h1{font-size:22px} h2{font-size:16px;margin-top:22px} h3{font-size:14px;margin-top:16px} h4{font-size:12px;margin-top:12px}
table{border-collapse:collapse;width:100%;margin:6px 0 10px;font-size:10.5px} td,th{border:1px solid #cfcac2;padding:3px 5px;text-align:left;vertical-align:top}
th{background:#f1ede6} code{font-size:10.5px;background:#f1ede6;padding:0 3px}
</style></head><body>${out.join("\n")}</body></html>`;
}

function toPdf(html: string, pdf: string): string {
  const source = path.join(root, "agents", "tools", "html2pdf.swift");
  const bin = "/tmp/griit-html2pdf";
  if (!fs.existsSync(bin)) {
    const built = spawnSync("swiftc", ["-O", "-o", bin, source], { encoding: "utf8" });
    if (built.status !== 0) return `swiftc failed: ${(built.stderr || built.stdout).slice(0, 300)}`;
  }
  const ran = spawnSync(bin, [html, pdf], { encoding: "utf8", timeout: 90000 });
  return ran.status === 0 ? `wrote ${pdf}` : `pdf failed: ${(ran.stderr || ran.stdout).slice(0, 300)}`;
}

if (/build90-report\.ts$/.test(process.argv[1] ?? "")) {
  const out = path.resolve(arg("out") ?? path.join(root, "docs", "reports", "oct-build90"));
  const sha = arg("sha") ?? "5d3de5b";
  const build = arg("build") ?? "91";
  const notesFile = arg("notes") ?? path.join(out, "NOTES.md");
  const notes = fs.existsSync(notesFile) ? fs.readFileSync(notesFile, "utf8") : "";
  const md = buildReport(out, sha, build, notes);
  fs.writeFileSync(path.join(out, "REPORT.md"), md);
  const html = markdownToHtml(md);
  fs.writeFileSync(path.join(out, "REPORT.html"), html);
  console.log(`wrote ${path.join(out, "REPORT.md")}`);
  console.log(toPdf(path.join(out, "REPORT.html"), path.join(out, "REPORT.pdf")));
}
