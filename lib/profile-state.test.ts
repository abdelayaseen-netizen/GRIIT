import { describe, it, expect } from "vitest";
import { computeProfileState } from "./profile-state";

describe("computeProfileState", () => {
  it("returns new_user only when both streak === 0 and postCount === 0", () => {
    expect(computeProfileState({ streak: 0, postCount: 0 })).toBe("new_user");
  });

  it("returns growing when streak > 0 but postCount = 0 (or vice versa)", () => {
    expect(computeProfileState({ streak: 1, postCount: 0 })).toBe("growing");
    expect(computeProfileState({ streak: 0, postCount: 1 })).toBe("growing");
  });

  it("returns growing for early-stage users (< 14 streak OR < 10 posts)", () => {
    expect(computeProfileState({ streak: 7, postCount: 5 })).toBe("growing");
    expect(computeProfileState({ streak: 13, postCount: 9 })).toBe("growing");
    expect(computeProfileState({ streak: 30, postCount: 5 })).toBe("growing");
    expect(computeProfileState({ streak: 5, postCount: 30 })).toBe("growing");
  });

  it("returns established when streak >= 14 AND postCount >= 10", () => {
    expect(computeProfileState({ streak: 14, postCount: 10 })).toBe("established");
    expect(computeProfileState({ streak: 23, postCount: 18 })).toBe("established");
    expect(computeProfileState({ streak: 100, postCount: 100 })).toBe("established");
  });
});
