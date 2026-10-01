import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  invalidateAfterOnboardingJoin,
  ONBOARDING_JOIN_QUERY_KEYS,
} from "./onboarding-v2-invalidate";

describe("invalidateAfterOnboardingJoin", () => {
  it("invalidates bootstrap, listMyActive, getStats, and getRecord", async () => {
    expect(ONBOARDING_JOIN_QUERY_KEYS).toEqual([
      ["home", "bootstrap"],
      ["challenge", "listMyActive"],
      ["profiles", "getStats"],
      ["profiles", "getRecord"],
    ]);
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    await invalidateAfterOnboardingJoin({ invalidateQueries });
    expect(invalidateQueries).toHaveBeenCalledTimes(4);
    for (const queryKey of ONBOARDING_JOIN_QUERY_KEYS) {
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [...queryKey] });
    }
    const join = readFileSync(resolve(__dirname, "./onboarding-v2-join.ts"), "utf8");
    const complete = readFileSync(
      resolve(__dirname, "../components/onboarding/v2/completeOnboarding.ts"),
      "utf8",
    );
    expect(join).toContain("invalidateAfterOnboardingJoin");
    expect(complete).toContain("invalidateAfterOnboardingJoin");
    const tab = readFileSync(
      resolve(__dirname, "../components/activity/NotificationsTab.tsx"),
      "utf8",
    );
    expect(tab).toContain('heading="No notifications yet."');
    expect(tab).not.toContain("Find a challenge");
    expect(tab).not.toContain("Join a challenge and updates");
  });
});
