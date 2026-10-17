/**
 * Build 90 10.4: the overnight run, in six chunks, back to back on one simulator.
 *
 *   npx tsx agents/src/build90.ts --chunk all --out /path/to/docs/reports/oct-build90 [--cap 40] [--only p2-03]
 *
 * Each chunk writes <out>/<chunk>/ (per-persona folders, report.html, data.csv, summary.md, summary.json)
 * as soon as it finishes. A chunk that crashes writes crash.txt and the run moves on.
 * Chunk 6 (words) scores the exit interview every persona answered in chunks 1–5.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { agentClient, readOwnRows, signInAgent } from "./account";
import { HAIKU_MODEL } from "./cost";
import { loadEnv, requireEnv, safeText } from "./env";
import { tomorrowScore } from "./interview";
import { runPersona, type Spend } from "./loop";
import { MaestroSession } from "./maestro";
import { writeOutputs } from "./report";
import type { AgentResult, Persona, StepLog } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index < 0 ? undefined : process.argv[index + 1];
}

// Seeded public challenges by task type (scripts/seed-challenges.sql, supabase starter seed).
export const LINKS = {
  photo: "griit://challenge/b2000001-4000-4000-8000-000000000001", // Drink Water Today: photo
  checkoff: "griit://challenge/e44f0001-4000-4000-8000-000000000002", // 7K Steps: self-reported check-off
  photoCheckoff: "griit://challenge/e44f0001-4000-4000-8000-000000000001", // Show Up 7: check-off with a required photo
  journal: "griit://challenge/b2000001-4000-4000-8000-000000000004", // Journal Today: journal
  timer: "griit://challenge/b2000001-4000-4000-8000-000000000005", // Breathe 1 Min: timer
  counter: "griit://challenge/e44f0001-4000-4000-8000-000000000006", // 10 Pages a Day: counter
  manual: "griit://challenge/b2000001-4000-4000-8000-000000000002", // Quick Steps: manual
};

type Base = Pick<Persona, "id" | "name" | "age" | "background" | "why" | "goals"> & Partial<Persona>;

function person(chunk: string, group: string, p: Base): Persona {
  return {
    gender: "unspecified",
    tech: "med",
    patience: 3,
    phone: "small",
    textSize: "default",
    motivation: "curious",
    english: "native",
    fresh: false,
    ...p,
    chunk,
    group,
  };
}

const FINISH = "Open the challenge the app shows you, join it, open today's task and finish it with the button that starts with Done. When the app asks, choose Keep it private.";

export const CHUNKS: { slug: string; title: string; personas: Persona[]; pairs?: [string, string][] }[] = [
  {
    slug: "1-speed",
    title: "Speed",
    personas: [
      person("1-speed", "speed", { id: "p1-01", name: "Dev", age: 29, background: "Counts seconds. Taps Done and watches the number move.", why: "Wants it to feel instant.", goals: [FINISH], links: [LINKS.checkoff] }),
      person("1-speed", "speed", { id: "p1-02", name: "Mia", age: 24, background: "Posts a photo of everything.", why: "The photo is the point.", goals: ["Open the challenge the app shows you, join it, open today's task, take the proof photo and finish with Done. When the app asks, choose Post to friends."], links: [LINKS.photo] }),
      person("1-speed", "speed", { id: "p1-03", name: "Leo", age: 35, background: "Likes a one-minute breathing timer.", why: "One minute is all he has.", goals: ["Open the challenge the app shows you, join it, start the one-minute timer, wait for it, then finish with Done. When the app asks, choose Keep it private."], links: [LINKS.timer], patience: 5 }),
      person("1-speed", "speed", { id: "p1-04", name: "Ana", age: 31, background: "Reads ten pages a night and logs the count.", why: "Wants the count to stick.", goals: ["Open the challenge the app shows you, join it, log 10 pages and finish with Done. When the app asks, choose Keep it private."], links: [LINKS.counter] }),
      person("1-speed", "speed", { id: "p1-05", name: "Noor", age: 27, background: "Writes a short journal entry every night.", why: "Journaling is her habit.", goals: ["Open the challenge the app shows you, join it, write at least 20 real words in the journal and finish with Done. When the app asks, choose Keep it private."], links: [LINKS.journal] }),
      person("1-speed", "speed", { id: "p1-06", name: "Ray", age: 40, background: "Gym at 6 am, photo at the door.", why: "Proof or it did not happen.", goals: ["Open the challenge the app shows you, join it, open today's task, take the proof photo and finish with Done. When the app asks, choose Post to friends."], links: [LINKS.photoCheckoff] }),
    ],
  },
  {
    slug: "2-first-day",
    title: "First day",
    personas: [
      person("2-first-day", "first-timers", { id: "p2-01", name: "Jordan", age: 19, background: "College student. TikTok-native. Impatient. Skips all text.", why: "A friend said the app was quick.", goals: ["Get from the first screen to a finished task and a secured day without reading paragraphs."], tech: "high", patience: 1, fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-02", name: "Amina", age: 34, gender: "woman", background: "Nurse on night shift. Opens the app at 3 am. Tired.", why: "Wants one small thing she can finish before sleep.", goals: ["Finish onboarding and one task with as few decisions as possible, until the app says the day is secured."], patience: 2, phone: "large", motivation: "committed", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-03", name: "Robert", age: 58, gender: "man", background: "Not techy. Large text is on. Reads everything slowly.", why: "His daughter sent him the app.", goals: ["Read each screen and reach a first task, then finish it."], tech: "low", patience: 5, phone: "large", textSize: "large", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-04", name: "Casey", age: 23, background: "Quit three habit apps. Skeptical. Hunting for reasons to leave.", why: "Checking whether this one is the same as the others.", goals: ["Look for a catch, but finish the first task before you decide."], tech: "high", patience: 2, motivation: "skeptical", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-05", name: "Priya", age: 27, gender: "woman", background: "Downloaded it because a friend sent a link. Wants to join that friend's challenge.", why: "The link is the only reason she is here.", goals: ["Find a way to join a friend's challenge, otherwise join any challenge and finish the first task."], fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-06", name: "Sam", age: 17, background: "Taps Continue without reading, as fast as possible.", why: "Just wants to see the app.", goals: ["Tap through to the first task as fast as possible and finish it."], tech: "high", patience: 1, fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-07", name: "Yusuf", age: 25, gender: "man", background: "Muslim. Wants a daily prayer challenge. Checks Faith first.", why: "Looking for a faith challenge he can keep.", goals: ["Pick a faith challenge in onboarding and finish today's task."], motivation: "committed", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-08", name: "Helen", age: 40, gender: "woman", background: "Christian mom. Morning devotional before the kids wake up.", why: "Wants a quiet morning habit.", goals: ["Pick a quiet morning challenge and finish today's task."], fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-09", name: "Marcus", age: 28, gender: "man", background: "Gym regular. Wants the strict version and takes photos.", why: "Wants the hard version.", goals: ["Pick a fitness challenge, choose Strict if the app offers it, and finish today's task with a photo."], motivation: "committed", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-10", name: "Elena", age: 26, gender: "woman", background: "Beginner who worries she picked something too hard.", why: "Curious how hard it feels.", goals: ["Pick the easiest-looking challenge and finish the first task."], motivation: "skeptical", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-11", name: "Tom", age: 44, gender: "man", background: "English is his second language. Reads the short lines, skips the long ones.", why: "A colleague keeps a streak and he wants one.", goals: ["Reach a first task and finish it. Notice any word you do not understand."], english: "second", fresh: true }),
      person("2-first-day", "first-timers", { id: "p2-12", name: "Grace", age: 36, gender: "woman", background: "Does not want the camera on. Denies permissions when asked.", why: "Privacy first.", goals: ["Reach a first task that does not need a photo and finish it."], patience: 4, fresh: true }),
    ],
  },
  {
    slug: "3-task-types",
    title: "Task types",
    personas: [
      person("3-task-types", "task-types", { id: "p3-01", name: "Ivy", age: 30, background: "Checks a box and moves on.", why: "Quick wins.", goals: [FINISH], links: [LINKS.checkoff] }),
      person("3-task-types", "task-types", { id: "p3-02", name: "Omar", age: 33, gender: "man", background: "Photo of the water glass, every day.", why: "Proof habit.", goals: ["Open the challenge the app shows you, join it, open today's task, take the proof photo and finish with Done. When the app asks, choose Post to friends."], links: [LINKS.photo] }),
      person("3-task-types", "task-types", { id: "p3-03", name: "Bea", age: 22, gender: "woman", background: "Impatient with timers. Tries to finish the breathing timer early.", why: "Wants to know if the timer can be skipped.", goals: ["Open the challenge the app shows you, join it, start the timer and try to finish it before the minute is up. Note what the app says. Then finish it properly with Done and choose Keep it private."], links: [LINKS.timer], patience: 1 }),
      person("3-task-types", "task-types", { id: "p3-04", name: "Kofi", age: 38, gender: "man", background: "Reads a lot. Logs pages.", why: "Tracking pages.", goals: ["Open the challenge the app shows you, join it, log 12 pages and finish with Done. When the app asks, choose Keep it private."], links: [LINKS.counter] }),
      person("3-task-types", "task-types", { id: "p3-05", name: "Zara", age: 29, gender: "woman", background: "Tries to cheat the counter: types 0 pages and then 99999 pages.", why: "Wants to see if nonsense is caught.", goals: ["Open the challenge the app shows you, join it, type 0 pages and try to finish; note what the app says. Then type 99999 pages and try to finish; note what the app says. Then log 10 pages, finish with Done and choose Keep it private."], links: [LINKS.counter], tech: "high" }),
      person("3-task-types", "task-types", { id: "p3-06", name: "Nate", age: 26, gender: "man", background: "Writes one word in the journal and expects it to count.", why: "Lazy journaler.", goals: ["Open the challenge the app shows you, join it, type the single word ok in the journal and try to finish; note what the app says. Then write at least 20 real words, finish with Done and choose Keep it private."], links: [LINKS.journal] }),
      person("3-task-types", "task-types", { id: "p3-07", name: "Lina", age: 32, gender: "woman", background: "Runner. Wants distance, not a checkbox.", why: "Wants a run task.", goals: ["Find any challenge with a run or workout task. Join it, open the task and see what it asks for: distance, time, or a checkbox. Finish it with Done if you can and choose Keep it private."] }),
      person("3-task-types", "task-types", { id: "p3-08", name: "Hugo", age: 18, gender: "man", background: "Types emoji and gibberish into every field. Double-taps buttons.", why: "Trying to break the forms.", goals: ["Open the challenge the app shows you, join it, type an emoji and the word asdfgh into the journal and try to finish; note what the app says. Then write 20 real words, finish with Done and choose Keep it private."], links: [LINKS.journal], tech: "high", patience: 2 }),
      person("3-task-types", "task-types", { id: "p3-09", name: "Ruth", age: 50, gender: "woman", background: "Bedtime habit. Marks it done at night.", why: "Sleep routine.", goals: [FINISH], links: [LINKS.manual], tech: "low", textSize: "large" }),
      person("3-task-types", "task-types", { id: "p3-10", name: "Eli", age: 27, gender: "man", background: "Gym photo at the door, Show Up 7.", why: "Wants the strict photo rule.", goals: ["Open the challenge the app shows you, join it, open today's task, take the proof photo and finish with Done. When the app asks, choose Post to friends."], links: [LINKS.photoCheckoff] }),
    ],
  },
  {
    slug: "4-social",
    title: "Social",
    pairs: [
      ["p4-01a", "p4-01b"],
      ["p4-02a", "p4-02b"],
      ["p4-03a", "p4-03b"],
    ],
    personas: [
      person("4-social", "social", { id: "p4-01a", name: "Alex", age: 21, background: "Friend group. Creates a group challenge and invites a friend.", why: "The two of them want one challenge.", goals: ["Create a new challenge for friends from the Create tab with one simple check-off task. On the success screen find the invite link and tap Copy. Then finish today's task with Done and choose Post to friends."] }),
      person("4-social", "social", { id: "p4-01b", name: "Blake", age: 21, background: "Friend group. Got Alex's invite link.", why: "Will join if the invite is obvious.", goals: ["The invite opened a challenge: join it. Then find Alex on the challenge board or in the feed and tap the name to open the profile. Then find Alex's post in the feed, like it and leave a one-line comment."] }),
      person("4-social", "social", { id: "p4-02a", name: "Dana", age: 30, gender: "woman", background: "Runs a small accountability group.", why: "Wants a board with a friend on it.", goals: ["Create a new challenge for friends from the Create tab with one simple check-off task. On the success screen find the invite link and tap Copy. Then finish today's task with Done and choose Post to friends."] }),
      person("4-social", "social", { id: "p4-02b", name: "Femi", age: 31, gender: "man", background: "Joins Dana's group from her link.", why: "Dana asked.", goals: ["The invite opened a challenge: join it. Then find Dana on the challenge board or in the feed and tap the name to open the profile. Then find Dana's post in the feed, like it and leave a one-line comment."] }),
      person("4-social", "social", { id: "p4-03a", name: "Kim", age: 26, gender: "woman", background: "Posts and expects a reaction.", why: "The likes are how the group keeps score.", goals: ["Create a new challenge for friends from the Create tab with one simple check-off task. On the success screen find the invite link and tap Copy. Then finish today's task with Done and choose Post to friends."] }),
      person("4-social", "social", { id: "p4-03b", name: "Jun", age: 25, gender: "man", background: "Joins Kim's challenge and reacts to her post.", why: "Kim sent the link.", goals: ["The invite opened a challenge: join it. Then find Kim on the challenge board or in the feed and tap the name to open the profile. Then find Kim's post in the feed, like it and leave a one-line comment."] }),
    ],
  },
  {
    slug: "5-safety-edge",
    title: "Safety and edge",
    personas: [
      person("5-safety-edge", "safety", { id: "p5-01", name: "Rae", age: 30, gender: "woman", background: "Tests the filters. Tries a rude username and bio.", why: "Safety.", goals: ["Open Profile, then Edit profile. Change the username to shithead and save; note what the app says. Then change the bio to this app is bullshit and save; note what the app says. Then set a clean username and bio."] }),
      person("5-safety-edge", "safety", { id: "p5-02", name: "Vic", age: 27, gender: "man", background: "Tests the filters on a post caption and a comment.", why: "Safety.", goals: ["Open the challenge the app shows you, join it, finish today's task with Done and choose Post to friends. Write the caption what a shit day and post; note what the app says. Then on your own post in the feed, comment bullshit; note what the app says."], links: [LINKS.checkoff] }),
      person("5-safety-edge", "safety", { id: "p5-03", name: "Tess", age: 35, gender: "woman", background: "Tests the filter on a challenge title.", why: "Safety.", goals: ["Open Create and start a new challenge titled shit list with one check-off task. Try to continue; note what the app says. Then rename it to Reading list and finish creating it."] }),
      person("5-safety-edge", "safety", { id: "p5-04", name: "Reed", age: 34, gender: "man", background: "Has an account already. New phone. Logs in.", why: "Wants his streak back.", goals: ["Tap I already have an account and log in with your email and password. Reach Home."], startSignedOut: true }),
      person("5-safety-edge", "safety", { id: "p5-05", name: "Guest", age: 25, background: "Uses the app as a guest, then saves the account when asked.", why: "Does not want to lose the streak.", goals: ["Finish onboarding and the first task as a guest. When the app offers to save your streak or account, save it with the email below. Then open Profile and find where freezes are explained."], fresh: true }),
      person("5-safety-edge", "safety", { id: "p5-06", name: "Felix", age: 31, gender: "man", background: "Loses internet halfway through a post.", why: "Wants to know if the post is lost.", goals: ["Open the challenge the app shows you, join it, finish today's task with Done and choose Post to friends. Note whether the post shows up in the feed."], links: [LINKS.checkoff], stress: "offline" }),
    ],
  },
];

type Run = { result: AgentResult; steps: StepLog[]; persona: Persona };

function readRuns(dir: string, personas: Persona[]): Run[] {
  const out: Run[] = [];
  for (const persona of personas) {
    const file = path.join(dir, persona.id, "result.json");
    if (!fs.existsSync(file)) continue;
    const result = JSON.parse(fs.readFileSync(file, "utf8")) as AgentResult;
    const stepsFile = path.join(dir, persona.id, "steps.jsonl");
    const steps = fs.existsSync(stepsFile) ? fs.readFileSync(stepsFile, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as StepLog) : [];
    out.push({ result, steps, persona });
  }
  return out;
}

function sawText(run: Run, re: RegExp): boolean {
  return run.steps.some((step) => re.test(`${step.screenName} ${step.target} ${step.thought} ${step.error} ${step.confusion}`));
}

function median(values: number[]): number | null {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

const yes = (v: boolean) => (v ? "yes" : "no");
const ms = (v: number | null | undefined) => (v == null ? "—" : `${v} ms`);

/** The per-chunk checks from docs/build90/10-ship-and-test.md. */
export function summarize(slug: string, runs: Run[], pairs?: [string, string][]): { md: string; json: Record<string, unknown> } {
  const lines: string[] = [`# ${slug}`, "", `${runs.length} sessions. Build 90, GRIIT iPhone 16 simulator.`, ""];
  const json: Record<string, unknown> = { slug, sessions: runs.length };
  const joined = runs.filter((r) => r.result.stages.includes("joined"));
  const task = runs.filter((r) => r.result.stages.includes("task"));
  const completed = runs.filter((r) => r.result.stages.includes("completed"));
  const photo = runs.filter((r) => r.result.stages.includes("photo"));
  const secured = runs.filter((r) => sawText(r, /day secured/i) || r.result.doneTimings.some((t) => /day secured/i.test(t.marker)));
  const under15 = runs.filter((r) => r.result.steps < 15 && !r.result.crashes.length);
  json.joined = joined.length;
  json.firstTask = task.length;
  json.completed = completed.length;
  json.photo = photo.length;
  json.secured = secured.length;
  json.under15 = under15.length;
  json.earlyStopsRefused = runs.reduce((n, r) => n + (r.result.earlyStopsRefused ?? 0), 0);
  lines.push("## Funnel", "", "| Step | Count |", "|---|---|", `| Joined | ${joined.length} |`, `| First task opened | ${task.length} |`, `| Task finished | ${completed.length} |`, `| Photo | ${photo.length} |`, `| Day secured seen | ${secured.length} |`, `| Sessions under 15 steps (not a crash) | ${under15.length} |`, `| Early stops refused by the harness | ${json.earlyStopsRefused} |`, "");

  const timings = runs.flatMap((r) => r.result.doneTimings.map((t) => ({ persona: r.result.personaId, name: r.persona.name, ...t })));
  if (slug === "1-speed" || timings.length) {
    lines.push("## Done to visible", "", "| Persona | Task | Done → sheet | Choice | Choice → done marker | Marker |", "|---|---|---|---|---|---|");
    for (const t of timings) lines.push(`| ${t.persona} ${t.name} | ${t.taskLabel || "—"} | ${ms(t.toSheetMs)} | ${t.choice || "—"} | ${ms(t.toVisibleMs)} | ${t.marker || "not seen"} |`);
    const toSheet = median(timings.map((t) => t.toSheetMs ?? NaN));
    const toVisible = median(timings.map((t) => t.toVisibleMs ?? NaN));
    const photoPost = median(timings.filter((t) => /post/i.test(t.choice)).map((t) => t.toVisibleMs ?? NaN));
    lines.push("", `Median Done → sheet: ${ms(toSheet)}. Median choice → done marker: ${ms(toVisible)}. Median photo post (Post to friends → done marker): ${ms(photoPost)}.`, "");
    json.medianDoneToSheetMs = toSheet;
    json.medianDoneToVisibleMs = toVisible;
    json.medianPhotoPostMs = photoPost;
  }

  if (slug === "2-first-day") {
    const welcome = runs.filter((r) => r.result.startedOn === "welcome");
    json.startedAtWelcome = welcome.length;
    lines.push("## First day", "", `Started at Welcome: ${welcome.length} of ${runs.length}.`, "", "| Persona | Started on | Joined | First task | Day secured | Steps | Ended |", "|---|---|---|---|---|---|---|");
    for (const r of runs) lines.push(`| ${r.result.personaId} ${r.persona.name} | ${r.result.startedOn} | ${yes(r.result.stages.includes("joined"))} | ${yes(r.result.stages.includes("task"))} | ${yes(secured.includes(r))} | ${r.result.steps} | ${r.result.giveUp || "finished"} |`);
    lines.push("");
  }

  if (slug === "3-task-types") {
    lines.push("## Task types", "", "| Persona | Task | Finished | Nonsense caught | Post choice seen | Ended |", "|---|---|---|---|---|---|");
    for (const r of runs) {
      const caught = sawText(r, /edit|save anyway|too (few|many)|at least|real words|must be|can.?t be|not enough|minimum|check (the|that) number|looks (wrong|off|impossible)|that number|before the (timer|minute)|finished early/i);
      const sheet = sawText(r, /keep it private|post to friends|post or keep/i) || r.result.doneTimings.some((t) => t.toSheetMs != null);
      lines.push(`| ${r.result.personaId} ${r.persona.name} | ${r.persona.links?.[0]?.split("/").pop() ?? "search"} | ${yes(r.result.stages.includes("completed"))} | ${yes(caught)} | ${yes(sheet)} | ${r.result.giveUp || "finished"} |`);
    }
    lines.push("");
  }

  if (slug === "4-social" && pairs) {
    lines.push("## Social", "", "| Pair | Invite visible (A) | B joined A's challenge | B opened a profile | B liked | B commented |", "|---|---|---|---|---|---|");
    for (const [aId, bId] of pairs) {
      const a = runs.find((r) => r.result.personaId === aId);
      const b = runs.find((r) => r.result.personaId === bId);
      const invite = a ? sawText(a, /invite|griit:\/\/i\/|copy/i) : false;
      const bJoined = b ? b.result.stages.includes("joined") : false;
      const profile = b ? b.steps.some((s) => s.screen === "profile" || /profile/i.test(s.screenName)) : false;
      const liked = b ? b.steps.some((s) => /like|heart/i.test(s.target) && !s.error) : false;
      const commented = b ? b.steps.some((s) => /comment|send|reply/i.test(s.target) && !s.error) || b.steps.some((s) => s.action === "type" && /comment/i.test(s.target)) : false;
      lines.push(`| ${aId} / ${bId} | ${yes(invite)} | ${yes(bJoined)} | ${yes(profile)} | ${yes(liked)} | ${yes(commented)} |`);
    }
    lines.push("");
  }

  if (slug === "5-safety-edge") {
    lines.push("## Safety and edge", "", "| Persona | Check | Blocked message seen | Reached Home | Ended |", "|---|---|---|---|---|");
    for (const r of runs) {
      const blocked = sawText(r, /not allowed|isn.?t allowed|can.?t use|blocked|try another|pick another|language|contains|inappropriate|choose a different|that word/i);
      lines.push(`| ${r.result.personaId} ${r.persona.name} | ${r.persona.goals[0]?.slice(0, 60)}… | ${yes(blocked)} | ${yes(r.result.stages.includes("home"))} | ${r.result.giveUp || "finished"} |`);
    }
    lines.push("", "Offline was not applied: this Mac has no simulator network conditioner wired up (agents/src/device.ts applyPrivacy).", "");
  }

  lines.push("## Sessions", "", "| Persona | Chunk | Started on | Steps | Funnel | Ended | Errors |", "|---|---|---|---|---|---|---|");
  for (const r of runs) lines.push(`| ${r.result.personaId} ${r.persona.name} | ${r.result.chunk} | ${r.result.startedOn} | ${r.result.steps} | ${r.result.stages.join(" → ")} | ${r.result.giveUp || "finished"} | ${r.result.errors.slice(0, 2).join("; ").slice(0, 160)} |`);
  lines.push("");
  return { md: lines.join("\n"), json };
}

