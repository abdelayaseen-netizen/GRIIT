import { describe, expect, it } from "vitest";
import { dateKeyFromIsoInTimeZone } from "./date-utils";
import { consistencyFromDayArray } from "../../lib/consistency";
import {
  buildProofsDays,
  coverPathFromStored,
  proofsBreakdown,
  proofsDayState,
  proofsHeader,
  PROOFS_DAY_STATE,
} from "./proofs-days";
import type { EnrollmentTasks } from "./record-days";

const ENROLL: EnrollmentTasks = {
  startDateKey: "2026-09-12",
  endDateKey: "2026-09-30",
  tasks: [
    { id: "run", title: "Run" },
    { id: "read", title: "Read" },
  ],
};

function days(viewer: "owner" | "visitor" = "owner") {
  return buildProofsDays({
    todayKey: "2026-09-19",
    securedDateKeys: ["2026-09-16", "2026-09-17", "2026-09-19"],
    lastStandDateKeys: ["2026-09-15"],
    frozenDateKeys: ["2026-09-14"],
    enrollments: [ENROLL],
    checkIns: [
      {
        date_key: "2026-09-16",
        task_id: "run",
        status: "completed",
        proof_url: "https://x.supabase.co/storage/v1/object/public/task-proofs/u1/first.jpg",
        created_at: "2026-09-16T08:00:00.000Z",
      },
      {
        date_key: "2026-09-16",
        task_id: "read",
        status: "completed",
        proof_url: "https://x.supabase.co/storage/v1/object/public/task-proofs/u1/second.jpg",
        created_at: "2026-09-16T09:00:00.000Z",
      },
      { date_key: "2026-09-17", task_id: "run", status: "completed" },
      { date_key: "2026-09-17", task_id: "read", status: "completed" },
      {
        date_key: "2026-09-19",
        task_id: "run",
        status: "completed",
        proof_url: "https://x.supabase.co/storage/v1/object/public/task-proofs/u1/today.jpg",
        created_at: "2026-09-19T10:00:00.000Z",
      },
    ],
    shareEvents: [
      { dateKey: "2026-09-16", hasPhoto: true, shared: false },
      { dateKey: "2026-09-19", hasPhoto: true, shared: true },
    ],
    viewer,
  });
}

describe("proofsDayState", () => {
  it("covers every v41 state", () => {
    expect(PROOFS_DAY_STATE).toEqual([
      "camera",
      "self",
      "freeze",
      "last_stand",
      "missed",
      "today_open",
      "today_secured",
      "before_first",
    ]);
    expect(
      proofsDayState({
        date: "2026-09-11",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: false,
        secured: false,
        camera: false,
        frozen: false,
        lastStand: false,
      }),
    ).toBe("before_first");
    expect(
      proofsDayState({
        date: "2026-09-16",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: true,
        camera: true,
        frozen: false,
        lastStand: false,
      }),
    ).toBe("camera");
    expect(
      proofsDayState({
        date: "2026-09-17",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: true,
        camera: false,
        frozen: false,
        lastStand: false,
      }),
    ).toBe("self");
    expect(
      proofsDayState({
        date: "2026-09-14",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: false,
        camera: false,
        frozen: true,
        lastStand: false,
      }),
    ).toBe("freeze");
    expect(
      proofsDayState({
        date: "2026-09-15",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: false,
        camera: false,
        frozen: false,
        lastStand: true,
      }),
    ).toBe("last_stand");
    expect(
      proofsDayState({
        date: "2026-09-13",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: false,
        camera: false,
        frozen: false,
        lastStand: false,
      }),
    ).toBe("missed");
    expect(
      proofsDayState({
        date: "2026-09-19",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: false,
        camera: false,
        frozen: false,
        lastStand: false,
      }),
    ).toBe("today_open");
    expect(
      proofsDayState({
        date: "2026-09-19",
        todayKey: "2026-09-19",
        firstStart: "2026-09-12",
        due: true,
        secured: true,
        camera: true,
        frozen: false,
        lastStand: false,
      }),
    ).toBe("today_secured");
  });
});

