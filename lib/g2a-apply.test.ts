import { beforeEach, describe, expect, it, vi } from "vitest";

const { cancelScheduledNotificationAsync, scheduleNotificationAsync } = vi.hoisted(() => ({
  cancelScheduledNotificationAsync: vi.fn(async (_id: string) => {}),
  scheduleNotificationAsync: vi.fn(async (_req: { identifier?: string }) => {}),
}));

vi.mock("expo-notifications", () => ({
  cancelScheduledNotificationAsync,
  scheduleNotificationAsync,
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import { applyG2aPlan } from "@/lib/g2a-notification-schedule";
import { G2A_PUSH_A, G2A_PUSH_B, planG2aAhead, g2aEveningBody } from "@/lib/g2a-notifications";

describe("applyG2aPlan", () => {
  beforeEach(() => {
    cancelScheduledNotificationAsync.mockClear();
    scheduleNotificationAsync.mockClear();
  });

  it("secure cancels today's notifications and leaves them unscheduled", async () => {
    const now = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    now.setHours(8, 0, 0, 0);
    const copy = {
      challengeLine: "Crew · Day 2 of 30",
      windowBody: () => "Read window closes at 6:00 pm.",
      eveningBody: g2aEveningBody(1, 3),
      morningBody: "Secure today and it's 4.",
    };
    const plan = planG2aAhead({
      now,
      securedToday: true,
      remainingToday: 1,
      remainingTomorrow: 1,
      tasks: [{ name: "Read", closeHHMM: "18:00" }],
      today: copy,
      tomorrow: copy,
    });
    await applyG2aPlan(plan);
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(G2A_PUSH_A);
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(G2A_PUSH_B);
    const scheduledIds = scheduleNotificationAsync.mock.calls.map((call) => call[0].identifier);
    expect(scheduledIds).not.toContain(G2A_PUSH_A);
    expect(scheduledIds).not.toContain(G2A_PUSH_B);
  });

  it("count 0 schedules nothing", async () => {
    await applyG2aPlan({ today: [], tomorrow: [] });
    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(G2A_PUSH_A);
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith(G2A_PUSH_B);
  });
});
