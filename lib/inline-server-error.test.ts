import { describe, expect, it } from "vitest";
import { GENERIC_INLINE_ERROR, inlineServerError } from "@/lib/inline-server-error";

describe("inlineServerError", () => {
  it("shows the server BAD_REQUEST message", () => {
    const err = Object.assign(new Error("Hard mode: this task can only be completed between 06:00 and 08:00."), {
      data: { code: "BAD_REQUEST" },
    });
    expect(inlineServerError(err)).toBe(
      "Hard mode: this task can only be completed between 06:00 and 08:00.",
    );
  });

  it("keeps the generic copy for network and unknown errors", () => {
    expect(inlineServerError(new Error("Failed to fetch"))).toBe(GENERIC_INLINE_ERROR);
    expect(inlineServerError(new Error("tRPC mutation failed: challenges.leave (500)"))).toBe(
      GENERIC_INLINE_ERROR,
    );
    expect(inlineServerError(new Error("Something exploded"))).toBe(GENERIC_INLINE_ERROR);
    expect(inlineServerError({})).toBe(GENERIC_INLINE_ERROR);
  });

  it("is the same generic string the active screen used to hard-code", () => {
    expect(GENERIC_INLINE_ERROR).toBe("Something went wrong. Please try again.");
  });
});
