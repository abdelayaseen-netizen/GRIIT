import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";

export const JOURNAL_PROMPTS = [
  "What did you learn about yourself today?",
  "What was the hardest part of today and how did you push through?",
  "Write about one win and one loss from today.",
  "How did your body feel today? Energy, soreness, recovery.",
  "Describe your emotions before vs after completing this.",
  "What would you tell yourself from 30 days ago?",
  "What's one thing you're grateful for right now?",
  "What distraction did you resist today?",
  "How did discipline show up in your life today?",
  "Write a letter to your future self about this moment.",
  "What habit is getting easier? What's still hard?",
  "Who did you impact today and how?",
  "What would you do differently if you could redo today?",
  "Describe a moment today when you chose the hard thing.",
  "What's one truth you've been avoiding?",
];

export function getDailyPrompt(taskId: string, journalPrompt?: string): string {
  if (journalPrompt && journalPrompt.trim()) return journalPrompt;
  const dateKey = new Date().toISOString().slice(0, 10);
  const seed = (dateKey + taskId).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = seed % JOURNAL_PROMPTS.length;
  return JOURNAL_PROMPTS[idx] ?? JOURNAL_PROMPTS[0] ?? "";
}

export type TaskCompleteConfig = {
  require_photo?: boolean;
  min_duration_minutes?: number;
  min_words?: number;
  timer_direction?: "countdown" | "countup";
  timer_hard_mode?: boolean;
  require_heart_rate?: boolean;
  heart_rate_threshold?: number;
  require_location?: boolean;
  location_name?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_radius_meters?: number;
  journal_prompt?: string;
  hard_mode?: boolean;
  schedule_window_start?: string;
  schedule_window_end?: string;
  schedule_timezone?: string;
  require_camera_only?: boolean;
  require_strava?: boolean;
};

export function parseConfig(taskConfigStr: string | undefined): TaskCompleteConfig {
  if (!taskConfigStr?.trim()) return {};
  try {
    const o = JSON.parse(taskConfigStr) as TaskCompleteConfig;
    return typeof o === "object" && o !== null ? o : {};
  } catch (e) {
    captureError(e, "TaskCompleteParseConfig");
    return {};
  }
}

export function firstString(v: string | string[] | undefined): string {
  if (v == null) return "";
  return typeof v === "string" ? v : v[0] ?? "";
}

/** Disambiguate run vs workout when routing or seed data conflates the two. */
export function inferRunOrWorkout(taskType: string, taskName: string): "run" | "workout" {
  const n = taskName.toLowerCase();
  const looksRun = /\b(run|jog|running|5k|10k|mile|sprint)\b/.test(n);
  const looksWorkout = /\b(workout|gym|lift|hiit|yoga|strength|exercise|training|calisthenics)\b/.test(n);
  if (taskType === "run") {
    if (looksWorkout && !looksRun) return "workout";
    return "run";
  }
  if (taskType === "workout") {
    if (looksRun && !looksWorkout) return "run";
    return "workout";
  }
  return "workout";
}

export const WORKOUT_KINDS = ["Gym", "HIIT", "Yoga", "Calisthenics", "Other"] as const;

type RouterLike = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: never) => void;
};

export function goBackOrHome(router: RouterLike) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(ROUTES.TABS_HOME as never);
  }
}

export function formatCheckinTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}
