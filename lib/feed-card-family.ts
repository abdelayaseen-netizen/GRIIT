import { calendarDay } from "@/lib/home-day-total";
import { formatDays, formatOfDays, formatTasks } from "@/lib/format-days";

export type FeedCardVariant =
  | "task_camera"
  | "task_self"
  | "day_secured"
  | "challenge_started"
  | "challenge_finished"
  | "badge_earned";

export type FeedCardInput = {
  eventType: string;
  isCompleted: boolean;
  hasProof: boolean;
  challengeName: string;
  taskName?: string | null;
  currentDay: number;
  totalDays: number;
  startDateKey?: string | null;
  postDateKey?: string | null;
  cameraGate?: boolean;
  photo?: boolean;
  mode?: "Standard" | "Hard";
  securedDays?: number;
  target?: string | null;
  badgeRequirement?: string | null;
  taskCount?: number;
};

export function feedCardVariant(p: FeedCardInput): FeedCardVariant {
  if (p.eventType === "secured_day") return "day_secured";
  if (p.eventType === "joined_challenge" || p.eventType === "challenge_created") return "challenge_started";
  if (p.isCompleted || p.eventType === "completed_challenge") return "challenge_finished";
  if (p.eventType === "badge_earned" || p.eventType === "streak_milestone") return "badge_earned";
  if (p.hasProof || (p.cameraGate === true && p.photo === true)) return "task_camera";
  return "task_self";
}

export function feedCardDayNo(startDateKey: string, postDateKey: string, length: number): number {
  return calendarDay(startDateKey, postDateKey, length);
}

export function feedCardEyebrow(p: FeedCardInput, variant: FeedCardVariant): string {
  if (variant === "badge_earned") return "Earned a mark";
  if (variant === "day_secured") return `${p.challengeName} · Day ${p.currentDay} of ${p.totalDays}`;
  return p.challengeName;
}

export function feedCardSubject(p: FeedCardInput, variant: FeedCardVariant): string {
  if (variant === "day_secured") return "Day secured";
  if (variant === "challenge_started") return "Started the challenge";
  if (variant === "challenge_finished") return "Finished the challenge";
  if (variant === "badge_earned") return "";
  return (p.taskName ?? "").trim() || "Task";
}

export function feedProofSubject(day: number, total: number, challenge: string): string {
  const name = challenge.trim();
  const dayLine = `Day ${Math.max(0, Math.floor(day))} of ${Math.max(0, Math.floor(total))}`;
  return name ? `${dayLine} · ${name}` : dayLine;
}

export function feedCardMeta(p: FeedCardInput, variant: FeedCardVariant): string {
  if (variant === "task_camera") return "Camera · Taken in the app";
  if (variant === "task_self") {
    const target = (p.target ?? "").trim();
    return target ? `${target} · Self-reported` : "Self-reported";
  }
  if (variant === "day_secured") {
    const n = p.taskCount && p.taskCount > 0 ? p.taskCount : 1;
    return `All ${formatTasks(n)} done`;
  }
  if (variant === "challenge_started") return `${formatDays(p.totalDays)} · ${p.mode ?? "Standard"} mode`;
  if (variant === "challenge_finished") {
    if (typeof p.securedDays !== "number") return "";
    return `${formatOfDays(p.securedDays, p.totalDays)} secured`;
  }
  return (p.badgeRequirement ?? "").trim();
}

export function feedCardShowsVerified(variant: FeedCardVariant, cameraGate: boolean, hasPhoto: boolean): boolean {
  return variant === "task_camera" && cameraGate && hasPhoto;
}

export const SEE_THE_DAY = "See the day";
export const NO_COMMENTS_YET = "No comments yet.";

export function viewAllComments(n: number): string {
  return `View all ${n} comments`;
}

export function inlineCommentsState(n: number): "none" | "few" | "more" {
  if (n <= 0) return "none";
  if (n <= 2) return "few";
  return "more";
}
