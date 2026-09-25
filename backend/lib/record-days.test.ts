import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  RECORD_DAY_STATE,
  buildRecordDays,
  cameraProvenTaskCount,
  exclusiveEndDateKey,
  firstDueDateKey,
  historyEndDateKey,
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
    expect(recordDayState({ secured: false, lastStand: false, frozen: false, today: true })).toBe(
      RECORD_DAY_STATE.OPEN,
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

const ENROLLMENT = {
  startDateKey: "2026-09-12",
  endDateKey: "2026-09-30",
  tasks: [
    { id: "a", title: "Run" },
    { id: "b", title: "Read" },
  ],
};

function september(todayKey: string) {
  return buildRecordDays({
    monthKey: "2026-09",
    todayKey,
    securedDateKeys: ["2026-09-16"],
    lastStandDateKeys: ["2026-09-15"],
    frozenDateKeys: ["2026-09-14"],
    enrollments: [ENROLLMENT],
    checkIns: [
      { date_key: "2026-09-16", task_id: "a", status: "completed", proof_url: "https://x/p.jpg" },
      { date_key: "2026-09-15", task_id: "a", status: "completed" },
    ],
  });
}

describe("buildRecordDays", () => {
  it("stops at today and never lists a future day", () => {
    const days = september("2026-09-19");
    expect(monthDateKeys("2026-09")).toHaveLength(30);
    expect(days.some((d) => d.dateKey > "2026-09-19")).toBe(false);
    expect(days.map((d) => d.dateKey)).not.toContain("2026-09-20");
    expect(days.map((d) => d.dateKey)).toContain("2026-09-19");
  });

  it("never lists a day before the first due day", () => {
    expect(firstDueDateKey([ENROLLMENT])).toBe("2026-09-12");
    const days = september("2026-09-19");
    expect(days.some((d) => d.dateKey < "2026-09-12")).toBe(false);
    expect(days.find((d) => d.dateKey === "2026-09-11")).toBeUndefined();
  });

  it("marks today not yet secured as open", () => {
    const today = september("2026-09-19").find((d) => d.dateKey === "2026-09-19");
    expect(today).toMatchObject({ state: "open", done: 0, total: 2 });
  });

  it("keeps freeze and Last Stand as their own states", () => {
    const days = september("2026-09-19");
    const byKey = new Map(days.map((d) => [d.dateKey, d]));
    expect(byKey.get("2026-09-16")?.state).toBe("secured");
    expect(byKey.get("2026-09-15")?.state).toBe("last_stand");
    expect(byKey.get("2026-09-14")?.state).toBe("frozen");
    expect(byKey.get("2026-09-13")?.state).toBe("not_secured");
  });

  it("counts camera-proven tasks that day, not a boolean any-photo", () => {
    expect(
      cameraProvenTaskCount(
        [
          { id: "a", title: "Run" },
          { id: "b", title: "Read" },
          { id: "c", title: "Write" },
        ],
        [
          { date_key: "2026-09-18", task_id: "a", status: "completed", proof_url: "https://x/a.jpg" },
          { date_key: "2026-09-18", task_id: "b", status: "completed", proof_url: "https://x/b.jpg" },
          { date_key: "2026-09-18", task_id: "c", status: "completed" },
          { date_key: "2026-09-18", task_id: "a", status: "completed", proof_url: "https://x/a2.jpg" },
        ],
      ),
    ).toBe(2);
  });

  it("orders newest first", () => {
    const keys = september("2026-09-19").map((d) => d.dateKey);
    expect(keys[0]).toBe("2026-09-19");
    expect(keys[keys.length - 1]).toBe("2026-09-12");
    expect(keys).toEqual([...keys].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)));
  });
});

describe("loadDayTaskTally", () => {
  it("uses the same due-task set as the month rows", () => {
    const src = readFileSync(resolve(__dirname, "./record-days.ts"), "utf8");
    expect(src).toContain("return tallyTasks({ tasks: tasksDueOnDay(dateKey, enrollments), completedIds });");
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

  it("an enrollment ended yesterday still contributes to yesterday's row", () => {
    const endedYesterday = {
      startDateKey: "2026-09-16",
      endDateKey: "2026-09-21",
      tasks: [{ id: "dg", title: "Write 3 gratitudes" }],
    };
    const days = buildRecordDays({
      monthKey: "2026-09",
      todayKey: "2026-09-22",
      securedDateKeys: [],
      lastStandDateKeys: [],
      frozenDateKeys: [],
      enrollments: [endedYesterday],
      checkIns: [],
    });
    expect(days.find((d) => d.dateKey === "2026-09-21")?.total).toBe(1);
    expect(days.find((d) => d.dateKey === "2026-09-22")?.total).toBe(0);
  });

  it("an abandoned enrollment contributes up to ended_at and not after", () => {
    const endDateKey = historyEndDateKey(
      {
        status: "abandoned",
        end_at: "2026-10-15T23:59:59.999Z",
        ended_at: "2026-09-22T20:00:00.000Z",
      },
      "America/New_York",
    );
    expect(endDateKey).toBe("2026-09-22");
    const en = {
      startDateKey: "2026-09-16",
      endDateKey,
      tasks: [{ id: "dg", title: "Write 3 gratitudes" }],
    };
    expect(tasksDueOnDay("2026-09-22", [en])).toEqual([{ id: "dg", title: "Write 3 gratitudes" }]);
    expect(tasksDueOnDay("2026-09-23", [en])).toEqual([]);
    expect(tasksDueOnDay("2026-09-16", [en])).toHaveLength(1);
    expect(
      exclusiveEndDateKey(
        {
          status: "abandoned",
          end_at: "2026-10-15T23:59:59.999Z",
          ended_at: "2026-09-23T16:00:00.000Z",
        },
        "2026-09-16",
        "UTC",
      ),
    ).toBe("2026-09-24");
  });

  it("a future-start enrollment contributes nothing", () => {
    const future = {
      startDateKey: "2026-09-23",
      endDateKey: "2026-10-06",
      tasks: [{ id: "x", title: "Later" }],
    };
    expect(tasksDueOnDay("2026-09-22", [future])).toEqual([]);
    expect(
      buildRecordDays({
        monthKey: "2026-09",
        todayKey: "2026-09-22",
        securedDateKeys: [],
        lastStandDateKeys: [],
        frozenDateKeys: [],
        enrollments: [future],
        checkIns: [],
      }),
    ).toEqual([]);
  });
});

describe("getRecord history query", () => {
  it("loads active, completed, and abandoned without the live window", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/profiles-record.ts"), "utf8");
    expect(src).toContain('.in("status", ["active", "completed", "abandoned"])');
    expect(src).not.toContain("applyEnrollmentWindow");
    expect(src).toContain("historyEndDateKey(row, timezone)");
    expect(src).toContain("exclusiveEndDateKey(row, startDateKey, timezone)");
  });
});