describe("buildProofsDays", () => {
  it("emits first start_at through today and no future day", () => {
    const list = days();
    expect(list[0]?.date).toBe("2026-09-12");
    expect(list[list.length - 1]?.date).toBe("2026-09-19");
    expect(list.some((d) => d.date > "2026-09-19")).toBe(false);
    expect(list.some((d) => d.date < "2026-09-12")).toBe(false);
  });

  it("marks freeze, Last Stand, camera, self, missed, and today_secured", () => {
    const by = new Map(days().map((d) => [d.date, d]));
    expect(by.get("2026-09-14")?.state).toBe("freeze");
    expect(by.get("2026-09-15")?.state).toBe("last_stand");
    expect(by.get("2026-09-16")?.state).toBe("camera");
    expect(by.get("2026-09-16")?.cover_path).toBe("u1/first.jpg");
    expect(by.get("2026-09-16")?.shared).toBe(false);
    expect(by.get("2026-09-16")?.tasksDone).toBe(2);
    expect(by.get("2026-09-16")?.tasksDue).toBe(2);
    expect(by.get("2026-09-17")?.state).toBe("self");
    expect(by.get("2026-09-13")?.state).toBe("missed");
    expect(by.get("2026-09-19")?.state).toBe("today_secured");
  });

  it("joined today is a single today_open row", () => {
    const list = buildProofsDays({
      todayKey: "2026-09-27",
      securedDateKeys: [],
      lastStandDateKeys: [],
      frozenDateKeys: [],
      enrollments: [{ startDateKey: "2026-09-27", endDateKey: "2026-10-26", tasks: [{ id: "a", title: "Run" }] }],
      checkIns: [],
    });
    expect(list).toEqual([
      {
        date: "2026-09-27",
        state: "today_open",
        cover_path: null,
        shared: false,
        tasksDone: 0,
        tasksDue: 1,
      },
    ]);
  });

  it("a visitor never gets a private cover_path; state stays camera", () => {
    const owner = new Map(days("owner").map((d) => [d.date, d]));
    const visitor = new Map(days("visitor").map((d) => [d.date, d]));
    expect(owner.get("2026-09-16")).toMatchObject({
      state: "camera",
      cover_path: "u1/first.jpg",
      shared: false,
    });
    expect(visitor.get("2026-09-16")).toMatchObject({
      state: "camera",
      cover_path: null,
      shared: false,
    });
    expect(visitor.get("2026-09-19")?.cover_path).toBe("u1/today.jpg");
  });

  it("header equals Home's securedElapsed number for the same fixture", () => {
    const dueDayKeys = [
      "2026-09-12",
      "2026-09-13",
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
    ];
    const securedDateKeys = ["2026-09-16", "2026-09-17", "2026-09-19"];
    const header = proofsHeader({ dueDayKeys, securedDateKeys, todayKey: "2026-09-19" });
    const home = consistencyFromDayArray({ dueDayKeys, securedDateKeys, todayKey: "2026-09-19" });
    expect(header).toEqual({ secured: home.secured, days: home.due });
    expect(header).toEqual({ secured: 3, days: 8 });
  });
});

describe("timezone edge", () => {
  it("the same start_at is a different first day in LA vs Auckland", () => {
    const startAt = "2026-09-16T06:00:00.000Z";
    expect(dateKeyFromIsoInTimeZone(startAt, "America/Los_Angeles")).toBe("2026-09-15");
    expect(dateKeyFromIsoInTimeZone(startAt, "Pacific/Auckland")).toBe("2026-09-16");
    const la = buildProofsDays({
      todayKey: "2026-09-16",
      securedDateKeys: [],
      lastStandDateKeys: [],
      frozenDateKeys: [],
      enrollments: [
        {
          startDateKey: dateKeyFromIsoInTimeZone(startAt, "America/Los_Angeles"),
          endDateKey: "2026-10-15",
          tasks: [{ id: "a", title: "Run" }],
        },
      ],
      checkIns: [],
    });
    const ak = buildProofsDays({
      todayKey: "2026-09-16",
      securedDateKeys: [],
      lastStandDateKeys: [],
      frozenDateKeys: [],
      enrollments: [
        {
          startDateKey: dateKeyFromIsoInTimeZone(startAt, "Pacific/Auckland"),
          endDateKey: "2026-10-15",
          tasks: [{ id: "a", title: "Run" }],
        },
      ],
      checkIns: [],
    });
    expect(la[0]?.date).toBe("2026-09-15");
    expect(ak[0]?.date).toBe("2026-09-16");
    expect(la.map((d) => d.date)).toContain("2026-09-15");
    expect(ak.map((d) => d.date)).not.toContain("2026-09-15");
  });
});

describe("coverPathFromStored", () => {
  it("strips a public URL to the storage path", () => {
    expect(
      coverPathFromStored(
        "https://x.supabase.co/storage/v1/object/public/task-proofs/u1/a.jpg",
      ),
    ).toBe("u1/a.jpg");
    expect(coverPathFromStored("u1/a.jpg")).toBe("u1/a.jpg");
  });
});

describe("proofsBreakdown", () => {
  it("is not hard-coded zero", () => {
    expect(proofsBreakdown(days())).toEqual({
      cameraDays: 2,
      selfReportedDays: 1,
      lastStandDays: 1,
      freezeDays: 1,
    });
  });
});
