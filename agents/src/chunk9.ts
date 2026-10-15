/**
 * Chunk 9 faith and routine. Email accounts marked is_test through railway run.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HAIKU_MODEL } from "./cost";
import { loadEnv, requireEnv } from "./env";
import { runPersona, type Spend } from "./loop";
import { MaestroSession } from "./maestro";
import { alreadyProved, inviteFor, loadSpend, runDirectory, saveSpend, selectedPeople } from "./run-dir";
import type { Persona, StepLog } from "./types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const runDir = runDirectory(root);

const people: Persona[] = [
  {
    id: "p07",
    name: "Yusuf",
    age: 25,
    gender: "man",
    group: "faith",
    background: "Muslim. Wants a daily prayer and Quran challenge. Checks Faith first.",
    why: "Looking for a faith challenge he can keep.",
    goals: ["Open Faith and join or create a prayer challenge."],
    tech: "med",
    patience: 3,
    phone: "small",
    textSize: "default",
    motivation: "committed",
    english: "native",
  },
  {
    id: "p08",
    name: "Helen",
    age: 40,
    gender: "woman",
    group: "faith",
    background: "Christian mom. Morning devotional before the kids wake up.",
    why: "Wants a quiet morning habit.",
    goals: ["Find a morning faith challenge and finish one task."],
    tech: "med",
    patience: 4,
    phone: "large",
    textSize: "default",
    motivation: "committed",
    english: "native",
  },
  {
    id: "p09",
    name: "Noah",
    age: 30,
    gender: "man",
    group: "faith",
    background: "Building a morning routine: wake at 5, water, journal, workout.",
    why: "Wants the four steps in one challenge.",
    goals: ["Create or join a morning routine with more than one task."],
    tech: "high",
    patience: 3,
    phone: "small",
    textSize: "default",
    motivation: "committed",
    english: "native",
  },
  {
    id: "p10",
    name: "Diane",
    age: 45,
    gender: "woman",
    group: "faith",
    background: "Trying to quit drinking. Wants a private challenge only.",
    why: "Does not want anyone else to see it.",
    goals: ["Create a private challenge and keep it on Only me."],
    tech: "med",
    patience: 3,
    phone: "large",
    textSize: "default",
    motivation: "committed",
    english: "native",
  },
  {
    id: "p11",
    name: "Leo",
    age: 20,
    gender: "man",
    group: "faith",
    background: "Student during exams. Wants a study challenge and cares about the timer.",
    why: "Needs a timer he can trust.",
    goals: ["Find a timer task and start it."],
    tech: "high",
    patience: 2,
    phone: "small",
    textSize: "default",
    motivation: "skeptical",
    english: "native",
  },
  {
    id: "p12",
    name: "Maya",
    age: 29,
    gender: "woman",
    group: "faith",
    background: "Travels across time zones mid-challenge.",
    why: "Needs the day boundary to follow the phone.",
    goals: ["Join a challenge, then see what the app says about today."],
    tech: "high",
    patience: 3,
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
    lines.push(
      [String(row.step), row.screen, row.action, row.thought, row.error || row.target || row.action, (row.latencyMs / 1000).toFixed(1), row.confusion ? "y" : "n", row.thought]
        .map(csvCell)
        .join(","),
    );
  }
  fs.writeFileSync(path.join(dir, "steps.csv"), lines.join("\n") + "\n");
}

async function main() {
  loadEnv(root);
  delete process.env.AGENTS_FRESH;
  requireEnv("ANTHROPIC_API_KEY");
  fs.mkdirSync(runDir, { recursive: true });
  const maestro = new MaestroSession();
  const spend: Spend = loadSpend(runDir);
  const capUsd = 40;
  const allowedNames = ["Seed GRIIT", "seedgriit"];
  const roster = selectedPeople(people);
  console.log(`Chunk 9. ${roster.length} faith and routine accounts. Cap $40. Spend so far $${spend.usd.toFixed(2)}.`);
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
    saveSpend(runDir, spend);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
