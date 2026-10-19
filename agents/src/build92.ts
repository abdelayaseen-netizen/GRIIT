/**
 * Build 92 12.4: the new persona groups, on one simulator, one after another.
 *
 *   npx tsx agents/src/build92.ts --out <dir> [--group first-day|history|social|day2|all] [--dry]
 *       [--from <earlier run dir>] [--history-account <account.json>] [--partner <run dir>/<chunk>/<A id>] [--allow-missed]
 *
 * --dry runs one session from each new group (history, social, day2) and writes the report and the cost
 * projection. Models and the cap come from agents/agents.config.json. Every session keeps its rows
 * (no enrollment cleanup), so Day 1 users can come back for Day 2 and the History seed is never deleted.
 *
 * Day 2 needs users who secured a day yesterday: run the first-day group with this runner, then run
 * --group day2 --from <that out dir> the next calendar day. --allow-missed accepts older users and labels them.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { agentClient, readOwnRows, signInAgent } from "./account";
import { CHUNKS, inviteLinkOf, readRuns, type Run } from "./build90";
import { daysBetween, endTable, headline, screensCsv, securedDay, socialActions, type Day2Check } from "./build92-report";
import { loadConfig, modelFor } from "./config";
import { money, projectRun } from "./cost";
import { loadEnv, requireEnv, safeText } from "./env";
import { runPersona, type Spend } from "./loop";
import { MaestroSession } from "./maestro";
import { writeOutputs } from "./report";
import type { Persona } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index < 0 ? undefined : process.argv[index + 1];
}

type Base = Pick<Persona, "id" | "name" | "age" | "background" | "why" | "goals"> & Partial<Persona>;

function person(group: string, p: Base): Persona {
  return { gender: "unspecified", tech: "med", patience: 3, phone: "small", textSize: "default", motivation: "curious", english: "native", fresh: false, ...p, chunk: group, group };
}

export function localDateKey(at = new Date()): string {
  const y = at.getFullYear();
  const m = String(at.getMonth() + 1).padStart(2, "0");
  const d = String(at.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const FIRST_DAY = (CHUNKS.find((c) => c.slug === "2-first-day")?.personas ?? []).map((p) => ({ ...p, id: p.id.replace(/^p2-/, "f-"), group: "first-day", chunk: "first-day" }));

const HISTORY_GOAL =
  "You have used GRIIT for about a month. Open your profile and scroll through every one of your posts to the end. Then go to Home and compare the numbers: does the streak and the day number on Home match what your profile says? Say in your thought every number that does not match.";

const HISTORY: Persona[] = [
  person("history", { id: "h-01", name: "Priya", age: 33, gender: "woman", background: "Has done a daily challenge for a month. Checks her numbers.", why: "Wants the month to show.", goals: [HISTORY_GOAL] }),
  person("history", { id: "h-02", name: "Marcus", age: 45, gender: "man", tech: "low", textSize: "large", background: "Missed a day last week and used a freeze. Left one challenge.", why: "Wants to know his streak survived.", goals: [HISTORY_GOAL] }),
];

const socialB = (id: string, name: string, partner: string): Persona =>
  person("social", {
    id,
    name,
    age: 24,
    background: `Friends with ${partner}. Got ${partner}'s invite link.`,
    why: `${partner} asked them to join.`,
    goals: [
      `The invite opened ${partner}'s challenge: accept it and join. Then find ${partner}'s proof post on the challenge or in the feed. Like it, double-tap the photo, and leave a one-line comment. Then tap ${partner}'s name to open the profile.`,
    ],
  });

const socialA = (id: string, name: string): Persona =>
  person("social", {
    id,
    name,
    age: 26,
    background: "Starts challenges for friends and posts proof.",
    why: "Wants a friend on the board.",
    goals: ["Create a new challenge for friends from the Create tab with one simple check-off task. On the success screen copy the invite link. Then finish today's task with Done and choose Post to friends."],
  });

const socialAReturn = (id: string, name: string, partner: string): Persona =>
  person("social", {
    id,
    name,
    age: 26,
    background: `Came back to see if ${partner} joined.`,
    why: "Wants to react to the friend's post.",
    goals: [`Find ${partner}'s post in the feed or on your challenge. Like it and leave a one-line comment. Then open ${partner}'s profile.`],
  });

/** [A, B, A again]. The A-again session logs in as A's saved account. */
const SOCIAL_PAIRS: { a: Persona; b: Persona; again: Persona }[] = [
  { a: socialA("s-01a", "Alex"), b: socialB("s-01b", "Blake", "Alex"), again: socialAReturn("s-01c", "Alex", "Blake") },
  { a: socialA("s-02a", "Dana"), b: socialB("s-02b", "Femi", "Dana"), again: socialAReturn("s-02c", "Dana", "Femi") },
  { a: socialA("s-03a", "Kim"), b: socialB("s-03b", "Jun", "Kim"), again: socialAReturn("s-03c", "Kim", "Jun") },
];

