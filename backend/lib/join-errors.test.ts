import { describe, expect, it } from "vitest";
import {
  ALREADY_IN_CHALLENGE_MESSAGE,
  JOIN_FAILED_FALLBACK,
  joinFailureFromInsert,
  pgErrorFields,
} from "./join-errors";

describe("joinFailureFromInsert", () => {
  it("maps unique violation to already-in", () => {
    const r = joinFailureFromInsert({
      code: "23505",
      message: "duplicate key value violates unique constraint",
      details: "Key (user_id, challenge_id)=(...) already exists.",
    });
    expect(r.alreadyIn).toBe(true);
    expect(r.message).toBe(ALREADY_IN_CHALLENGE_MESSAGE);
    expect(r.log.code).toBe("23505");
    expect(r.log.details).toContain("already exists");
  });

  it("maps other insert errors to the logged fallback", () => {
    const r = joinFailureFromInsert({
      code: "42501",
      message: "new row violates row-level security policy",
      details: "active_challenges",
    });
    expect(r.alreadyIn).toBe(false);
    expect(r.message).toBe(JOIN_FAILED_FALLBACK);
    expect(pgErrorFields(r.log).code).toBe("42501");
  });
});
