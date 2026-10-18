import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GUEST_SETTINGS_LINE,
  SETTINGS_NOTIFICATIONS_SUB,
  STRAVA_CONNECT_TITLE,
  STRAVA_CONNECTED_SUB,
  settingsPrivacySub,
  stravaSettingsRow,
} from "@/lib/settings-rows";

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
    expect(GUEST_SETTINGS_LINE).toBe(
      "You're using GRIIT as a guest. Save your account so you don't lose your streak if you delete the app.",
    );
    expect(settings).toContain("GUEST_SETTINGS_LINE");
    expect(settings).toContain("is_anonymous");
  });

  it("Connect Strava is on Settings only when STRAVA_AUTO_VERIFY is on", () => {
    expect(stravaSettingsRow({ flagOn: false, connected: false })).toBeNull();
    expect(stravaSettingsRow({ flagOn: true, connected: false, guest: true })).toBeNull();
    // Build 92 08.6: the row is "Strava" with a Connect / Disconnect action and "Connected as {name}".
    expect(stravaSettingsRow({ flagOn: true, connected: false })).toMatchObject({
      title: STRAVA_CONNECT_TITLE,
      action: "connect",
      actionLabel: "Connect",
    });
    expect(stravaSettingsRow({ flagOn: true, connected: true })).toMatchObject({
      title: STRAVA_CONNECT_TITLE,
      subtitle: STRAVA_CONNECTED_SUB,
      action: "disconnect",
      actionLabel: "Disconnect",
    });
    const settings = readFileSync(resolve(__dirname, "../app/settings/index.tsx"), "utf8");
    expect(settings).toContain("stravaSettingsRow(");
    expect(settings).toContain("FLAGS.STRAVA_AUTO_VERIFY");
    expect(settings).toContain("TRPC.integrations.getStravaAuthUrl");
    expect(settings).toContain("TRPC.integrations.disconnectStrava");
    expect(settings).toContain("TRPC.integrations.getStravaConnection");
    expect(`${STRAVA_CONNECT_TITLE} ${STRAVA_CONNECTED_SUB}`).not.toContain("!");
  });
});
