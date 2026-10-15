import { describe, expect, it } from "vitest";
import { parseInterview } from "./interview";

describe("exit interview", () => {
  it("accepts a complete in-character reply", () => {
    const parsed = parseInterview(
      '{"openTomorrow":"Yes, after work","secured":"The day is done","freeze":"A day you can skip","selfReported":"I said I did it","best":"The first check","worst":"The long intro","tellFriend":"I would, it is short","score":7}',
    );
    expect(parsed?.score).toBe(7);
    expect(parsed?.secured).toBe("The day is done");
  });

  it("rejects a reply that skips a question", () => {
    expect(parseInterview('{"openTomorrow":"yes","score":8}')).toBeNull();
    expect(parseInterview('{"openTomorrow":"yes","secured":"done","freeze":"skip","selfReported":"said so","best":"x","worst":"y","tellFriend":"no","score":0}')).toBeNull();
  });
});
