import fs from "fs";
import path from "path";
import type { Persona } from "./types";

const FIRST = ["Noah","Liam","Omar","Ethan","Mason","Jamal","Chris","Andre","Leo","Malik","Jonah","Marcus","Diego","Samir","Felix","Hassan","Ivan","Cole","Yusuf","Theo","Miles","Adrian","Nico","Karim","Eli","Amina","Maya","Leila","Sofia","Nora","Hana","Priya","Elena","Aisha","Chloe","Fatima","Rita","Grace","Imani","Yara","Nadia","Lina","Sara","Keisha","Amelia","Jonah","Idris","Ravi","Paul","Helen","Ruth","Walter","Denise","Frank","Anita","Tariq","Bilal","Zainab","Maryam","Ibrahim","Khadija","Yusra","Hamza","Layla","Adam","Owen","Caleb","Jorge","Mei","Anika","Luis","Erin","Jonah","Pete","Carmen","Hugo","Nina","Omar","Salma","Farah","Darius","Quinn","Alec","Brooke","Seth","Gina","Victor","Rosa","Ken","Patricia","Louis","Angela","Craig","Monica"];
const LAST = ["Carter","Nguyen","Hassan","Brooks","Diaz","Owens","Park","Ali","Santos","Reed","Keller","Mensah","Iqbal","Walsh","Okoye","Berg","Silva","Haddad","Cohen","Murphy","Patel","Rossi","Abebe","Clarke","Novak","Farouk","Bennett","Cho","Ibrahim","Duarte","Singh","Moreau","Diallo","Khan","Ellis","Romano","Rahman","Grant","Sato","Nasser"];

type Seed = {
  group: string;
  count: number;
  age: [number, number];
  genders: string[];
  tech: Array<"low" | "med" | "high">;
  patience: number;
  motivation: Array<"curious" | "committed" | "skeptical">;
  english: Array<"native" | "second">;
  phone: Array<"small" | "large">;
  text: Array<"default" | "large" | "largest">;
  why: string;
  background: (name: string, age: number) => string;
  goals: string[];
  stress?: string[];
};

const ACCOUNT = "Finish creating your account with the email and password you were given.";

