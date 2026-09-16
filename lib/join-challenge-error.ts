import { FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";

export const ALREADY_JOINED_MESSAGE = "You have already joined this challenge." as const;

export type JoinChallengeErrorKind = "limit" | "already" | "other";

export function classifyJoinChallengeError(err: unknown): {
  kind: JoinChallengeErrorKind;
  message: string;
} {
  const msg = err instanceof Error ? err.message : "";
  const code = (err as { data?: { code?: string } })?.data?.code;
  if (
    code === "FORBIDDEN" ||
    msg.includes(FREE_ACTIVE_LIMIT_MESSAGE) ||
    msg.toLowerCase().includes("up to 3 challenges")
  ) {
    return { kind: "limit", message: FREE_ACTIVE_LIMIT_MESSAGE };
  }
  if (code === "BAD_REQUEST" && /already joined/i.test(msg)) {
    return { kind: "already", message: msg.trim() || ALREADY_JOINED_MESSAGE };
  }
  return { kind: "other", message: msg };
}
