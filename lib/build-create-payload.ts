/**
 * Build the exact payload shape that `challenges.create` (Zod schema) accepts.
 *
 * Lives outside the screens so the wire format is testable in isolation. Anything
 * that is in the future a snake_case key on a task is fed in via `pack.tasks[].config`
 * and only specific allow-listed keys are forwarded.
 */

import type { ChallengePackDef, PackTaskDef } from "@/lib/challenge-packs";
import type { JournalCategory } from "@/types";

export type CreateWho = "solo" | "group";
export type CreateDifficulty = "standard" | "hard";
export type CreatePhotoProof = "off" | "optional" | "required";

export type BuildPayloadInput = {
  pack: ChallengePackDef;
  durationDays: number;
  difficulty: CreateDifficulty;
  who: CreateWho;
  photoProof: CreatePhotoProof;
  category: string;
  /** Optional override for the challenge title (used by the WriteMyOwn flow). */
  titleOverride?: string;
  /** Optional override for the description. */
  descriptionOverride?: string;
};

export type CreateTaskPayload = {
  title: string;
  type: string;
  required: true;
  requirePhotoProof?: boolean;
  strictTimerMode?: boolean;
  durationMinutes?: number;
  minWords?: number;
  mustCompleteInSession?: boolean;
  trackingMode?: string;
  targetValue?: number;
  unit?: string;
  locationName?: string;
  radiusMeters?: number;
  journalType?: string[];
  journalPrompt?: string;
  captureMood?: boolean;
  verificationMethod?: string;
  verificationRuleJson?: Record<string, unknown>;
  routineAnchor?:
    | "wake_up"
    | "morning_coffee"
    | "after_breakfast"
    | "after_work"
    | "before_bed"
    | "after_brushing_teeth"
    | "lunch_break"
    | "custom";
};

export type CreateChallengePayload = {
  title: string;
  description: string;
  type: "standard";
  durationDays: number;
  difficulty: CreateDifficulty;
  status: "published";
  categories: string[];
  participationType: "solo" | "team";
  teamSize: number;
  visibility: "FRIENDS";
  replayPolicy: "allow_replay";
  showReplayLabel: boolean;
  requireSameRules: boolean;
  liveDate: string;
  tasks: CreateTaskPayload[];
};

const ROUTINE_ANCHOR_VALUES = new Set([
  "wake_up",
  "morning_coffee",
  "after_breakfast",
  "after_work",
  "before_bed",
  "after_brushing_teeth",
  "lunch_break",
  "custom",
] as const);

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function asBoolean(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.filter((x): x is string => typeof x === "string");
  return out.length > 0 ? out : undefined;
}

function asRoutineAnchor(v: unknown): CreateTaskPayload["routineAnchor"] | undefined {
  if (typeof v !== "string") return undefined;
  return ROUTINE_ANCHOR_VALUES.has(v as never)
    ? (v as CreateTaskPayload["routineAnchor"])
    : undefined;
}

function mapTaskType(rawType: string): string {
  if (rawType === "reading") return "journal";
  if (rawType === "water") return "simple";
  if (rawType === "workout") return "run";
  if (rawType === "check-in") return "checkin";
  return rawType;
}

function buildTaskPayload(
  task: PackTaskDef,
  difficulty: CreateDifficulty,
  photoProof: CreatePhotoProof
): CreateTaskPayload {
  const cfg = task.config as Record<string, unknown>;
  const apiType = mapTaskType(task.type);

  const photoEnforcedByDifficulty = difficulty === "hard";
  const photoForcedByGlobalSetting = photoProof === "required";
  const photoFromTask = task.photo === "required" || apiType === "photo";
  const photoAllowed = photoProof !== "off";
  const requirePhotoProof =
    photoEnforcedByDifficulty ||
    photoForcedByGlobalSetting ||
    (photoAllowed && photoFromTask);

  const out: CreateTaskPayload = {
    title: task.name,
    type: apiType,
    required: true,
    requirePhotoProof,
  };

  if (apiType === "timer") {
    const minutes = asNumber(cfg.minutes) ?? asNumber(cfg.durationMinutes) ?? 10;
    out.durationMinutes = minutes;
    out.mustCompleteInSession = true;
    out.strictTimerMode = difficulty === "hard";
  }

  if (apiType === "journal") {
    const prompt =
      asString(cfg.prompt) ||
      (task.type === "reading"
        ? `Read ${asNumber(cfg.pages) ?? 10} pages from your book and summarize what you learned in at least 20 words.`
        : "Write your reflection for today. What went well and what will you improve tomorrow?");
    const journalType = asStringArray(cfg.journalCategories) ??
      (task.type === "reading"
        ? (["mental_clarity"] satisfies JournalCategory[] as unknown as string[])
        : (["self_reflection"] satisfies JournalCategory[] as unknown as string[]));
    out.journalPrompt = prompt;
    out.journalType = journalType;
    out.minWords = asNumber(cfg.minWords) ?? 20;
    out.captureMood = true;
  }

  if (apiType === "run") {
    if (task.type === "run") {
      out.trackingMode = "distance";
      out.targetValue = asNumber(cfg.distance) ?? 3;
      out.unit = asString(cfg.unit) === "km" ? "km" : "miles";
    } else {
      out.trackingMode = "time";
      out.targetValue = asNumber(cfg.duration) ?? 30;
      out.unit = "minutes";
    }
  }

  if (apiType === "checkin") {
    out.locationName = asString(cfg.locationName) ?? "Home";
    out.radiusMeters = asNumber(cfg.radius) ?? 150;
  }

  const verificationMethod = asString(cfg.verificationMethod);
  if (verificationMethod) out.verificationMethod = verificationMethod;
  const verificationRuleJson = cfg.verificationRuleJson;
  if (verificationRuleJson && typeof verificationRuleJson === "object" && !Array.isArray(verificationRuleJson)) {
    out.verificationRuleJson = verificationRuleJson as Record<string, unknown>;
  }
  const routineAnchor = asRoutineAnchor(cfg.routineAnchor);
  if (routineAnchor) out.routineAnchor = routineAnchor;
  const captureMood = asBoolean(cfg.captureMood);
  if (typeof captureMood === "boolean") out.captureMood = captureMood;

  return out;
}

export function buildCreatePayload(input: BuildPayloadInput): CreateChallengePayload {
  const title = (input.titleOverride ?? input.pack.name).trim() || input.pack.name;
  const description = input.descriptionOverride ?? "";

  return {
    title,
    description,
    type: "standard",
    durationDays: input.durationDays,
    difficulty: input.difficulty,
    status: "published",
    categories: input.category ? [input.category] : [],
    participationType: input.who === "group" ? "team" : "solo",
    teamSize: input.who === "group" ? 10 : 1,
    visibility: "FRIENDS",
    replayPolicy: "allow_replay",
    showReplayLabel: false,
    requireSameRules: input.difficulty === "hard",
    liveDate: "",
    tasks: input.pack.tasks.map((t) => buildTaskPayload(t, input.difficulty, input.photoProof)),
  };
}
