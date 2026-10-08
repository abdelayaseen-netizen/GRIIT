import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("push registration is silent to the user", () => {
  it("logs without console.error and ignores the expo-notifications keychain toast", () => {
    const sentry = readFileSync(resolve(__dirname, "./sentry.ts"), "utf8");
    const notifications = readFileSync(resolve(__dirname, "./notifications.ts"), "utf8");
    const layout = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    const logbox = readFileSync(resolve(__dirname, "./push-registration-logbox.ts"), "utf8");
    const reminders = readFileSync(
      resolve(__dirname, "../components/onboarding/v2/screens/RemindersScreen.tsx"),
      "utf8",
    );
    expect(sentry).toContain("export function captureSilentError");
    expect(sentry).toMatch(/export function captureSilentError[\s\S]*console\.warn/);
    expect(sentry).toMatch(/export function captureSilentError[\s\S]*reportToSentry/);
    expect(sentry).not.toMatch(/export function captureSilentError[\s\S]*console\.error/);
    expect(notifications).toContain('captureSilentError(error, "registerForPushNotificationsAsync")');
    expect(notifications).not.toContain('captureError(error, "registerForPushNotificationsAsync")');
    expect(layout.startsWith('import "@/lib/push-registration-logbox"')).toBe(true);
    expect(logbox).toContain("LogBox.ignoreLogs");
    expect(logbox).toContain("Error reading persisted server registration info");
    expect(logbox).toContain("Error fetching offerings");
    const purchases = readFileSync(resolve(__dirname, "./subscription.ts"), "utf8");
    expect(purchases).toContain("PurchasesModule.LOG_LEVEL?.DEBUG");
    expect(purchases).toContain("PurchasesModule.LOG_LEVEL?.ERROR");
    expect(purchases).toMatch(/__DEV__ \? PurchasesModule\.LOG_LEVEL\?\.DEBUG : PurchasesModule\.LOG_LEVEL\?\.ERROR/);
    expect(reminders).toContain("Notifications are off for GRIIT");
  });
});
