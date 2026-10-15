/**
 * Chunk 8 first-timers. Fresh guest installs. is_test is set through railway run.
 * Cap $40. One simulator, one person at a time.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HAIKU_MODEL } from "./cost";
import { loadEnv, requireEnv } from "./env";
import { runPersona, type Spend } from "./loop";
import { MaestroSession } from "./maestro";
import { writeOutputs } from "./report";
import { alreadyProved, inviteFor, loadSpend, runDirectory, saveSpend, selectedPeople } from "./run-dir";
import type { Persona, StepLog } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const runDir = runDirectory(root);

const people: Persona[] = [
  {
    id: "p01",
    name: "Jordan",
    age: 19,
    gender: "unspecified",
    group: "first-timers",
    background: "College student. TikTok-native. Impatient. Skips all text.",
    why: "A friend said the app was quick.",
    goals: ["Get from the first screen to a finished task without reading paragraphs."],
    tech: "high",
    patience: 1,
    phone: "small",
    textSize: "default",
    motivation: "curious",
    english: "native",
  },
  {
    id: "p02",
    name: "Amina",
    age: 34,
    gender: "woman",
    group: "first-timers",
    background: "Nurse on night shift. Opens the app at 3 am. Tired.",
    why: "Wants one small thing she can finish before sleep.",
    goals: ["Finish onboarding and one task with as few decisions as possible."],
    tech: "med",
    patience: 2,
    phone: "large",
    textSize: "default",
    motivation: "committed",
    english: "native",
  },
  {
    id: "p03",
    name: "Robert",
    age: 58,
    gender: "man",
    group: "first-timers",
    background: "Not techy. Large text is on. Reads everything slowly.",
    why: "His daughter sent him the app.",
    goals: ["Read each screen and reach a first task without getting lost."],
    tech: "low",
    patience: 5,
    phone: "large",
    textSize: "large",
    motivation: "curious",
    english: "native",
  },
  {
    id: "p04",
    name: "Casey",
    age: 23,
    gender: "unspecified",
    group: "first-timers",
    background: "Quit three habit apps. Skeptical. Hunting for reasons to leave.",
    why: "Checking whether this one is the same as the others.",
    goals: ["Look for a catch, then leave if the first task feels like a trick."],
    tech: "high",
    patience: 2,
    phone: "small",
    textSize: "default",
    motivation: "skeptical",
    english: "native",
  },
  {
    id: "p05",
    name: "Priya",
    age: 27,
    gender: "woman",
    group: "first-timers",
    background: "Downloaded it because a friend sent a link. Wants to join that friend's challenge.",
    why: "The link is the only reason she is here.",
    goals: ["Find a way to join a friend's challenge."],
    tech: "med",
    patience: 3,
    phone: "small",
    textSize: "default",
    motivation: "curious",
    english: "native",
  },
  {
    id: "p06",
    name: "Sam",
    age: 17,
    gender: "unspecified",
    group: "first-timers",
    background: "Taps Continue without reading, as fast as possible.",
    why: "Just wants to see the app.",
    goals: ["Tap through to the first task as fast as possible."],
    tech: "high",
    patience: 1,
    phone: "small",
    textSize: "default",
    motivation: "curious",
    english: "native",
  },
];

function csvCell(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (/[",\n]/.test(clean)) return `"${clean.replace(/"/g, '""')}"`;
  return clean;
}

function writeCsv(personaId: string) {
  const dir = path.join(runDir, personaId);
  const file = path.join(dir, "steps.jsonl");
  if (!fs.existsSync(file)) return;
  const lines = ["step,screen,action,expected,what happened,seconds,confused,quote"];
  for (const raw of fs.readFileSync(file, "utf8").split("\n").filter(Boolean)) {
    const row = JSON.parse(raw) as StepLog;
    const happened = row.error || row.target || row.action;
    lines.push(
      [
        String(row.step),
        row.screen,
        row.action,
        row.thought,
        happened,
        (row.latencyMs / 1000).toFixed(1),
        row.confusion ? "y" : "n",
        row.thought,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  fs.writeFileSync(path.join(dir, "steps.csv"), lines.join("\n") + "\n");
}

async function main() {
  loadEnv(root);
  process.env.AGENTS_FRESH = "1";
  requireEnv("ANTHROPIC_API_KEY");
  requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  requireEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  fs.mkdirSync(runDir, { recursive: true });
  const maestro = new MaestroSession();
  const spend: Spend = loadSpend(runDir);
  const capUsd = 40;
  const allowedNames = ["Seed GRIIT", "seedgriit"];
  const roster = selectedPeople(people);
  console.log(`Chunk 8. ${roster.length} first-timers. Cap $${capUsd}. Spend so far $${spend.usd.toFixed(2)}.`);
  try {
    await maestro.start();
    for (const persona of roster) {
      if (spend.usd >= capUsd) {
        console.log(`Stopped. Spend ${spend.usd.toFixed(2)} reached the cap.`);
        break;
      }
      if (alreadyProved(runDir, persona.id)) {
        console.log(`${persona.id} already has 15 steps and an interview. Skipping.`);
        continue;
      }
      console.log(`\n${persona.id} ${persona.name}`);
      const outcome = await runPersona({
        persona,
        mode: "goal",
        runDir,
        maestro,
        apiKey: requireEnv("ANTHROPIC_API_KEY"),
        model: HAIKU_MODEL,
        spend,
        allowedNames,
        compare: false,
        capUsd,
        keep: true,
        inviteLink: inviteFor(runDir, persona.id),
      });
      writeCsv(persona.id);
      console.log(`${persona.id} done. spend $${spend.usd.toFixed(2)}. ${outcome.result.giveUp || "finished"}`);
      if (outcome.stopAll) break;
    }
  } finally {
    maestro.stop();
    writeOutputs({
      runDir,
      personas: people,
      spendUsd: spend.usd,
      modelNote: "Haiku for chunk 8.",
      hidingNote: "is_test is set with railway run on the server.",
      targetNote: "Build 89 simulator on port 8082. Production API.",
    });
    fs.writeFileSync(path.join(runDir, "spend.txt"), `${spend.usd.toFixed(2)}\n`);
    saveSpend(runDir, spend);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
