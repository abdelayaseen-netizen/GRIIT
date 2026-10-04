/**
 * v44 frames 167 + 178 — the eight built-in challenges.
 * Seed lives in docs/drafts/v44-featured-catalog.sql and is not applied.
 */

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

export const FEATURED_BUILTINS: readonly FeaturedBuiltin[] = [
  {
    id: "e44f0001-4000-4000-8000-000000000001",
    title: "Show Up 7",
    category: "fitness",
    days: 7,
    task: "Go to the gym",
    proof: "camera",
    rule: "Camera · Gym",
    placeGate: true,
    taskType: "checkin",
    config: {
      required: true,
      photo_mode: "required",
      require_photo_proof: true,
      require_photo: true,
      require_location: true,
      gates: ["camera", "place"],
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000002",
    title: "7K Steps",
    category: "health",
    days: 7,
    task: "7,000 steps",
    proof: "self",
    rule: "Self-reported",
    placeGate: false,
    taskType: "counter",
    config: {
      required: true,
      photo_mode: "none",
      require_photo: false,
      target_value: 7000,
      gates: [],
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000003",
    title: "Early Riser 7",
    category: "discipline",
    days: 7,
    task: "Out of bed photo",
    proof: "camera",
    rule: "Camera · By 6:30 am",
    placeGate: false,
    taskType: "photo",
    config: {
      required: true,
      photo_mode: "required",
      require_photo_proof: true,
      require_photo: true,
      require_camera_only: true,
      gates: ["camera", "time"],
      gateTime: { mode: "by", start: "06:30", end: null },
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000004",
    title: "Fajr Before Sunrise",
    category: "faith",
    days: 7,
    task: "Pray Fajr",
    proof: "optional",
    rule: "Photo optional · By 7:00 am",
    placeGate: false,
    taskType: "checkin",
    config: {
      required: true,
      photo_mode: "optional",
      require_photo: false,
      gates: ["time"],
      gateTime: { mode: "by", start: "07:00", end: null },
    },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000005",
    title: "3 Good Things",
    category: "mind",
    days: 7,
    task: "Write 3 gratitudes",
    proof: "self",
    rule: "Self-reported",
    placeGate: false,
    taskType: "journal",
    config: { required: true, photo_mode: "none", require_photo: false, min_words: 3, gates: [] },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000006",
    title: "10 Pages a Day",
    category: "learning",
    days: 14,
    task: "Read 10 pages",
    proof: "self",
    rule: "Self-reported",
    placeGate: false,
    taskType: "reading",
    config: { required: true, photo_mode: "none", require_photo: false, target_pages: 10, gates: [] },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000007",
    title: "Quran Daily",
    category: "faith",
    days: 30,
    task: "Read Quran",
    proof: "self",
    rule: "Self-reported",
    placeGate: false,
    taskType: "reading",
    config: { required: true, photo_mode: "none", require_photo: false, gates: [] },
  },
  {
    id: "e44f0001-4000-4000-8000-000000000008",
    title: "30-Second Cold Finish",
    category: "discipline",
    days: 14,
    task: "Cold shower, 30 seconds",
    proof: "camera",
    rule: "Camera",
    placeGate: false,
    taskType: "photo",
    config: {
      required: true,
      photo_mode: "required",
      require_photo_proof: true,
      require_photo: true,
      require_camera_only: true,
      gates: ["camera"],
    },
  },
];

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
