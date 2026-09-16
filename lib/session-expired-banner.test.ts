import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  OFFLINE_BANNER_PAD,
  SESSION_EXPIRED_PAD,
  sessionExpiredBannerOffset,
  showSessionExpiredBanner,
  topBannerOffset,
} from "./session-expired-banner";

describe("sessionExpiredBannerOffset", () => {
  it("keeps 12pt padding and puts the island inset in marginTop", () => {
    expect(sessionExpiredBannerOffset(59)).toEqual({
      marginTop: 59,
      paddingVertical: SESSION_EXPIRED_PAD,
    });
    expect(SESSION_EXPIRED_PAD).toBe(12);
  });
});

describe("offline banner inset", () => {
  it("uses marginTop for the island, not extra padding", () => {
    expect(topBannerOffset(59, OFFLINE_BANNER_PAD)).toEqual({
      marginTop: 59,
      paddingVertical: 8,
    });
    const src = readFileSync(
      join(process.cwd(), "components/OfflineBanner.tsx"),
      "utf8",
    );
    expect(src).toContain("topBannerOffset");
    expect(src).not.toContain("paddingTop");
  });
});

describe("showSessionExpiredBanner", () => {
  it("never renders on /auth/*", () => {
    const msg = "Session expired. Please sign in again.";
    expect(showSessionExpiredBanner("/auth/forgot-password", msg)).toBe(false);
    expect(showSessionExpiredBanner("/auth/login", msg)).toBe(false);
    expect(showSessionExpiredBanner("/", msg)).toBe(true);
  });
});

describe("task flow top inset", () => {
  it("pads PushedHeader / TaskChrome with the top safe inset", () => {
    const src = readFileSync(
      join(process.cwd(), "components/task-v2/TaskFlowV2.tsx"),
      "utf8",
    );
    expect(src).toContain("useSafeAreaInsets");
    expect(src).toContain("paddingTop: insets.top");
  });
});
