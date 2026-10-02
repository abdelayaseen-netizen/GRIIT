import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  countByCalendarDay,
  g2aPushCandidates,
  lapsedOffsetDateKeys,
  lapsedOffsetsAvoidingG2a,
  addLocalDays,
  calendarDateKey,
  planG2aAhead,
  planG2aDay,
} from "@/lib/g2a-notifications";

describe("g2a day pushes", () => {
  it("cancels to empty when the day is secured and never exceeds two", () => {
    const now = new Date("2026-10-02T08:00:00");
    expect(
      g2aPushCandidates({
        now,
        securedToday: true,
        challengeLine: "Crew · Day 2 of 30",
        eveningBody: "1 tasks left today. Your streak is 1 days.",
        morningBody: "Secure today and it's 2.",
      }),
    ).toEqual([]);
    const close = new Date("2026-10-02T12:00:00");
    const open = g2aPushCandidates({
      now,
      securedToday: false,
      windowCloseAt: close,
      windowBody: "Read window closes at 12:00 pm. Your streak is 1 days.",
      challengeLine: "Crew · Day 2 of 30",
      eveningBody: "1 tasks left today. Your streak is 1 days.",
      morningBody: "Secure today and it's 2.",
    });
    expect(open).toHaveLength(2);
    expect(open[0]?.body).toContain("window closes");
    expect(open[1]?.body).toContain("tasks left");
  });

  it("a timed-task user has at most two scheduled notifications on any calendar day", () => {
    const now = new Date(2026, 9, 2, 8, 0, 0);
    const g2a = planG2aDay({
      now,
      securedToday: false,
      tasks: [
        { name: "Read", closeHHMM: "12:00" },
        { name: "Run", closeHHMM: "18:00" },
      ],
      challengeLine: "Crew · Day 1 of 30",
      windowBody: (close) => `${close.name} window closes at ${close.hhmm}.`,
      eveningBody: "2 tasks left today. Your streak is 0 days.",
      morningBody: "Secure today and it's 1.",
    });
    expect(g2a.length).toBeLessThanOrEqual(2);
    const g2aDays = Object.keys(countByCalendarDay(g2a));
    const lapsed = lapsedOffsetDateKeys(now).map((key, i) => {
      const at = new Date(now);
      at.setDate(at.getDate() + [3, 7, 14][i]!);
      return { at, key };
    });
    const keep = lapsedOffsetsAvoidingG2a(now, g2aDays);
    const kept = lapsed.filter((_, i) => keep.includes([3, 7, 14][i]!));
    const all = [...g2a, ...kept];
    const perDay = countByCalendarDay(all);
    for (const [day, n] of Object.entries(perDay)) {
      expect(n, day).toBeLessThanOrEqual(2);
    }
    for (const key of g2aDays) {
      expect(lapsedOffsetsAvoidingG2a(now, g2aDays)).not.toContain(
        Number(key === lapsedOffsetDateKeys(now)[0] ? 3 : -1),
      );
    }
    expect(keep.every((n) => !g2aDays.includes(lapsedOffsetDateKeys(now, [n])[0] ?? ""))).toBe(true);
  });

  it("keeps tomorrow's two queued when the user never opens on day 2", () => {
    const day1Open = new Date(2026, 9, 2, 8, 0, 0);
    const copy = {
      challengeLine: "Crew · Day 1 of 30",
      windowBody: (close: { name: string; hhmm: string }) => `${close.name} window closes at ${close.hhmm}.`,
      eveningBody: "1 task left today.",
      morningBody: "Day 1 is today. Finish Read to secure it.",
    };
    const plan = planG2aAhead({
      now: day1Open,
      securedToday: false,
      tasks: [{ name: "Read", closeHHMM: "12:00" }],
      today: copy,
      tomorrow: { ...copy, challengeLine: "Crew · Day 2 of 30" },
    });
    const day2 = calendarDateKey(addLocalDays(day1Open, 1));
    expect(plan.tomorrow).toHaveLength(2);
    expect(plan.tomorrow.every((c) => calendarDateKey(c.at) === day2)).toBe(true);
    const stillQueued = [...plan.today, ...plan.tomorrow].filter((c) => calendarDateKey(c.at) === day2);
    expect(stillQueued).toHaveLength(2);
    const secured = planG2aAhead({
      now: day1Open,
      securedToday: true,
      tasks: [{ name: "Read", closeHHMM: "12:00" }],
      today: copy,
      tomorrow: { ...copy, challengeLine: "Crew · Day 2 of 30" },
    });
    expect(secured.today).toEqual([]);
    expect(secured.tomorrow).toHaveLength(2);
    const perDay = countByCalendarDay([...plan.today, ...plan.tomorrow]);
    for (const n of Object.values(perDay)) expect(n).toBeLessThanOrEqual(2);
  });
});

describe("legacy daily schedulers", () => {
  it("useNotificationScheduler no longer schedules the old per-day trio", () => {
    const scheduler = readFileSync(resolve(__dirname, "../hooks/useNotificationScheduler.ts"), "utf8");
    expect(scheduler).not.toContain("scheduleNextSecureReminder");
    expect(scheduler).not.toContain("scheduleMorningMotivation");
    expect(scheduler).not.toContain("scheduleTaskWindowAlerts");
    expect(scheduler).toContain("cancelLegacyDailyReminders");
    expect(scheduler).toContain("scheduleWeeklySummary");
    expect(scheduler).toContain("scheduleChallengeCountdowns");
    expect(scheduler).toContain("scheduleLapsedUserReminders");
  });
});
