/**
 * Frame 59 — Secured for a day that can hold several proofs.
 * Day numbers only appear with a challenge name. Zero photos means no image area.
 */
import type { HomeProofTask } from "@/lib/home-proof-card";

export const SECURED_TODAY = "Today is secured.";
export const SECURED_SELF = "Self-reported";
export const SECURED_TILE_MAX = 3;
export const SECURED_PHOTO_H = 240;
export const SECURED_TILE = 112;
export const SECURED_LOAD_ERROR = "Couldn't load. Try again.";
export const SECURED_LOAD_RETRY = "Retry";

export type SecuredProof = {
  uri: string;
  challengeName: string;
  day: number;
  length: number;
  eventId: string | null;
};

export type SecuredSelfRow = {
  name: string;
  day: number;
  length: number;
};

export type SecuredHandoff = {
  proofs: SecuredProof[];
  shareEventId: string | null;
  closingHasPhoto: boolean;
};

let handoff: SecuredHandoff | null = null;

export function setSecuredHandoff(next: SecuredHandoff): void {
  handoff = next;
}

export function readSecuredHandoff(): SecuredHandoff | null {
  return handoff;
}

export function taskProofIsSelfReported(task: {
  requirePhoto?: boolean;
  gates?: readonly string[] | null;
}): boolean {
  if (task.requirePhoto === true) return false;
  return !(task.gates ?? []).includes("camera");
}

export function securedDayCaption(args: {
  taskCount: number;
  challengeCount: number;
  cameraProofs: number;
  allSelfReported?: boolean;
}): string {
  const n = Math.max(0, Math.floor(args.taskCount));
  const m = Math.max(0, Math.floor(args.challengeCount));
  const k = Math.max(0, Math.floor(args.cameraProofs));
  const across = m > 1 ? ` across ${m} challenges` : "";
  if (args.allSelfReported === true) return `${n} tasks${across}, all self-reported. Nothing was checked.`;
  return `${n} tasks${across}. ${k} camera proofs.`;
}

export function securedOverflowLabel(total: number): string | null {
  if (total <= SECURED_TILE_MAX) return null;
  return `+${total - SECURED_TILE_MAX + 1}`;
}

export function securedChallengeLine(name: string, day: number, length: number): string {
  return `${name} · Day ${Math.max(1, day)} of ${Math.max(1, length)}`;
}

export function proofsFromComplete(args: {
  dayProofs?: { imageUrl?: string | null; challengeName?: string; day?: number; durationDays?: number; eventId?: string | null }[];
  photoUri?: string | null;
  challengeName: string;
  challengeDay: number;
  challengeLength: number;
  eventId?: string | null;
}): SecuredProof[] {
  const tiles = (args.dayProofs ?? [])
    .filter((t) => Boolean(t.imageUrl))
    .map((t) => ({
      uri: t.imageUrl as string,
      challengeName: t.challengeName ?? args.challengeName,
      day: t.day ?? args.challengeDay,
      length: t.durationDays ?? args.challengeLength,
      eventId: t.eventId ?? null,
    }));
  if (tiles.length === 0 && args.photoUri) {
    return [
      {
        uri: args.photoUri,
        challengeName: args.challengeName,
        day: args.challengeDay,
        length: args.challengeLength,
        eventId: args.eventId ?? null,
      },
    ];
  }
  return tiles;
}

export function selectSecuredDayMeta(args: {
  tasks: HomeProofTask[];
  proofs: { challengeName: string }[];
}): {
  taskCount: number;
  challengeCount: number;
  selfReported: SecuredSelfRow[];
  allSelfReported: boolean;
} {
  const done = args.tasks.filter((t) => t.done);
  const names = [...new Set(done.map((t) => t.challengeName))];
  const selfReported = names
    .filter((name) => done.filter((row) => row.challengeName === name).every(taskProofIsSelfReported))
    .map((name) => {
      const t = done.find((row) => row.challengeName === name)!;
      return {
        name,
        day: t.currentDay,
        length: t.durationDays ?? t.currentDay,
      };
    });
  return {
    taskCount: done.length,
    challengeCount: names.length,
    selfReported,
    allSelfReported: done.length > 0 && done.every(taskProofIsSelfReported),
  };
}