const GROUPS: Seed[] = [
  { group: "gym", count: 25, age: [20, 30], genders: ["male"], tech: ["med", "high", "med"], patience: 45, motivation: ["committed", "committed", "skeptical"], english: ["native", "native", "second"], phone: ["large", "small"], text: ["default"], why: "He wants a gym challenge with photo proof and a streak he can share.", background: (n, a) => `${n} is ${a} and trains most days. He heard about 75 Hard style challenges and wants the streak to be visible.`, goals: [ACCOUNT, "Join a gym, workout, or discipline challenge.", "Finish one task on that challenge. A photo is fine if the task asks. Do not share it.", "Find your streak on Home."] },
  { group: "wellness", count: 15, age: [20, 30], genders: ["female"], tech: ["med", "high", "low"], patience: 40, motivation: ["curious", "committed", "skeptical"], english: ["native", "second"], phone: ["small", "large"], text: ["default", "large"], why: "She wants to join a fitness challenge and understand who can see her photos.", background: (n, a) => `${n} is ${a} and is careful about who sees photos of her. Friends and the feed matter more than a leaderboard.`, goals: [ACCOUNT, "Join a fitness or wellness challenge.", "Notice whether a photo would stay private before you post one.", "Open the feed and look around without following anyone."] },
  { group: "faith", count: 12, age: [18, 54], genders: ["male", "female"], tech: ["med", "low", "high"], patience: 40, motivation: ["committed", "curious"], english: ["native", "second", "second"], phone: ["large", "small"], text: ["default", "large"], why: "They want a prayer or Quran challenge that respects time windows and self-reported tasks.", background: (n, a) => `${n} is ${a} and prays. A Fajr or Quran challenge is the reason the app is on the phone.`, goals: [ACCOUNT, "Join a prayer, Fajr, Quran, or reading challenge.", "Finish one task you can mark done yourself, without a photo.", "Notice whether the task has a time window."] },
  { group: "teen", count: 12, age: [16, 19], genders: ["male", "female", "non-binary"], tech: ["high", "med"], patience: 30, motivation: ["curious", "skeptical", "committed"], english: ["native", "native", "second"], phone: ["small", "large"], text: ["default"], why: "They want to do better and understand streaks before sharing anything with friends.", background: (n, a) => `${n} is ${a}, still in school, and has not used a habit app seriously before.`, goals: [ACCOUNT, "Find where a streak is explained.", "Find how you would share a day with a friend. Do not send it."] },
  { group: "college", count: 10, age: [18, 22], genders: ["female", "male", "non-binary"], tech: ["high", "med"], patience: 35, motivation: ["curious", "skeptical"], english: ["native", "second"], phone: ["small", "large"], text: ["default"], why: "They want study, sleep, or reading goals, including late nights and a missed day.", background: (n, a) => `${n} is ${a} and splits time between classes, a job, and a bad sleep schedule.`, goals: [ACCOUNT, "Join a study, reading, or sleep challenge.", "Find the Complete button on a counter task.", "See what the app says about today or a missed day."] },
  { group: "pro", count: 8, age: [28, 40], genders: ["male", "female"], tech: ["med", "high", "low"], patience: 25, motivation: ["committed", "skeptical"], english: ["native", "second"], phone: ["large", "small"], text: ["default", "large"], why: "They have almost no time and need a task done quickly, plus reminders.", background: (n, a) => `${n} is ${a} with a job that already sends too many notifications.`, goals: [ACCOUNT, "Finish one task as fast as you can. Use Already did it if you see it.", "Find notification or reminder settings."] },
  { group: "lowtech", count: 5, age: [40, 55], genders: ["female", "male"], tech: ["low"], patience: 18, motivation: ["skeptical", "curious"], english: ["native", "second"], phone: ["large"], text: ["large", "largest"], why: "They need bigger type and plain wording, and they give up when a screen is unclear.", background: (n, a) => `${n} is ${a} and gets impatient with small text and unclear buttons.`, goals: ["Get from the first screen to Home.", "Join any challenge whose name you understand.", "Find today's task."] },
  { group: "friends", count: 5, age: [19, 32], genders: ["male", "female"], tech: ["med", "high"], patience: 40, motivation: ["committed", "curious"], english: ["native"], phone: ["large", "small"], text: ["default"], why: "They want a group challenge, an invite link, and a leaderboard.", background: (n, a) => `${n} is ${a} and would rather do this with two or three friends than alone.`, goals: [ACCOUNT, "Join a challenge you could do with friends.", "Find an invite or share link. Do not send it to a real person.", "Find the leaderboard."] },
  { group: "creator", count: 5, age: [22, 40], genders: ["female", "male"], tech: ["high", "med"], patience: 45, motivation: ["committed"], english: ["native", "second"], phone: ["large"], text: ["default"], why: "They want to build a custom challenge, add different proof types, and invite people.", background: (n, a) => `${n} is ${a} and showed up to make a challenge, not only to join one.`, goals: [ACCOUNT, "Open Create and make a custom challenge.", "Add one task and pick a proof type you understand.", "Find the invite step, then leave without sending it."] },
  { group: "premium", count: 5, age: [21, 35], genders: ["male", "female"], tech: ["med", "high"], patience: 30, motivation: ["curious", "skeptical"], english: ["native", "second"], phone: ["large", "small"], text: ["default"], why: "They want to see what Premium includes before paying. They will not purchase.", background: (n, a) => `${n} is ${a} and will close anything that asks for a card.`, goals: [ACCOUNT, "Find Premium and read what it gives you.", "Leave the paywall without purchasing."] },
  { group: "lapsed", count: 5, age: [22, 40], genders: ["female", "male"], tech: ["med", "low"], patience: 30, motivation: ["skeptical", "curious"], english: ["native", "second"], phone: ["large"], text: ["default", "large"], why: "They missed days and want to understand freezes and how to get back on track.", background: (n, a) => `${n} is ${a} and has dropped other habit apps after a missed day.`, goals: [ACCOUNT, "Reach Home and read anything about a streak, a missed day, or a freeze.", "Find where a freeze is explained."] },
  { group: "stress", count: 13, age: [17, 50], genders: ["female", "male", "non-binary"], tech: ["low", "med", "high"], patience: 30, motivation: ["skeptical", "curious"], english: ["second", "native", "second"], phone: ["small", "large"], text: ["largest", "large", "default"], why: "They poke at edges: large text, missing labels, denied permissions, and leaving halfway.", background: (n, a) => `${n} is ${a} and is here to see what breaks, not to build a streak.`, goals: ["Get from the first screen to Home.", "Open a challenge and come back without finishing it."] },
];

