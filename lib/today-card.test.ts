import { describe, expect, it } from "vitest";
import { todayCard, todayCardGateLabel } from "@/lib/today-card";
import type { TodayEnrollment, TodayState, TodayTask } from "@/lib/today-state";

const AC1 = "c0000000-0000-4000-8000-000000000001";
const AC2 = "c0000000-0000-4000-8000-000000000002";
const AC3 = "c0000000-0000-4000-8000-000000000003";
const CH1 = "d0000000-0000-4000-8000-000000000001";
const CH2 = "d0000000-0000-4000-8000-000000000002";
const CH3 = "d0000000-0000-4000-8000-000000000003";
const T1 = "e0000000-0000-4000-8000-000000000001";
const T2 = "e0000000-0000-4000-8000-000000000002";
const T3 = "e0000000-0000-4000-8000-000000000003";
const T4 = "e0000000-0000-4000-8000-000000000004";

function task(partial: Partial<TodayTask> & Pick<TodayTask, "id" | "title" | "done">): TodayTask {
  return {
    require_photo: false,
    require_location: false,
    config: { required: true },
    ...partial,
  };
}

function enrollment(
  partial: Partial<TodayEnrollment> &
    Pick<TodayEnrollment, "active_challenge_id" | "title" | "secured_today" | "tasks">,
): TodayEnrollment {
  return {
    challenge_id: CH1,
    current_day: 1,
    ...partial,
  };
}

function today(partial: Partial<TodayState> & Pick<TodayState, "enrollments">): TodayState {
  return {
    date_key: "2026-09-09",
    secured: false,
    streak: 4,
    secured_date_keys: ["2026-09-07", "2026-09-08"],
    remaining_challenges: partial.enrollments.filter((e) => !e.secured_today).length,
    ...partial,
  };
}

/** Spec: 3 enrollments, 4 tasks, 1 done. Done task listed first in its enrollment payload. */
function threeEnrollmentsOneDone(secured: boolean, allDone: boolean): TodayState {
  return today({
    secured,
    enrollments: [
      enrollment({
        active_challenge_id: AC1,
        challenge_id: CH1,
        title: "Morning run",
        secured_today: allDone,
        tasks: [
          task({
            id: T1,
            title: "Run",
            done: allDone,
            require_photo: true,
          }),
        ],
      }),
      enrollment({
        active_challenge_id: AC2,
        challenge_id: CH2,
        title: "Read 20",
        secured_today: allDone,
        tasks: [
          task({
            id: T2,
            title: "Pages",
            done: true,
          }),
          task({
            id: T3,
            title: "Log",
            done: allDone,
            require_location: true,
          }),
        ],
      }),
      enrollment({
        active_challenge_id: AC3,
        challenge_id: CH3,
        title: "Cold plunge",
        secured_today: allDone,
        tasks: [
          task({
            id: T4,
            title: "Plunge",
            done: allDone,
            config: {
              required: true,
              schedule_window_start: "06:00",
              schedule_window_end: "09:00",
            },
          }),
        ],
      }),
    ],
  });
}

describe("todayCard", () => {
  it("3 enrollments / 4 tasks / 1 done: badge 1/4, labelled, undone first in group, not secured", () => {
    const card = todayCard(threeEnrollmentsOneDone(false, false));
    expect(card.done).toBe(1);
    expect(card.total).toBe(4);
    expect(card.labelled).toBe(true);
    expect(card.day_secured).toBe(false);
    expect(card.groups.map((g) => g.challenge_name)).toEqual([
      "Morning run",
      "Read 20",
      "Cold plunge",
    ]);
    expect(card.groups[1]?.tasks.map((t) => t.id)).toEqual([T3, T2]);
    expect(card.groups[1]?.tasks.map((t) => t.done)).toEqual([false, true]);
    expect(todayCardGateLabel(card.groups[0]!.tasks[0]!)).toBe("Camera");
    expect(todayCardGateLabel(card.groups[1]!.tasks[0]!)).toBe("Location");
    expect(todayCardGateLabel(card.groups[1]!.tasks[1]!)).toBe("Self-reported");
    expect(card.groups[2]!.tasks[0]!.time_window).toBeDefined();
    expect(todayCardGateLabel(card.groups[2]!.tasks[0]!)).toBe(
      `Time window ${card.groups[2]!.tasks[0]!.time_window}`,
    );
  });

  it("all done: badge 4/4, every row done, day_secured from server", () => {
    const card = todayCard(threeEnrollmentsOneDone(true, true));
    expect(card.done).toBe(4);
    expect(card.total).toBe(4);
    expect(card.groups.every((g) => g.tasks.every((t) => t.done))).toBe(true);
    expect(card.day_secured).toBe(true);
  });

  it("one enrollment / one task: badge 0/1, no group label", () => {
    const card = todayCard(
      today({
        enrollments: [
          enrollment({
            active_challenge_id: AC1,
            title: "Solo",
            secured_today: false,
            tasks: [task({ id: T1, title: "Breathe", done: false })],
          }),
        ],
      }),
    );
    expect(card.done).toBe(0);
    expect(card.total).toBe(1);
    expect(card.labelled).toBe(false);
    expect(card.groups).toHaveLength(1);
    expect(card.day_secured).toBe(false);
  });

  it("all done + secured=false → day_secured false", () => {
    const card = todayCard(threeEnrollmentsOneDone(false, true));
    expect(card.done).toBe(4);
    expect(card.total).toBe(4);
    expect(card.groups.every((g) => g.tasks.every((t) => t.done))).toBe(true);
    expect(card.day_secured).toBe(false);
  });
});
