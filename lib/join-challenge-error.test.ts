import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";
import { PRIVATE_CHALLENGE_MESSAGE } from "@/backend/lib/can-view-challenge";
import { JOIN_FREE_LIMIT_MESSAGE } from "@/backend/lib/join-errors";
import {
  ALREADY_JOINED_MESSAGE,
  classifyJoinChallengeError,
} from "@/lib/join-challenge-error";

describe("classifyJoinChallengeError", () => {
  it("maps private copy to private, not the free-tier paywall", () => {
    const err = Object.assign(new Error(PRIVATE_CHALLENGE_MESSAGE), {
      data: { code: "FORBIDDEN" },
    });
    expect(classifyJoinChallengeError(err)).toEqual({
      kind: "private",
      message: PRIVATE_CHALLENGE_MESSAGE,
    });
  });

  it("maps FORBIDDEN / free-tier copy to the limit message, not a generic error", () => {
    const err = Object.assign(new Error(FREE_ACTIVE_LIMIT_MESSAGE), {
      data: { code: "FORBIDDEN" },
    });
    expect(classifyJoinChallengeError(err)).toEqual({
      kind: "limit",
      message: JOIN_FREE_LIMIT_MESSAGE,
    });
  });

  it("maps the join procedure BAD_REQUEST already-joined throws — not the free-tier limit", () => {
    const err = Object.assign(new Error(ALREADY_JOINED_MESSAGE), {
      data: { code: "BAD_REQUEST" },
    });
    expect(classifyJoinChallengeError(err)).toEqual({
      kind: "already",
      message: ALREADY_JOINED_MESSAGE,
    });
    expect(classifyJoinChallengeError(err).kind).not.toBe("limit");
  });

  it("onboarding join moves on when the person is already in the challenge", () => {
    const src = readFileSync(resolve(__dirname, "onboarding-v2-join.ts"), "utf8");
    expect(src).toContain('classified.kind === "already"');
    expect(src).toContain("return { ok: true }");
  });

  it("pins the onboarding footer outside the scroll view", () => {
    const src = readFileSync(resolve(__dirname, "../components/onboarding/v2/OnboardingChrome.tsx"), "utf8");
    expect(src.indexOf("</ScrollView>")).toBeLessThan(src.indexOf("{footer ?"));
  });
});
