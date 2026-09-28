import { FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";
import { PRIVATE_CHALLENGE_MESSAGE } from "@/backend/lib/can-view-challenge";
import {
  ALREADY_IN_CHALLENGE_MESSAGE,
  JOIN_FAILED_FALLBACK,
  JOIN_FREE_LIMIT_MESSAGE,
} from "@/backend/lib/join-errors";

export const ALREADY_JOINED_MESSAGE = ALREADY_IN_CHALLENGE_MESSAGE;

export type JoinChallengeErrorKind = "limit" | "already" | "private" | "other";

export function classifyJoinChallengeError(err: unknown): {
  kind: JoinChallengeErrorKind;
  message: string;
} {
  const msg = err instanceof Error ? err.message : "";
  const code = (err as { data?: { code?: string } })?.data?.code;
  if (msg.includes(PRIVATE_CHALLENGE_MESSAGE)) {
    return { kind: "private", message: PRIVATE_CHALLENGE_MESSAGE };
  }
  if (
    msg.includes(JOIN_FREE_LIMIT_MESSAGE) ||
    msg.includes(FREE_ACTIVE_LIMIT_MESSAGE) ||
    msg.toLowerCase().includes("up to 3 challenges") ||
    (code === "FORBIDDEN" && !msg.includes(PRIVATE_CHALLENGE_MESSAGE))
  ) {
    return { kind: "limit", message: JOIN_FREE_LIMIT_MESSAGE };
  }
  if (/already (in|joined)/i.test(msg)) {
    return { kind: "already", message: ALREADY_IN_CHALLENGE_MESSAGE };
  }
  if (!msg.trim() || msg.includes("Failed to join") || msg.includes("unexpected")) {
    return { kind: "other", message: JOIN_FAILED_FALLBACK };
  }
  return { kind: "other", message: msg };
}