const DAY2_GOAL = "You joined a challenge in GRIIT on an earlier day and finished that day. Today you open the app again. Do whatever you think you need to do today, and look at your streak. Say in your thought what the app tells you about yesterday.";

const DAY2_NAMES: { name: string; age: number; tech: Persona["tech"] }[] = [
  { name: "Tess", age: 29, tech: "med" },
  { name: "Omar", age: 37, tech: "high" },
  { name: "Lena", age: 22, tech: "high" },
  { name: "Raj", age: 41, tech: "med" },
  { name: "Ivy", age: 31, tech: "med" },
  { name: "Sam", age: 52, tech: "low" },
];

type Candidate = { file: string; label: string; lastSecured: string };

/** Saved accounts whose newest secured day is yesterday (or older, with allowMissed). Newest first. */
async function day2Candidates(from: string, today: string, allowMissed: boolean): Promise<Candidate[]> {
  const out: Candidate[] = [];
  for (const chunk of fs.readdirSync(from)) {
    const chunkDir = path.join(from, chunk);
    if (!fs.statSync(chunkDir).isDirectory() || /social|safety/.test(chunk)) continue;
    for (const id of fs.readdirSync(chunkDir)) {
      const file = path.join(chunkDir, id, "account.json");
      if (!fs.existsSync(file)) continue;
      const account = JSON.parse(fs.readFileSync(file, "utf8")) as { email?: string; password?: string; anonymous?: boolean };
      if (!account.email || !account.password || account.anonymous) continue;
      const client = agentClient();
      const session = await signInAgent(client, account.email, account.password);
      if (!session) continue;
      await client.auth.setSession({ access_token: session.accessToken, refresh_token: session.refreshToken });
      const rows = await readOwnRows(client, session.userId);
      const last = rows.enrollments.map((r) => r.last_secured_date_key ?? "").filter(Boolean).sort().pop() ?? "";
      if (!last || last >= today) continue;
      const gap = daysBetween(last, today);
      if (gap === 1 || (allowMissed && gap > 1)) out.push({ file, label: `${chunk}/${id}`, lastSecured: last });
    }
  }
  return out.sort((a, b) => b.lastSecured.localeCompare(a.lastSecured));
}

