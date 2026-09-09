import { describe, expect, it } from "vitest";
import { badge, firstUnsecuredEnrollment, pickProofTask, proofCard, proofGates, weekStrip } from "@/lib/today-derive";
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

function task(partial: Partial<TodayTask> & Pick<TodayTask, "id" | "title" | "done">): TodayTask {
  return {
    require_photo: false,
    require_location: false,
    config: { required: true },
    ...partial,
  };
}

function enrollment(
  partial: Partial<TodayEnrollment> & Pick<TodayEnrollment, "active_challenge_id" | "title" | "secured_today" | "tasks">,
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

describe("today-derive", () => {
  it("3 enrollments / 2 done: proof is the incomplete task; badge 2/3; week from keys", () => {
    const state = today({
      enrollments: [
        enrollment({
          active_challenge_id: AC1,
          challenge_id: CH1,
          title: "Run",
          current_day: 4,
          secured_today: true,
          tasks: [task({ id: T1, title: "Run 1 mile", done: true })],
        }),
        enrollment({
          active_challenge_id: AC2,
          challenge_id: CH2,
          title: "Read",
          current_day: 4,
          secured_today: true,
          tasks: [task({ id: T2, title: "Read 10 pages", done: true })],
        }),
        enrollment({
          active_challenge_id: AC3,
          challenge_id: CH3,
          title: "Write",
          current_day: 1,
          secured_today: false,
          tasks: [task({ id: T3, title: "Journal", done: false, require_photo: true })],
        }),
      ],
    });

    const card = proofCard(state);
    expect(card.taskText).toBe("Journal");
    expect(card.challenge).toBe("Write");
    expect(card.posted).toBe(false);
    expect(card.day).toBe(1);
    expect(card.doneCount).toBe(2);
    expect(card.totalCount).toBe(3);
    expect(badge(state)).toEqual({ done: 2, total: 3 });
    expect(pickProofTask(state)?.task.id).toBe(T3);
    expect(firstUnsecuredEnrollment(state)?.active_challenge_id).toBe(AC3);
    expect(proofGates(state.enrollments[2]!.tasks[0]!)).toEqual([{ kind: "camera" }]);
    expect(card.gate).toBe("Photo");

    const week = weekStrip(state);
    expect(week.todayIndex).toBe(2);
    expect(week.secured).toEqual([true, true, false, false, false, false, false]);
  });

  it("all-done: proof stays on the first task; posted; remaining 0", () => {
    const state = today({
      secured: true,
      remaining_challenges: 0,
      enrollments: [
        enrollment({
          active_challenge_id: AC1,
          title: "Run",
          current_day: 4,
          secured_today: true,
          tasks: [task({ id: T1, title: "Run 1 mile", done: true })],
        }),
        enrollment({
          active_challenge_id: AC2,
          challenge_id: CH2,
          title: "Read",
          current_day: 3,
          secured_today: true,
          tasks: [task({ id: T2, title: "Read 10 pages", done: true })],
        }),
      ],
    });

    const card = proofCard(state);
    expect(card.posted).toBe(true);
    expect(card.taskText).toBe("Run 1 mile");
    expect(card.day).toBe(3);
    expect(badge(state)).toEqual({ done: 2, total: 2 });
    expect(firstUnsecuredEnrollment(state)).toBeNull();
    expect(state.remaining_challenges).toBe(0);
  });

  it("one enrollment: badge and day follow that enrollment only", () => {
    const state = today({
      enrollments: [
        enrollment({
          active_challenge_id: AC1,
          title: "Write",
          current_day: 2,
          secured_today: false,
          tasks: [
            task({ id: T1, title: "Morning pages", done: true }),
            task({ id: T2, title: "Evening pages", done: false }),
          ],
        }),
      ],
    });

    const card = proofCard(state);
    expect(card.taskText).toBe("Evening pages");
    expect(card.challenge).toBe("Write");
    expect(card.day).toBe(2);
    expect(card.doneCount).toBe(1);
    expect(card.totalCount).toBe(2);
    expect(badge(state)).toEqual({ done: 1, total: 2 });
  });
});