export function summarizeWords(all: Run[]): { md: string; json: Record<string, unknown> } {
  const asked = all.filter((r) => r.result.interview?.asked);
  const right = (key: "securedRight" | "freezeRight" | "selfReportedRight") => asked.filter((r) => r.result.interview?.[key]).length;
  const tomorrow = asked.map((r) => tomorrowScore(r.result.interview?.tomorrow ?? "")).filter((n): n is number => n != null);
  const concept = asked.length ? Math.round(((right("securedRight") + right("freezeRight") + right("selfReportedRight")) / (asked.length * 3)) * 100) : 0;
  const lines = [
    "# 6-words",
    "",
    `Exit interview, asked of every persona at the end of the session. ${asked.length} of ${all.length} answered.`,
    "",
    "| Word | Right | Wrong | Share right |",
    "|---|---|---|---|",
    `| Secured | ${right("securedRight")} | ${asked.length - right("securedRight")} | ${asked.length ? Math.round((right("securedRight") / asked.length) * 100) : 0}% |`,
    `| Freeze | ${right("freezeRight")} | ${asked.length - right("freezeRight")} | ${asked.length ? Math.round((right("freezeRight") / asked.length) * 100) : 0}% |`,
    `| Self-reported | ${right("selfReportedRight")} | ${asked.length - right("selfReportedRight")} | ${asked.length ? Math.round((right("selfReportedRight") / asked.length) * 100) : 0}% |`,
    "",
    `Concept score: ${concept}% (right answers over three words × ${asked.length} people). Would open tomorrow: median ${median(tomorrow) ?? "—"} of 10 (${tomorrow.length} gave a number).`,
    "",
    "Scoring rules are in agents/src/interview.ts: secured = every task of the day done so the day counts; freeze = a missed day that does not break the streak; self-reported = marked done by the person, no proof.",
    "",
    "## Answers",
    "",
    "| Persona | Chunk | Secured | Freeze | Self-reported | Tomorrow |",
    "|---|---|---|---|---|---|",
  ];
  const mark = (ok: boolean | undefined, text: string | undefined) => `${ok ? "right" : "wrong"}: ${(text ?? "").replace(/\|/g, "/").slice(0, 110)}`;
  for (const r of asked) {
    const i = r.result.interview!;
    lines.push(`| ${r.result.personaId} ${r.persona.name} | ${r.result.chunk} | ${mark(i.securedRight, i.secured)} | ${mark(i.freezeRight, i.freeze)} | ${mark(i.selfReportedRight, i.selfReported)} | ${(i.tomorrow ?? "").replace(/\|/g, "/").slice(0, 80)} |`);
  }
  lines.push("");
  return {
    md: lines.join("\n"),
    json: { asked: asked.length, sessions: all.length, securedRight: right("securedRight"), freezeRight: right("freezeRight"), selfReportedRight: right("selfReportedRight"), conceptScore: concept, tomorrowMedian: median(tomorrow) },
  };
}

