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
  earliestWindowClose,
  planG2aAhead,
  planG2aDay,
  g2aChallengeLine,
  g2aEveningBody,
  g2aMorningBody,
  g2aWindowBody,
  taskCloseHHMM,
  taskOpenHHMM,
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

describe("g2a copy", () => {
  it("pluralizes and drops the streak clause at 0", () => {
    expect(g2aEveningBody(1, 1)).toBe("1 task left today. Your streak is 1 day.");
    expect(g2aEveningBody(2, 2)).toBe("2 tasks left today. Your streak is 2 days.");
    expect(g2aEveningBody(1, 0)).toBe("1 task left today.");
    expect(g2aWindowBody("Read", "12:00 pm", 0)).toBe("Read window closes at 12:00 pm.");
    expect(g2aWindowBody("Read", "12:00 pm", 1)).toBe("Read window closes at 12:00 pm. Your streak is 1 day.");
  });

  it("morning with streak 0 uses the real challenge day, Day 1 only when it is Day 1", () => {
    expect(g2aMorningBody({ streak: 0, taskName: "Read", day: 1 })).toBe(
      "Day 1 is today. Finish Read to secure it.",
    );
    expect(g2aMorningBody({ streak: 0, taskName: "Read", day: 3 })).toBe(
      "Day 3 is today. Finish Read to secure it.",
    );
    expect(g2aMorningBody({ streak: 4, taskName: "Read", day: 5 })).toBe("Secure today and it's 5.");
  });

  it("tomorrow copy has no streak and uses tomorrow's calendar day from start_at", () => {
    expect(g2aChallengeLine("Crew", 2, 30)).toBe("Crew · Day 2 of 30");
    expect(g2aMorningBody({ streak: 0, taskName: "Read", day: 2, forTomorrow: true })).toBe(
      "Finish Read to secure today.",
    );
    expect(g2aMorningBody({ streak: 5, taskName: "Read", day: 6, forTomorrow: true })).toBe(
      "Finish Read to secure today.",
    );
    expect(g2aWindowBody("Read", "12:00 pm", 5, { includeStreak: false })).toBe(
      "Read window closes at 12:00 pm.",
    );
    expect(g2aEveningBody(1, 5, { includeStreak: false })).toBe("1 task left today.");
    expect(g2aWindowBody("Read", "12:00 pm", 5)).toContain("Your streak is 5 days.");
  });
});

describe("window close is the anchor for By and Between", () => {
  it("By: close is the By time; offset 0 means open equals close", () => {
    const by = {
      gateTime: { mode: "by" as const, start: "07:00", end: null },
      anchorTimeLocal: "07:00",
      windowStartOffsetMin: 0,
    };
    expect(taskCloseHHMM(by)).toBe("07:00");
    expect(taskOpenHHMM("07:00", 0)).toBe("07:00");
    const now = new Date(2026, 9, 2, 5, 0, 0);
    const close = earliestWindowClose([{ name: "Water", closeHHMM: taskCloseHHMM(by) }], now, now);
    expect(close?.hhmm).toBe("07:00");
    expect(close?.at.getHours()).toBe(7);
    expect(new Date(close!.at.getTime() - 45 * 60 * 1000).getHours()).toBe(6);
    expect(new Date(close!.at.getTime() - 45 * 60 * 1000).getMinutes()).toBe(15);
  });

  it("Between: close is the end, not the open; offset is minutes from close", () => {
    const between = {
      gateTime: { mode: "between" as const, start: "06:00", end: "08:00" },
      anchorTimeLocal: "08:00",
      windowStartOffsetMin: -120,
    };
    expect(taskCloseHHMM(between)).toBe("08:00");
    expect(taskCloseHHMM(between)).not.toBe("06:00");
    expect(taskOpenHHMM("08:00", -120)).toBe("06:00");
    const now = new Date(2026, 9, 2, 5, 0, 0);
    const close = earliestWindowClose([{ name: "Read", closeHHMM: taskCloseHHMM(between) }], now, now);
    expect(close?.hhmm).toBe("08:00");
    const warn = new Date(close!.at.getTime() - 45 * 60 * 1000);
    expect(warn.getHours()).toBe(7);
    expect(warn.getMinutes()).toBe(15);
  });
});

describe("g2a replan", () => {
  const now = new Date(2026, 9, 2, 8, 0, 0);
  const tasks = [{ name: "Read", closeHHMM: "18:00" }];
  function copy(remaining: number) {
    return {
      challengeLine: "Crew · Day 1 of 30",
      windowBody: (close: { name: string; hhmm: string }) => `${close.name} window closes at ${close.hhmm}.`,
      eveningBody: g2aEveningBody(remaining, 3),
      morningBody: "Secure today and it's 4.",
    };
  }

  it("re-plan after a check-in lowers the remaining count", () => {
    const before = planG2aAhead({
      now,
      securedToday: false,
      remainingToday: 2,
      remainingTomorrow: 2,
      tasks,
      today: copy(2),
      tomorrow: copy(2),
    });
    const after = planG2aAhead({
      now,
      securedToday: false,
      remainingToday: 1,
      remainingTomorrow: 2,
      tasks,
      today: copy(1),
      tomorrow: copy(2),
    });
    const evening = (plan: { today: { body: string }[] }) => plan.today.find((c) => c.body.includes("left"));
    expect(evening(before)?.body).toContain("2 tasks");
    expect(evening(after)?.body).toContain("1 task");
    expect(evening(after)?.body).not.toContain("2 tasks");
  });

  it("a secured day leaves today empty", () => {
    const secured = planG2aAhead({
      now,
      securedToday: true,
      remainingToday: 1,
      remainingTomorrow: 2,
      tasks,
      today: copy(1),
      tomorrow: copy(2),
    });
    expect(secured.today).toEqual([]);
    expect(secured.tomorrow.length).toBeGreaterThan(0);
  });

  it("count 0 schedules nothing", () => {
    const none = planG2aAhead({
      now,
      securedToday: false,
      remainingToday: 0,
      remainingTomorrow: 0,
      tasks,
      today: copy(0),
      tomorrow: copy(0),
    });
    expect(none.today).toEqual([]);
    expect(none.tomorrow).toEqual([]);
    const eveningOnly = g2aPushCandidates({
      now,
      securedToday: false,
      challengeLine: "Crew · Day 1 of 30",
      eveningBody: g2aEveningBody(0, 3),
      morningBody: "Secure today and it's 4.",
    });
    expect(eveningOnly.some((c) => c.body.startsWith("0 task"))).toBe(false);
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
