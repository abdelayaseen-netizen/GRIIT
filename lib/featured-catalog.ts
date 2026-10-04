/**
 * v44 frames 167 + 178 — the eight built-in challenges.
 * Seed lives in docs/drafts/v44-featured-catalog.sql and is not applied.
 * Task fields come from the create-route builder in featured-catalog-seed.
 */

import { gatesFor, gateTimeFor, type TaskModelRow } from "@/backend/lib/task-model";
import { FLAGS } from "@/lib/feature-flags";
import { buildFeaturedCatalogRows } from "@/lib/featured-catalog-seed";
import { gateLabel } from "@/lib/task-ui";

export type FeaturedProof = "camera" | "optional" | "self";

export type FeaturedBuiltin = {
  id: string;
  title: string;
  category: "fitness" | "health" | "discipline" | "faith" | "mind" | "learning";
  days: number;
  task: string;
  proof: FeaturedProof;
  rule: string;
  placeGate: boolean;
  config: Record<string, unknown>;
  taskType: string;
};

function proofFromMode(mode: unknown): FeaturedProof {
  if (mode === "required") return "camera";
  if (mode === "optional") return "optional";
  return "self";
}

export const FEATURED_BUILTINS: readonly FeaturedBuiltin[] = buildFeaturedCatalogRows().map((row) => {
  const model: TaskModelRow = {
    task_type: row.task.task_type,
    require_photo: row.task.require_photo === true,
    require_location: row.task.require_location === true,
    gate_time_mode: row.task.gate_time_mode,
    gate_time_start: row.task.gate_time_start,
    gate_time_end: row.task.gate_time_end,
    config: row.task.config,
  };
  return {
    id: row.spec.id,
    title: row.spec.title,
    category: row.spec.category,
    days: row.spec.days,
    task: row.task.title,
    proof: proofFromMode(row.task.config.photo_mode),
    rule: gateLabel({ gates: gatesFor(model), gateTime: gateTimeFor(model) }),
    placeGate: row.task.require_location === true,
    taskType: row.task.task_type,
    config: row.task.config as Record<string, unknown>,
  };
});

export function featuredProofLabel(proof: FeaturedProof): string {
  if (proof === "camera") return "Camera";
  if (proof === "optional") return "Photo optional";
  return "Self-reported";
}

export function featuredCardLine(item: Pick<FeaturedBuiltin, "days" | "proof">): string {
  return `${item.days} days · ${featuredProofLabel(item.proof)}`;
}

export function featuredMembersLine(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n <= 0) return "Be the first";
  return n === 1 ? "1 person in it" : `${n} people in it`;
}

export function needsSetGym(item: Pick<FeaturedBuiltin, "placeGate">): boolean {
  if (!FLAGS.SET_MEMBER_GYM) return false;
  return item.placeGate === true;
}

export const DISCOVER_LOAD_ERROR = "Challenges didn't load.";
export const DISCOVER_EMPTY_SEARCH = (q: string, category: string) =>
  `Nothing for "${q}" in ${category}.`;

export const LIMIT_CAMERA = "A photo taken in the app. Not from your camera roll.";
export const LIMIT_OPTIONAL = "A photo is optional. Without one it counts as self-reported.";
export const LIMIT_TIME = (time: string) => `Only counts by ${time}, your time.`;
export const LIMIT_PLACE = (radius: string) =>
  `At your gym, within ${radius}. You set it after joining.`;
export const LIMIT_NONE = "No photo, no window, no place. You mark it done.";
export const NOBODY_YET = "Nobody yet. You'd be the first.";
export const DAY_1_TODAY = "Day 1 is today.";
export const SET_GYM_SKIP = "Skip — no place limit";
