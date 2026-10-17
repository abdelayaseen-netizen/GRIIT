import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import { visibilityLabel, REVIEW_PHOTOS_LINE } from "@/backend/lib/create-visibility";
import { displayCategory } from "@/lib/challenge-category";
import { MODE_HARD_TITLE, MODE_STANDARD_TITLE } from "@/lib/create-mode-copy";
import { gateLabel } from "@/lib/task-ui";
import { blockedFieldFromMessage } from "@/lib/blocked-text";

export const START_THE_CHALLENGE = "Start the challenge";
export const LAUNCH_FAILED_HEADING = "Could not launch";
export const LAUNCH_FAILED_BODY = "Check your connection and try again.";
export const LAUNCH_RETRY = "Retry";
export const LAUNCH_FIX_WORDS = "Change the words";

/**
 * Build 90 07.1: what the Review step shows when the server refused the launch.
 * A blocked-text message is the server's own words plus a button that opens the step
 * holding that field (1 = title and description, 2 = tasks). Other server messages
 * (quality rules, the free limit) are shown as they are; a network failure keeps the
 * generic line.
 */
export function launchErrorCopy(error: string | null | undefined): {
  heading: string;
  body: string;
  actionLabel: string;
  editStep: 1 | 2 | null;
} {
  const field = blockedFieldFromMessage(error);
  if (field) {
    const editStep = field === "challenge title" || field === "challenge description" ? 1 : 2;
    return { heading: LAUNCH_FAILED_HEADING, body: error ?? "", actionLabel: LAUNCH_FIX_WORDS, editStep };
  }
  const msg = (error ?? "").trim();
  const isServerSentence = msg.length > 0 && /[.!?]$/.test(msg) && !/^tRPC|network|fetch|timed? ?out/i.test(msg);
  return {
    heading: LAUNCH_FAILED_HEADING,
    body: isServerSentence ? msg : LAUNCH_FAILED_BODY,
    actionLabel: LAUNCH_RETRY,
    editStep: null,
  };
}
export const REVIEW_LOCK = "You can't change the tasks after Day 1.";
export const REVIEW_STARTS_TODAY = "Today";
export const REVIEW_EACH_DAY = "Each day";
export const REVIEW_SETTINGS = "Settings";

export function reviewModeLabel(difficulty: "standard" | "hard"): string {
  return difficulty === "hard" ? MODE_HARD_TITLE : MODE_STANDARD_TITLE;
}

export function reviewTitleLine(args: {
  category: string | null | undefined;
  days: number;
  who: "solo" | "group";
  difficulty: "standard" | "hard";
}): string {
  const who = args.who === "group" ? "Group" : "Solo";
  return `${displayCategory(args.category)} · ${args.days} days · ${who} · ${reviewModeLabel(args.difficulty)}`;
}

export function reviewTaskLine(task: {
  name: string;
  gates?: readonly TaskGate[] | null;
  gateTime?: GateTime | null;
  requirePhoto?: boolean;
}): { name: string; proof: string } {
  return { name: task.name.trim() || "Task", proof: gateLabel(task) };
}

export function reviewSettingsRows(args: {
  visibility: string;
  starts: string;
}): { label: string; value: string }[] {
  return [
    { label: "Visibility", value: visibilityLabel(args.visibility) },
    { label: "Photos", value: REVIEW_PHOTOS_LINE },
    { label: "Starts", value: args.starts },
  ];
}