const STRESS = [
  "largest-text",
  "voiceover-labels",
  "camera-denied",
  "location-denied",
  "offline",
  "double-tap-post",
  "back-out-mid-task",
  "kill-mid-upload",
  "second-language",
  "break-things",
  "largest-text-and-back",
  "denied-then-continue",
  "rapid-taps",
];

export function buildPersonas(): Persona[] {
  const people: Persona[] = [];
  let nameIndex = 0;
  for (const seed of GROUPS) {
    for (let i = 0; i < seed.count; i++) {
      const age = seed.age[0] + Math.floor(((seed.age[1] - seed.age[0]) * i) / Math.max(1, seed.count - 1));
      const first = FIRST[nameIndex % FIRST.length]!;
      const last = LAST[Math.floor(nameIndex / FIRST.length) % LAST.length]!;
      nameIndex += 1;
      const name = `${first} ${last}`;
      const id = `${seed.group}-${String(i + 1).padStart(2, "0")}`;
      const stress = seed.group === "stress" ? STRESS[i] : undefined;
      const goals = stress === "double-tap-post"
        ? [ACCOUNT, "Finish one task. If you see Post, use a double tap."]
        : stress === "kill-mid-upload"
          ? [ACCOUNT, "Start a photo task, then kill the app before it finishes."]
          : stress === "back-out-mid-task"
            ? [ACCOUNT, "Open a task and come back without finishing it."]
            : seed.goals;
      people.push({
        id,
        name,
        age,
        gender: seed.genders[i % seed.genders.length]!,
        group: seed.group,
        background: seed.background(name, age),
        why: seed.why,
        goals,
        tech: seed.tech[i % seed.tech.length]!,
        patience: seed.patience,
        phone: seed.phone[i % seed.phone.length]!,
        textSize: seed.group === "stress" && (stress === "largest-text" || stress === "largest-text-and-back") ? "largest" : seed.text[i % seed.text.length]!,
        motivation: seed.motivation[i % seed.motivation.length]!,
        english: stress === "second-language" ? "second" : seed.english[i % seed.english.length]!,
        stress,
      });
    }
  }
  const byId = new Map(people.map((p) => [p.id, p]));
  const link = (id: string, ids: string[]) => {
    const person = byId.get(id);
    if (person) person.links = ids;
  };
  link("friends-01", ["friends-02", "friends-03"]);
  link("friends-02", ["friends-01", "friends-03"]);
  link("friends-03", ["friends-01", "friends-02"]);
  link("friends-04", ["friends-05", "college-01", "college-02"]);
  link("friends-05", ["friends-04", "college-01", "college-02"]);
  if (people.length !== 120) throw new Error(`expected 120 personas, got ${people.length}`);
  const ids = new Set(people.map((p) => p.id));
  if (ids.size !== 120) throw new Error("persona ids are not unique");
  const ages = people.filter((p) => p.age < 16);
  if (ages.length) throw new Error("persona under 16");
  return people;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = path.join(path.dirname(process.argv[1] ?? ""), "..", "personas.json");
  fs.writeFileSync(out, JSON.stringify(buildPersonas(), null, 2) + "\n");
  console.log(`wrote ${out}`);
}
