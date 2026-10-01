import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  normalizeOnboardingUsername,
  persistThenAdvance,
  profileContinueDisabled,
  shouldRecheckUsername,
} from "@/lib/onboarding-v2-profile";

describe("profile Continue after keyboard dismiss", () => {
  it("stays enabled when an available name is blurred", () => {
    expect(shouldRecheckUsername({ value: "maya", lastCheckedValue: "maya" })).toBe(false);
    expect(
      profileContinueDisabled({
        saving: false,
        username: "maya",
        availability: "checking",
        lastResultValue: "maya",
      }),
    ).toBe(false);
    expect(
      profileContinueDisabled({
        saving: false,
        username: "maya",
        availability: "available",
        lastResultValue: "maya",
      }),
    ).toBe(false);
    expect(
      profileContinueDisabled({
        saving: false,
        username: "newname",
        availability: "checking",
        lastResultValue: "maya",
      }),
    ).toBe(true);
  });
});

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

  it("marks the profile query invalidated after save, before onContinue", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const key = ["profiles", "getRecord", "user-a"] as const;
    qc.setQueryData(key, { username: "user_abcd1234" });
    const order: string[] = [];
    const onContinue = vi.fn(() => {
      order.push("continue");
    });
    const result = await persistThenAdvance(
      async () => {
        order.push("write");
      },
      onContinue,
      { queryClient: qc }
    );
    expect(result.status).toBe("advanced");
    expect(qc.getQueryState(key)?.isInvalidated).toBe(true);
    expect(order).toEqual(["write", "continue"]);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
