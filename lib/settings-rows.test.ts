import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SETTINGS_NOTIFICATIONS_SUB, settingsPrivacySub } from "@/lib/settings-rows";

describe("settings rows", () => {
  it("names the two-reminder system and public or private account", () => {
    expect(SETTINGS_NOTIFICATIONS_SUB).toBe("Up to 2 reminders a day");
    expect(settingsPrivacySub("public")).toBe("Public account");
    expect(settingsPrivacySub("private")).toBe("Private account");
    const settings = readFileSync(resolve(__dirname, "../app/settings/index.tsx"), "utf8");
    expect(settings).toContain("SETTINGS_NOTIFICATIONS_SUB");
    expect(settings).toContain("settingsPrivacySub");
    expect(settings).not.toContain("Daily reminder at");
    expect(settings).not.toContain("activity ${activityVis}");
  });
});