async function inviteLinkOf(runDir: string, personaId: string): Promise<string | null> {
  const file = path.join(runDir, personaId, "account.json");
  if (!fs.existsSync(file)) return null;
  const account = JSON.parse(fs.readFileSync(file, "utf8")) as { email: string; password: string };
  const client = agentClient();
  const session = await signInAgent(client, account.email, account.password);
  if (!session) return null;
  await client.auth.setSession({ access_token: session.accessToken, refresh_token: session.refreshToken });
  const rows = await readOwnRows(client, session.userId);
  const created = rows.created[0] ?? null;
  if (created) return `griit://i/${created.id}`;
  const enrolled = rows.enrollments[0] ?? null;
  return enrolled ? `griit://i/${enrolled.challenge_id}` : null;
}

async function runChunk(chunk: (typeof CHUNKS)[number], out: string, maestro: MaestroSession, spend: Spend, capUsd: number, only?: string) {
  const runDir = path.join(out, chunk.slug);
  fs.mkdirSync(runDir, { recursive: true });
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const allowedNames = ["Seed GRIIT", "seedgriit", ...chunk.personas.map((p) => p.name)];
  const startedAt = new Date().toISOString();
  let lastFreshStart = 0;
  const personas = only ? chunk.personas.filter((p) => p.id === only) : chunk.personas;
  const links = new Map<string, string>();
  console.log(`\n== Chunk ${chunk.slug}: ${personas.length} personas ==`);
  for (const persona of personas) {
    if (spend.usd >= capUsd) {
      console.log(`Stopped. Spend $${spend.usd.toFixed(2)} reached the cap.`);
      break;
    }
    if (persona.fresh) {
      // Supabase allows about 30 anonymous sign-ins per IP per hour. Keep 2 minutes between fresh starts.
      const wait = 2 * 60 * 1000 - (Date.now() - lastFreshStart);
      if (lastFreshStart > 0 && wait > 0) {
        console.log(`Waiting ${Math.ceil(wait / 1000)}s between fresh starts.`);
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      lastFreshStart = Date.now();
    }
    const pair = chunk.pairs?.find(([, b]) => b === persona.id);
    const run = { ...persona };
    if (pair) {
      const link = links.get(pair[0]) ?? (await inviteLinkOf(runDir, pair[0]));
      if (link) {
        run.links = [link];
        console.log(`${persona.id} opens ${link}`);
      } else {
        console.log(`${persona.id}: no invite link from ${pair[0]}; B runs without it`);
      }
    }
    console.log(`\n${run.id} ${run.name} (${run.group}${run.fresh ? ", fresh" : ""})`);
    try {
      const outcome = await runPersona({ persona: run, mode: "goal", runDir, maestro, apiKey, model: HAIKU_MODEL, spend, allowedNames, compare: false, capUsd, keep: true });
      console.log(`${run.id} done. ${outcome.result.steps} steps, started on ${outcome.result.startedOn}, spend $${spend.usd.toFixed(2)}. ${outcome.result.giveUp || "finished"}`);
      if (chunk.pairs?.some(([a]) => a === persona.id)) {
        const link = await inviteLinkOf(runDir, persona.id);
        if (link) links.set(persona.id, link);
      }
      if (outcome.stopAll) {
        fs.writeFileSync(path.join(runDir, "stopped.txt"), `${outcome.result.giveUp}\n`);
        break;
      }
    } catch (err) {
      const message = safeText(err instanceof Error ? err.stack || err.message : String(err));
      console.log(`${run.id} crashed: ${message}`);
      fs.appendFileSync(path.join(runDir, "crash.txt"), `${new Date().toISOString()} ${run.id}: ${message}\n`);
      try {
        maestro.stop();
        await maestro.start();
      } catch {
        // the next persona will try again
      }
    }
  }
  const runs = readRuns(runDir, chunk.personas);
  writeOutputs({ runDir, personas: chunk.personas, spendUsd: spend.usd, modelNote: "Haiku 4.5 for every persona.", hidingNote: "is_test accounts; hidden from real users. Test personas may share a board with each other.", targetNote: `Build 90 on the GRIIT iPhone 16 simulator. Production API. Chunk ${chunk.slug}.` });
  const summary = summarize(chunk.slug, runs, chunk.pairs);
  fs.writeFileSync(path.join(runDir, "summary.md"), summary.md);
  fs.writeFileSync(path.join(runDir, "summary.json"), JSON.stringify({ ...summary.json, startedAt, endedAt: new Date().toISOString(), spendUsd: spend.usd }, null, 2) + "\n");
  console.log(`Chunk ${chunk.slug} written to ${runDir}`);
}

async function main() {
  loadEnv(root);
  requireEnv("ANTHROPIC_API_KEY");
  requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  const which = arg("chunk") ?? "all";
  const out = path.resolve(arg("out") ?? path.join(root, "docs", "reports", "oct-build90"));
  const capUsd = Number(arg("cap") ?? "40");
  const only = arg("only");
  fs.mkdirSync(out, { recursive: true });
  const selected = which === "all" ? CHUNKS : CHUNKS.filter((c) => c.slug.startsWith(`${which}-`) || c.slug === which);
  if (which === "6" || which === "6-words") {
    writeWords(out);
    return;
  }
  if (!selected.length) throw new Error(`No chunk ${which}`);
  const maestro = new MaestroSession();
  const spend: Spend = { usd: 0, input: 0, output: 0, calls: 0 };
  try {
    await maestro.start();
    for (const chunk of selected) {
      try {
        await runChunk(chunk, out, maestro, spend, capUsd, only);
      } catch (err) {
        const message = safeText(err instanceof Error ? err.stack || err.message : String(err));
        console.log(`Chunk ${chunk.slug} crashed: ${message}`);
        fs.mkdirSync(path.join(out, chunk.slug), { recursive: true });
        fs.appendFileSync(path.join(out, chunk.slug, "crash.txt"), `${new Date().toISOString()} chunk: ${message}\n`);
      }
    }
  } finally {
    maestro.stop();
    fs.writeFileSync(path.join(out, "spend.txt"), `${spend.usd.toFixed(2)} USD, ${spend.calls} calls, ${spend.input} in, ${spend.output} out\n`);
  }
  if (which === "all") writeWords(out);
  console.log(`\nMeasured cost $${spend.usd.toFixed(2)} across ${spend.calls} calls.`);
}

function writeWords(out: string) {
  const all = CHUNKS.flatMap((chunk) => readRuns(path.join(out, chunk.slug), chunk.personas));
  const dir = path.join(out, "6-words");
  fs.mkdirSync(dir, { recursive: true });
  const words = summarizeWords(all);
  fs.writeFileSync(path.join(dir, "summary.md"), words.md);
  fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify({ ...words.json, writtenAt: new Date().toISOString() }, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "interviews.json"), JSON.stringify(all.map((r) => ({ persona: r.result.personaId, chunk: r.result.chunk, ...r.result.interview })), null, 2) + "\n");
  console.log(`Chunk 6-words written to ${dir}`);
}

const entry = process.argv[1] ?? "";
if (/build90\.ts$/.test(entry)) {
  main().catch((err) => {
    console.error(safeText(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  });
}
