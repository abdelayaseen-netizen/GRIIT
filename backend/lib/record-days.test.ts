import { describe, expect, it } from "vitest";
import {
  RECORD_DAY_STATE,
  buildRecordDays,
  monthDateKeys,
  recordDayState,
  tallyTasks,
  tasksDueOnDay,
} from "./record-days";

describe("recordDayState", () => {
  it("keeps Last Stand and freeze as their own states", () => {
    expect(recordDayState({ secured: true, lastStand: true, frozen: false })).toBe(
      RECORD_DAY_STATE.LAST_STAND,
    );
    expect(recordDayState({ secured: false, lastStand: false, frozen: true })).toBe(
      RECORD_DAY_STATE.FROZEN,
    );
    expect(recordDayState({ secured: true, lastStand: false, frozen: false })).toBe(
      RECORD_DAY_STATE.SECURED,
    );
    expect(recordDayState({ secured: false, lastStand: false, frozen: false })).toBe(
      RECORD_DAY_STATE.NOT_SECURED,
    );
  });
});

describe("tallyTasks", () => {
  it("names the missed required tasks and counts done/total", () => {
    expect(
      tallyTasks({
        tasks: [
          { id: "a", title: "Run" },
          { id: "b", title: "Read" },
          { id: "c", title: "Write" },
        ],
        completedIds: ["a"],
      }),
    ).toEqual({ done: 1, total: 3, missedTaskNames: ["Read", "Write"] });
  });
});

describe("buildRecordDays", () => {
  it("builds a month with secured, not_secured, last_stand, and frozen", () => {
    const days = buildRecordDays({
      monthKey: "2026-09",
      securedDateKeys: ["2026-09-12"],
      lastStandDateKeys: ["2026-09-13"],
      frozenDateKeys: ["2026-09-14"],
      enrollments: [
        {
          startDateKey: "2026-09-01",
          endDateKey: "2026-09-30",
          tasks: [
            { id: "a", title: "Run" },
            { id: "b", title: "Read" },
          ],
        },
      ],
      checkIns: [
        { date_key: "2026-09-12", task_id: "a", status: "completed", proof_url: "https://x/p.jpg" },
        { date_key: "2026-09-13", task_id: "a", status: "completed" },
      ],
    });
    expect(monthDateKeys("2026-09")).toHaveLength(30);
    const byKey = new Map(days.map((d) => [d.dateKey, d]));
    expect(byKey.get("2026-09-12")).toMatchObject({
      state: "secured",
      done: 1,
      total: 2,
      cameraProof: true,
      missedTaskNames: ["Read"],
    });
    expect(byKey.get("2026-09-13")?.state).toBe("last_stand");
    expect(byKey.get("2026-09-14")?.state).toBe("frozen");
    expect(byKey.get("2026-09-15")).toMatchObject({
      state: "not_secured",
      done: 0,
      total: 2,
      cameraProof: false,
      missedTaskNames: ["Run", "Read"],
    });
  });
});

describe("tasksDueOnDay", () => {
  it("skips enrollments outside the day", () => {
    expect(
      tasksDueOnDay("2026-09-10", [
        { startDateKey: "2026-09-11", endDateKey: "2026-09-30", tasks: [{ id: "a", title: "Later" }] },
        { startDateKey: "2026-09-01", endDateKey: "2026-09-09", tasks: [{ id: "b", title: "Earlier" }] },
        { startDateKey: "2026-09-01", endDateKey: "2026-09-30", tasks: [{ id: "c", title: "Due" }] },
      ]),
    ).toEqual([{ id: "c", title: "Due" }]);
  });
});
