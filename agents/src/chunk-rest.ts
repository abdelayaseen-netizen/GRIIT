/**
 * Chunks 10–13. Email accounts marked is_test through railway run.
 * Persona 36 uses the review login from the environment and does not print it.
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

function person(p: Pick<Persona, "id" | "name" | "age" | "group" | "background" | "why" | "goals"> & Partial<Persona>): Persona {
  return {
    gender: "unspecified",
    tech: "med",
    patience: 3,
    phone: "small",
    textSize: "default",
    motivation: "curious",
    english: "native",
    ...p,
  };
}

const people: Persona[] = [
  person({ id: "p13", name: "Marcus", age: 28, group: "fitness", background: "Gym regular. Wants a 75 Hard style challenge, picks Strict, takes photos every day.", why: "Wants the hard version.", goals: ["Create or join a Strict photo challenge."], motivation: "committed" }),
  person({ id: "p14", name: "Lina", age: 32, group: "fitness", background: "Runner. Uses the Run task and cares about distance.", why: "Wants distance, not a checkbox.", goals: ["Find a run task and see if distance is recorded."] }),
  person({ id: "p15", name: "Chris", age: 24, group: "fitness", background: "Competitive. Goes straight to the Leaderboard.", why: "Wants to see who is ahead.", goals: ["Open the leaderboard before doing a task."], patience: 2 }),
  person({ id: "p16", name: "Andre", age: 38, group: "fitness", background: "Personal trainer. Wants a group challenge for 8 clients.", why: "The group is the product for him.", goals: ["Create a group challenge and look for an invite."] }),
  person({ id: "p17", name: "Elena", age: 26, group: "fitness", background: "Beginner who picks something too hard on day 1.", why: "Curious how hard it feels.", goals: ["Join the hardest-looking challenge and try one task."], motivation: "skeptical" }),
  person({ id: "p18", name: "Kai", age: 22, group: "fitness", background: "Only wants to post proof photos and see likes.", why: "The likes are the point.", goals: ["Post a photo and look for a like."] }),
  person({ id: "p19", name: "Sasha", age: 27, group: "social", background: "Cares how the share card looks on an Instagram Story.", why: "Will only share if the card looks finished.", goals: ["Open the share card and look at it."] }),
  person({ id: "p20", name: "Owen", age: 35, group: "social", background: "Shy. Never wants anything public. Picks Only me for everything.", why: "Privacy first.", goals: ["Set a post to Only me and confirm it is not public."] }),
  person({ id: "p21", name: "Nina", age: 23, group: "social", background: "Wants to follow people and live in the feed.", why: "The feed is the app.", goals: ["Open Everyone and Following and try to follow someone."] }),
  person({ id: "p22a", name: "Alex", age: 21, group: "social", background: "Friend group. Creates a group challenge and will invite two friends.", why: "The three of them want one challenge.", goals: ["Create a group challenge and look for an invite."] }),
  person({ id: "p22b", name: "Blake", age: 21, group: "social", background: "Friend group. Waiting to join Alex's challenge.", why: "Will join if the invite is obvious.", goals: ["Look for an invite or a way to join a friend's challenge."] }),
  person({ id: "p22c", name: "Casey", age: 21, group: "social", background: "Friend group. Wants to like the others' posts.", why: "The likes are how the group keeps score.", goals: ["Open the feed and like a post."] }),
  person({ id: "p23", name: "Rae", age: 30, group: "social", background: "Wants to report and block someone who posted something rude.", why: "Safety.", goals: ["Find report and block on a post or profile."] }),
  person({ id: "p24", name: "Jonah", age: 19, group: "social", background: "Reads the feed and never does a task.", why: "Just looking.", goals: ["Read the feed and do not start a task."], patience: 2 }),
  person({ id: "p25", name: "Tara", age: 33, group: "edge", background: "Misses a day on purpose and checks the streak and freeze.", why: "Wants to know the penalty.", goals: ["Find the streak and any freeze explanation."] }),
  person({ id: "p26", name: "Victor", age: 41, group: "edge", background: "Wants to see the Finished card at the end of a challenge.", why: "The ending matters.", goals: ["Look for a finished challenge or what happens on the last day."] }),
  person({ id: "p27", name: "Imani", age: 29, group: "edge", background: "Leaves a timer running and comes back.", why: "The timer has to survive leaving the app.", goals: ["Start a timer and leave the screen."] }),
  person({ id: "p28", name: "Felix", age: 31, group: "edge", background: "Loses internet halfway through a post.", why: "Wants to know if the post is lost.", goals: ["Start a post and see what an error looks like."] }),
  person({ id: "p29", name: "Grace", age: 36, group: "edge", background: "Denies the camera, then tries a photo task.", why: "Does not want the camera on.", goals: ["Open a photo task and see the permission path."], patience: 4 }),
  person({ id: "p30", name: "Hugo", age: 18, group: "edge", background: "Types emoji, long names, and blank names. Double-taps everything.", why: "Trying to break the forms.", goals: ["Type an emoji into a name field and double-tap a button."], patience: 2, tech: "high" }),
  person({ id: "p31", name: "Build", age: 30, group: "returning", background: "Opens the app in the morning with a streak already going.", why: "Home has to make sense on day 7.", goals: ["Read Home and say whether today is clear."] }),
  person({ id: "p32", name: "Guest", age: 25, group: "returning", background: "Has been using the app as a guest and wants to save the account.", why: "Does not want to lose the streak.", goals: ["Find the save-account path from Settings."] }),
  person({ id: "p33", name: "Reed", age: 34, group: "returning", background: "Deletes the account, then signs up again with the same email.", why: "Wants a clean start.", goals: ["Find delete account and read the warning."] }),
  person({ id: "p34", name: "Sofia", age: 28, group: "returning", background: "Changes profile photo, name, and bio, then checks other screens.", why: "The name has to match everywhere.", goals: ["Edit the profile name and bio."] }),
  person({ id: "p35", name: "Tom", age: 44, group: "returning", background: "Turns on reminders and checks Settings.", why: "Reminders are the only reason he will return.", goals: ["Open Settings and the reminder controls."] }),
  person({ id: "p36", name: "Reviewer", age: 40, group: "returning", background: "App Store reviewer. Checks the demo account, delete account, report, privacy, and broken or placeholder screens.", why: "Reviewing the app for the store.", goals: ["Open Settings, Account, privacy, and a report control. Do not break the account."], patience: 5, tech: "high" }),
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
  console.log(`Chunks 10 to 13. ${roster.length} people. Cap $40. Spend so far $${spend.usd.toFixed(2)}.`);
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
    console.log("REST_DONE");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
