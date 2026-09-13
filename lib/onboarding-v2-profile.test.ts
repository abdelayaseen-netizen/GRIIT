import { describe, expect, it, vi } from "vitest";
import { normalizeOnboardingUsername, persistThenAdvance } from "@/lib/onboarding-v2-profile";

describe("normalizeOnboardingUsername", () => {
  it("strips backticks, lowercases, and drops spaces", () => {
    expect(normalizeOnboardingUsername("User Name`")).toBe("username");
    expect(normalizeOnboardingUsername("ABC")).toBe("abc");
    expect(normalizeOnboardingUsername("a b")).toBe("ab");
  });
});

describe("persistThenAdvance", () => {
  it("does not call onContinue when the write fails", async () => {
    const onContinue = vi.fn();
    const result = await persistThenAdvance(
      () => Promise.reject(new Error("Username already taken.")),
      onContinue
    );
    expect(result.status).toBe("stayed");
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("calls onContinue when the write succeeds", async () => {
    const onContinue = vi.fn();
    const result = await persistThenAdvance(() => Promise.resolve(), onContinue);
    expect(result.status).toBe("advanced");
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
