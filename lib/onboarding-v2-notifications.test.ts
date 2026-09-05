import { describe, expect, it } from "vitest";
import { v2MayPromptNotificationPermission } from "@/lib/onboarding-v2-notifications";

describe("v2 single notification prompt", () => {
  it("only the Reminders primary CTA may call requestPermissionsAsync", () => {
    expect(v2MayPromptNotificationPermission("reminders_cta")).toBe(true);
    expect(v2MayPromptNotificationPermission("bootstrap")).toBe(false);
    expect(v2MayPromptNotificationPermission("auth_session")).toBe(false);
    expect(v2MayPromptNotificationPermission("after_first_join")).toBe(false);
  });
});
