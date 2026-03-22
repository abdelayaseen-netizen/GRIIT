/**
 * Pre-built daily task packs for challenge creation (GRIIT spec).
 * Tasks match CreateTaskDraft / TaskTemplate shape used by challenges.create.
 */

import type { JournalCategory } from "@/types";

export type PackTaskPhoto = "none" | "optional" | "required";

export type PackTaskDef = {
  name: string;
  type: string;
  config: Record<string, unknown>;
  photo: PackTaskPhoto;
};

export type ChallengePackDef = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  taskCount: number;
  tasks: PackTaskDef[];
};

function uid(prefix: string, i: number): string {
  return `${prefix}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function photoFlags(photo: PackTaskPhoto): { requirePhotoProof?: boolean; photoRequired?: boolean } {
  if (photo === "required") return { requirePhotoProof: true, photoRequired: true };
  if (photo === "optional") return { requirePhotoProof: false, photoRequired: false };
  return {};
}

/** Maps pack definitions to API-ready task rows for the create wizard. */
export function tasksFromPack(pack: ChallengePackDef): Record<string, unknown>[] {
  return pack.tasks.map((t, i) => {
    const base: Record<string, unknown> = {
      id: uid(pack.id, i),
      title: t.name,
      type: initialApiType(t.type),
      required: true,
      ...photoFlags(t.photo),
    };

    switch (t.type) {
      case "journal": {
        const prompt =
          (t.config.prompt as string) ||
          "Write your reflection for today. What went well and what will you improve tomorrow?";
        const jt = (t.config.journalCategories as JournalCategory[] | undefined) ?? (["self_reflection"] as JournalCategory[]);
        base.journalType = jt;
        base.journalPrompt = prompt;
        base.minWords = typeof t.config.minWords === "number" ? t.config.minWords : 20;
        base.captureMood = true;
        break;
      }
      case "timer": {
        base.durationMinutes = (t.config.minutes as number) ?? 10;
        base.mustCompleteInSession = true;
        break;
      }
      case "photo": {
        base.type = "photo";
        base.requirePhotoProof = true;
        base.photoRequired = true;
        break;
      }
      case "run": {
        base.trackingMode = "distance";
        base.targetValue = (t.config.distance as number) ?? 3;
        base.unit = (t.config.unit as string) === "km" ? "km" : "miles";
        break;
      }
      case "workout": {
        base.type = "run";
        base.trackingMode = "time";
        base.targetValue = (t.config.duration as number) ?? 30;
        base.unit = "minutes";
        break;
      }
      case "reading": {
        base.type = "journal";
        base.journalType = (["mental_clarity"] as JournalCategory[]) satisfies JournalCategory[];
        base.journalPrompt = `Read ${(t.config.pages as number) ?? 10} pages from your book and summarize what you learned in at least 20 words.`;
        base.minWords = 20;
        break;
      }
      case "simple":
        base.type = "simple";
        break;
      case "checkin":
      case "check-in": {
        base.type = "checkin";
        base.locationName = (t.config.locationName as string) ?? "Home";
        base.radiusMeters = (t.config.radius as number) ?? 150;
        break;
      }
      case "water": {
        base.type = "simple";
        base.title = t.name;
        break;
      }
      case "counter": {
        base.type = "simple";
        break;
      }
      default:
        base.type = "simple";
    }

    return base;
  });
}

function initialApiType(t: string): string {
  if (t === "reading") return "journal";
  if (t === "water") return "simple";
  if (t === "workout") return "run";
  return t;
}

export const CHALLENGE_PACKS: ChallengePackDef[] = [
  {
    id: "athlete",
    name: "Athlete Pack",
    emoji: "🏋️",
    description: "Run, train, check-in.",
    taskCount: 3,
    tasks: [
      { name: "Morning run", type: "run", config: { distance: 3, unit: "miles" }, photo: "optional" },
      { name: "Workout", type: "workout", config: { duration: 30, workoutType: ["any"] }, photo: "optional" },
      {
        name: "Body check-in",
        type: "journal",
        config: {
          prompt: "How did your body feel today? Note energy, soreness, and recovery.",
          journalCategories: ["physical_state" as const],
        },
        photo: "none",
      },
    ],
  },
  {
    id: "faith",
    name: "Faith Pack",
    emoji: "🙏",
    description: "Prayer, read, gratitude.",
    taskCount: 3,
    tasks: [
      {
        name: "Morning prayer",
        type: "timer",
        config: { minutes: 5, label: "Prayer or intention-setting" },
        photo: "none",
      },
      { name: "Read 10 pages", type: "reading", config: { pages: 10 }, photo: "none" },
      {
        name: "Gratitude journal",
        type: "journal",
        config: { prompt: "Write three things you are grateful for today in detail." },
        photo: "none",
      },
    ],
  },
  {
    id: "75hard",
    name: "75 Hard Classic",
    emoji: "🔥",
    description: "The original. 5 strict tasks.",
    taskCount: 5,
    tasks: [
      {
        name: "Outdoor workout",
        type: "workout",
        config: { duration: 45, workoutType: ["outdoor"] },
        photo: "required",
      },
      { name: "Second workout", type: "workout", config: { duration: 45, workoutType: ["any"] }, photo: "required" },
      { name: "Read 10 pages", type: "reading", config: { pages: 10 }, photo: "optional" },
      { name: "Drink 1 gallon water", type: "water", config: { amount: 1, unit: "gallons" }, photo: "none" },
      { name: "Progress photo", type: "photo", config: { count: 1 }, photo: "required" },
    ],
  },
  {
    id: "morning",
    name: "Morning Routine",
    emoji: "☀️",
    description: "Win the morning, win the day.",
    taskCount: 5,
    tasks: [
      { name: "Wake before 6am", type: "simple", config: {}, photo: "none" },
      {
        name: "Cold shower",
        type: "timer",
        config: { minutes: 2, label: "Cold water. No flinching." },
        photo: "optional",
      },
      { name: "Read 10 pages", type: "reading", config: { pages: 10 }, photo: "none" },
      {
        name: "Journal",
        type: "journal",
        config: { prompt: "What is your #1 priority today?", journalCategories: ["discipline_check"] },
        photo: "none",
      },
      { name: "Workout", type: "workout", config: { duration: 20, workoutType: ["any"] }, photo: "optional" },
    ],
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur Pack",
    emoji: "🔨",
    description: "Ship, journal, learn.",
    taskCount: 3,
    tasks: [
      { name: "Ship something", type: "simple", config: {}, photo: "optional" },
      {
        name: "Journal",
        type: "journal",
        config: { prompt: "What did you ship today? What blocked you?", journalCategories: ["wins_losses"] },
        photo: "none",
      },
      {
        name: "Learn 30 min",
        type: "timer",
        config: { minutes: 30, label: "Read, listen, or watch something educational" },
        photo: "none",
      },
    ],
  },
];