async function day2Check(run: Run, file: string, today: string): Promise<Day2Check> {
  const account = JSON.parse(fs.readFileSync(file, "utf8")) as { email: string; password: string };
  const client = agentClient();
  const session = await signInAgent(client, account.email, account.password);
  let lastSecured = "";
  if (session) {
    await client.auth.setSession({ access_token: session.accessToken, refresh_token: session.refreshToken });
    const rows = await readOwnRows(client, session.userId);
    lastSecured = rows.enrollments.map((r) => r.last_secured_date_key ?? "").filter(Boolean).sort().pop() ?? "";
  }
  const before = run.persona.background.match(/last secured (\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
  const said = (re: RegExp) => run.steps.some((s) => re.test(`${s.screenName} ${s.thought} ${s.confusion}`));
  return {
    personaId: run.result.personaId,
    lastSecured,
    securedToday: lastSecured === today,
    sawStreak: said(/streak/i),
    sawFreeze: said(/freeze|frozen/i),
    missedDays: before ? Math.max(0, daysBetween(before, today) - 1) : 0,
  };
}

async function runGroup(input: {
  slug: string;
  personas: Persona[];
  out: string;
  maestro: MaestroSession;
  spend: Spend;
  capUsd: number;
  allowedNames: string[];
  before?: (persona: Persona, runDir: string) => Promise<Persona>;
}): Promise<Run[]> {
  const runDir = path.join(input.out, input.slug);
  fs.mkdirSync(runDir, { recursive: true });
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const config = loadConfig();
  console.log(`\n== ${input.slug}: ${input.personas.length} sessions ==`);
  let lastFreshStart = 0;
  for (const base of input.personas) {
    if (input.spend.usd >= input.capUsd) {
      console.log(`Stopped. Spend ${money(input.spend.usd)} reached the ${money(input.capUsd)} cap.`);
      fs.writeFileSync(path.join(runDir, "stopped.txt"), `Cost cap ${money(input.capUsd)} reached before ${base.id}.\n`);
      break;
    }
    const persona = input.before ? await input.before(base, runDir) : base;
    if (persona.fresh) {
      const wait = 2 * 60 * 1000 - (Date.now() - lastFreshStart);
      if (lastFreshStart > 0 && wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      lastFreshStart = Date.now();
    }
    const model = modelFor(persona, config);
    console.log(`\n${persona.id} ${persona.name} (${persona.group}, ${model})`);
    const spentBefore = input.spend.usd;
    try {
      const outcome = await runPersona({ persona, mode: "goal", runDir, maestro: input.maestro, apiKey, model, spend: input.spend, allowedNames: input.allowedNames, compare: false, capUsd: input.capUsd, keep: true });
      console.log(`${persona.id} done. ${outcome.result.steps} steps, ${outcome.result.endTag}, spend ${money(input.spend.usd)}. ${outcome.result.giveUp || "finished"}`);
      fs.writeFileSync(path.join(runDir, persona.id, "persona.json"), JSON.stringify(persona, null, 2));
      fs.writeFileSync(path.join(runDir, persona.id, "spend.json"), JSON.stringify({ usd: input.spend.usd - spentBefore, model }) + "\n");
      if (outcome.stopAll) break;
    } catch (err) {
      const message = safeText(err instanceof Error ? err.stack || err.message : String(err));
      console.log(`${persona.id} crashed: ${message}`);
      fs.appendFileSync(path.join(runDir, "crash.txt"), `${new Date().toISOString()} ${persona.id}: ${message}\n`);
      try {
        input.maestro.stop();
        await input.maestro.start();
      } catch {
        // the next persona tries again
      }
    }
  }
  const ran = input.personas.map((p) => {
    const file = path.join(runDir, p.id, "persona.json");
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Persona) : p;
  });
  writeOutputs({ runDir, personas: ran, spendUsd: input.spend.usd, modelNote: `Models from agents.config.json: ${ran.map((p) => `${p.id} ${modelFor(p, config)}`).join(", ")}.`, hidingNote: "is_test accounts; hidden from real users.", targetNote: `GRIIT iPhone 16 simulator. Production API. Group ${input.slug}.` });
  const runs = readRuns(runDir, ran);
  fs.writeFileSync(path.join(runDir, "screens.csv"), screensCsv(runs));
  return runs;
}

async function main() {
  loadEnv(root);
  requireEnv("ANTHROPIC_API_KEY");
  requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  const config = loadConfig();
  const out = path.resolve(arg("out") ?? path.join(root, "docs", "reports", "oct-build92"));
  const capUsd = Number(arg("cap") ?? config.capUsd);
  const dry = process.argv.includes("--dry");
  const group = arg("group") ?? (dry ? "dry" : "all");
  const from = arg("from") ? path.resolve(arg("from")!) : "";
  const allowMissed = dry || process.argv.includes("--allow-missed");
  const today = localDateKey();
  fs.mkdirSync(out, { recursive: true });

  const notes: string[] = [];
  const historyAccount = arg("history-account") ? path.resolve(arg("history-account")!) : "";
  const history = HISTORY.map((p) => ({ ...p, savedAccount: historyAccount || undefined }));
  if (!historyAccount) notes.push("History: no seeded account was given (--history-account). The History sessions need the seed in docs/sql/build92.sql first.");
  else notes.push(`History account: ${path.relative(path.dirname(path.dirname(path.dirname(historyAccount))), path.dirname(historyAccount))}. ${process.argv.includes("--history-seeded") ? "Seeded." : "Not seeded: the 30-day seed in docs/sql/build92.sql has not been run, so this account has only the history it built itself."}`);

  let day2: Persona[] = [];
  if (group === "all" || group === "day2" || group === "dry") {
    if (!from) notes.push("Day 2: no --from run dir, so no returning users.");
    else {
      const found = (await day2Candidates(from, today, allowMissed)).filter((c) => path.resolve(c.file) !== historyAccount);
      const pick = found.slice(0, dry ? 1 : 6);
      day2 = pick.map((c, i) => {
        const who = DAY2_NAMES[i % DAY2_NAMES.length]!;
        return person("day2", { id: `d-0${i + 1}`, name: who.name, age: who.age, tech: who.tech, background: `Returning user (${c.label}), last secured ${c.lastSecured}.`, why: "Started a streak and is checking in again.", goals: [DAY2_GOAL], savedAccount: c.file });
      });
      const yesterday = found.filter((c) => daysBetween(c.lastSecured, today) === 1).length;
      notes.push(`Day 2: ${found.length} saved accounts from ${path.basename(from)} qualify; ${yesterday} secured yesterday (${today} is today). ${pick.length} used.${pick.some((c) => daysBetween(c.lastSecured, today) > 1) ? " The ones used missed at least one day, so this is a return after a gap, not a true Day 2." : ""}`);
    }
  }

  const pairs = SOCIAL_PAIRS;
  const partner = arg("partner") ? path.resolve(arg("partner")!) : "";
  let social: Persona[] = pairs.flatMap((p) => [p.a, p.b, p.again]);
  if (dry) {
    if (!partner) throw new Error("--dry needs --partner <run dir>/<chunk>/<A id>: a saved account that created a challenge and posted");
    const link = await inviteLinkOf(path.dirname(partner), path.basename(partner));
    social = [{ ...socialB("s-dry-b", "Blake", "Kim"), links: link ? [link] : [] }];
    notes.push(`Social: one B session against a saved build 90 partner (${path.basename(partner)}, Kim). Invite ${link ? "found" : "not found"}.`);
  }

  const maestro = new MaestroSession();
  const spend: Spend = { usd: 0, input: 0, output: 0, calls: 0 };
  const allowedNames = ["Seed GRIIT", "seedgriit", "Kim", "Jun", ...[...FIRST_DAY, ...HISTORY, ...social, ...day2].map((p) => p.name)];
  const byGroup = new Map<string, Run[]>();
  try {
    await maestro.start();
    const plan: [string, Persona[]][] = dry
      ? [["history", historyAccount ? history.slice(0, 1) : []], ["social", social], ["day2", day2]]
      : [["first-day", FIRST_DAY], ["history", historyAccount ? history : []], ["social", social], ["day2", day2]];
    for (const [slug, personas] of plan) {
      if (group !== "all" && group !== "dry" && group !== slug) continue;
      if (!personas.length) continue;
      const runs = await runGroup({
        slug,
        personas,
        out,
        maestro,
        spend,
        capUsd,
        allowedNames,
        before: async (p, runDir) => {
          const pair = pairs.find((x) => x.b.id === p.id || x.again.id === p.id);
          if (!pair || dry) return p;
          if (pair.b.id === p.id) {
            const link = await inviteLinkOf(runDir, pair.a.id);
            return link ? { ...p, links: [link] } : p;
          }
          return { ...p, savedAccount: path.join(runDir, pair.a.id, "account.json") };
        },
      });
      byGroup.set(slug, runs);
    }
  } finally {
    maestro.stop();
    fs.writeFileSync(path.join(out, "spend.txt"), `${spend.usd.toFixed(2)} USD, ${spend.calls} calls, ${spend.input} in, ${spend.output} out\n`);
  }

  const day2Runs = byGroup.get("day2") ?? [];
  const checks: Day2Check[] = [];
  for (const run of day2Runs) if (run.persona.savedAccount) checks.push(await day2Check(run, run.persona.savedAccount, today));
  const all = [...byGroup.values()].flat();
  fs.writeFileSync(path.join(out, "screens.csv"), screensCsv(all));

  const sessionUsd = (r: Run) => {
    const file = path.join(out, r.result.chunk, r.result.personaId, "spend.json");
    return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as { usd: number }).usd : 0;
  };
  const measured = [...new Set(all.map((r) => r.result.model ?? ""))].filter(Boolean).map((model) => {
    const runs = all.filter((r) => r.result.model === model);
    return { model, steps: runs.reduce((n, r) => n + r.result.steps, 0), usd: runs.reduce((n, r) => n + sessionUsd(r), 0) };
  });
  const avgSteps = Math.max(15, Math.round(all.reduce((n, r) => n + r.result.steps, 0) / Math.max(1, all.length)));
  const projection = projectRun({
    measured,
    planned: [
      { model: config.models.firstDay, sessions: FIRST_DAY.length, stepsEach: avgSteps },
      { model: config.models.default, sessions: HISTORY.length + SOCIAL_PAIRS.length * 3 + 6, stepsEach: avgSteps },
    ],
  });

  const md = [
    `# Build 92 agents${dry ? ": dry run" : ""}`,
    "",
    `${all.length} sessions on ${today}. Models: ${config.models.default} (default), ${config.models.firstDay} (first-day group). Cap ${money(capUsd)}.`,
    "",
    "## Main numbers",
    "",
    ...headline({ firstDay: byGroup.get("first-day") ?? [], day2: checks, social: byGroup.get("social") ?? [], all }).map((l) => `- ${l}`),
    "",
    "## Session ends",
    "",
    ...endTable(all),
    "",
    "## Day 2",
    "",
    "| Persona | Last secured after the session | Secured today | Saw streak | Saw freeze | Days missed before |",
    "|---|---|---|---|---|---|",
    ...checks.map((c) => `| ${c.personaId} | ${c.lastSecured || "—"} | ${c.securedToday ? "yes" : "no"} | ${c.sawStreak ? "yes" : "no"} | ${c.sawFreeze ? "yes" : "no"} | ${c.missedDays} |`),
    "",
    "## Social",
    "",
    "| Persona | Invite accepted | Likes | Double-taps | Comments | Profile screens |",
    "|---|---|---|---|---|---|",
    ...(byGroup.get("social") ?? []).map((r) => {
      const a = socialActions(r);
      return `| ${r.result.personaId} | ${a.inviteAccepted ? "yes" : "no"} | ${a.likes} | ${a.doubleTaps} | ${a.comments} | ${a.profileOpens} |`;
    }),
    "",
    "## History",
    "",
    ...(byGroup.get("history") ?? []).map((r) => `- ${r.result.personaId}: ${r.steps.filter((s) => /match|differ|wrong|says|shows/i.test(s.thought)).map((s) => s.thought).slice(-2).join(" / ") || "no number comparison recorded"}`),
    "",
    "## Cost",
    "",
    `Measured: ${money(spend.usd)} across ${spend.calls} calls (${spend.input} input, ${spend.output} output tokens).`,
    "",
    `Projected full run (${FIRST_DAY.length} first-day, ${HISTORY.length} history, ${SOCIAL_PAIRS.length} pairs × 3, 6 day-2 sessions, ${avgSteps} steps each): ${money(projection.total)}.`,
    ...projection.lines.map((l) => `- ${l}`),
    "",
    "## Notes",
    "",
    ...notes.map((n) => `- ${n}`),
    `- Secured Day 1 sessions in this run: ${all.filter(securedDay).length}.`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(out, "REPORT.md"), md);
  fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify({ today, sessions: all.length, spendUsd: spend.usd, calls: spend.calls, projectedUsd: projection.total, checks, notes }, null, 2) + "\n");
  console.log(`\n${md}`);
}

const entry = process.argv[1] ?? "";
if (/build92\.ts$/.test(entry)) {
  main().catch((err) => {
    console.error(safeText(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  });
}
