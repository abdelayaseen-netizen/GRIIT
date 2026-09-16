import { describe, expect, it } from "vitest";
import { FREE_ACTIVE_LIMIT_MESSAGE } from "@/lib/free-challenge-limit";
import {
  ALREADY_JOINED_MESSAGE,
  classifyJoinChallengeError,
} from "@/lib/join-challenge-error";

describe("classifyJoinChallengeError", () => {
  it("maps FORBIDDEN / free-tier copy to the limit message, not a generic error", () => {
    const err = Object.assign(new Error(FREE_ACTIVE_LIMIT_MESSAGE), {
      data: { code: "FORBIDDEN" },
    });
    expect(classifyJoinChallengeError(err)).toEqual({
      kind: "limit",
      message: FREE_ACTIVE_LIMIT_MESSAGE,
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
});
