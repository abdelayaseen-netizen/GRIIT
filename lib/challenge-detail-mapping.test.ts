import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";
import {
  JOIN_CAPTION_INVITE,
  JOIN_CAPTION_TODAY,
  JOIN_CAPTION_TOMORROW,
  OPTIONAL_TASK_LABEL,
  day1StartCopy,
  detailState,
  detailTaskProof,
  detailTaskRequired,
  formatTimeWindow,
  joinCaption,
  taskGates,
  toDetailTasks,
} from "@/lib/challenge-detail-mapping";

describe("formatTimeWindow", () => {
  it("formats same-period hours as 6–9am", () => {
    expect(formatTimeWindow("06:00", "09:00")).toBe("6–9am");
  });

  it("formats crossing noon as 11am–2pm", () => {
    expect(formatTimeWindow("11:00", "14:00")).toBe("11am–2pm");
  });

  it("formats overnight as 10pm–2am", () => {
    expect(formatTimeWindow("22:00", "02:00")).toBe("10pm–2am");
  });

  it("keeps minutes when they are not zero", () => {
    expect(formatTimeWindow("06:30", "09:15")).toBe("6:30–9:15am");
  });
});

describe("taskGates", () => {
  it("returns empty when self-reported", () => {
    expect(taskGates({})).toEqual([]);
  });

  it("legacy photo type is Camera, same as gatesFor / feed", () => {
    expect(taskGates({ task_type: "photo" })).toEqual([{ kind: "camera" }]);
    expect(taskGates({ type: "photo" })).toEqual([{ kind: "camera" }]);
  });

  it("adds camera when require_photo is true", () => {
    expect(taskGates({ require_photo: true })).toEqual([{ kind: "camera" }]);
  });

  it("adds camera when config.require_camera_only is true", () => {
    expect(taskGates({ config: { require_camera_only: true } })).toEqual([{ kind: "camera" }]);
  });

  it("adds time_window only when both bounds exist", () => {
    expect(taskGates({ config: { schedule_window_start: "06:00" } })).toEqual([]);
    expect(taskGates({ config: { schedule_window_start: "06:00", schedule_window_end: "09:00" } })).toEqual([
      { kind: "time_window", label: "6–9am" },
    ]);
  });

  it("adds location when require_location is true", () => {
    expect(taskGates({ require_location: true })).toEqual([{ kind: "location" }]);
  });

  it("orders camera, time_window, location", () => {
    expect(
      taskGates({
        require_photo: true,
        require_location: true,
        config: { schedule_window_start: "06:00", schedule_window_end: "09:00" },
      }).map((g) => g.kind),
    ).toEqual(["camera", "time_window", "location"]);
  });

  it("detail / Home / review proof line is gateLabel including By", () => {
    expect(
      detailTaskProof({
        gate_time_mode: "by",
        gate_time_start: "07:00",
      }),
    ).toBe("By 7:00 am");
    expect(
      toDetailTasks([
        {
          title: "Read 10 pages",
          task_type: "counter",
          gate_time_mode: "by",
          gate_time_start: "07:00",
        },
      ])[0]?.proof,
    ).toBe("By 7:00 am");
    const detail = readFileSync(
      resolve(__dirname, "../components/challenge/ChallengeDetailV3.tsx"),
      "utf8",
    );
    expect(detail).toContain("{t.proof}");
    const home = readFileSync(resolve(__dirname, "../lib/home-proof-card.ts"), "utf8");
    expect(home).toContain("gateLabel({");
    const review = readFileSync(resolve(__dirname, "../lib/create-review.ts"), "utf8");
    expect(review).toContain("gateLabel(task)");
    const launched = readFileSync(
      resolve(__dirname, "../components/create/v2/LaunchedScreen.tsx"),
      "utf8",
    );
    expect(launched).toContain("gateLabel(first)");
  });
});

describe("detailTaskRequired", () => {
  it("Daily Gratitude: Write 3 is required, Share one is optional", () => {
    expect(detailTaskRequired({ config: { required: true } })).toBe(true);
    expect(detailTaskRequired({ config: { required: false } })).toBe(false);
    expect(detailTaskRequired({})).toBe(true);
    const tasks = toDetailTasks([
      { title: "Write 3 gratitudes", task_type: "journal", config: { required: true } },
      { title: "Share one with someone", task_type: "manual", config: { required: false } },
    ]);
    expect(tasks[0]).toMatchObject({ title: "Write 3 gratitudes", required: true });
    expect(tasks[1]).toMatchObject({ title: "Share one with someone", required: false });
    expect(OPTIONAL_TASK_LABEL).toBe("Optional");
    const detail = readFileSync(
      resolve(__dirname, "../components/challenge/ChallengeDetailV3.tsx"),
      "utf8",
    );
    expect(detail).toContain("Optional");
    expect(detail).toContain("t.required === false");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(home).toContain("(cfg?.required ?? true) === true");
    const record = readFileSync(resolve(__dirname, "../backend/trpc/routes/profiles-record.ts"), "utf8");
    expect(record).toContain("isTaskRequired");
    expect(record).toContain("buildProofsDays");
  });
});

describe("detailState", () => {
  const now = new Date("2026-09-08T12:00:00.000Z");

  it("archived 24h seed with null live_date is ended", () => {
    expect(
      detailState(
        { duration_type: "24h", live_date: null, status: "archived" },
        0,
        FREE_ACTIVE_CHALLENGES_LIMIT,
        now,
      ),
    ).toBe("ended");
  });

  it("completed run_status is ended before free_limit", () => {
    expect(
      detailState({ run_status: "completed" }, FREE_ACTIVE_CHALLENGES_LIMIT, FREE_ACTIVE_CHALLENGES_LIMIT, now),
    ).toBe("ended");
  });

  it("returns ended when ends_at is in the past", () => {
    expect(detailState({ ends_at: "2026-09-01T00:00:00.000Z" }, 0, FREE_ACTIVE_CHALLENGES_LIMIT, now)).toBe(
      "ended",
    );
  });

  it("returns ended when duration_type is 24h and live_date plus 24h is past", () => {
    expect(
      detailState(
        { duration_type: "24h", live_date: "2026-09-07T00:00:00.000Z" },
        0,
        FREE_ACTIVE_CHALLENGES_LIMIT,
        now,
      ),
    ).toBe("ended");
  });

  it("does not end a 24h challenge still inside its live window", () => {
    expect(
      detailState(
        { duration_type: "24h", live_date: "2026-09-08T00:00:00.000Z" },
        0,
        FREE_ACTIVE_CHALLENGES_LIMIT,
        now,
      ),
    ).toBe("default");
  });

  it("returns not_live when live_date is in the future", () => {
    expect(detailState({ live_date: "2026-09-10T00:00:00.000Z" }, 0, FREE_ACTIVE_CHALLENGES_LIMIT, now)).toBe(
      "not_live",
    );
  });

  it("checks ended before not_live", () => {
    expect(
      detailState(
        { ends_at: "2026-09-01T00:00:00.000Z", live_date: "2026-09-10T00:00:00.000Z" },
        0,
        FREE_ACTIVE_CHALLENGES_LIMIT,
        now,
      ),
    ).toBe("ended");
  });

  it("checks not_live before free_limit", () => {
    expect(
      detailState({ live_date: "2026-09-10T00:00:00.000Z" }, FREE_ACTIVE_CHALLENGES_LIMIT, FREE_ACTIVE_CHALLENGES_LIMIT, now),
    ).toBe("not_live");
  });

  it("returns free_limit when myActiveCount reaches the shared constant", () => {
    expect(detailState({}, FREE_ACTIVE_CHALLENGES_LIMIT, FREE_ACTIVE_CHALLENGES_LIMIT, now)).toBe("free_limit");
  });

  it("does not hardcode the free limit as 3", () => {
    expect(detailState({}, 3, 5, now)).toBe("default");
    expect(detailState({}, 5, 5, now)).toBe("free_limit");
  });

  it("returns default when no gate applies", () => {
    expect(detailState({}, 0, FREE_ACTIVE_CHALLENGES_LIMIT, now)).toBe("default");
  });
});

describe("joinCaption", () => {
  it("duo renders Day 1 is today until invite step exists", () => {
    expect(joinCaption("duo")).toBe("Day 1 is today.");
    expect(joinCaption("duo")).toBe(JOIN_CAPTION_TODAY);
    expect(JOIN_CAPTION_INVITE).toBe(
      "Join opens the invite step. You need a partner before Day 1.",
    );
  });

  it("team and solo also use Day 1 is today until invite step exists", () => {
    expect(joinCaption("team")).toBe(JOIN_CAPTION_TODAY);
    expect(joinCaption("solo")).toBe(JOIN_CAPTION_TODAY);
  });

  it("a secured day or a closed window makes Day 1 tomorrow", () => {
    expect(joinCaption("solo", undefined, undefined, true)).toBe(JOIN_CAPTION_TOMORROW);
    const join = readFileSync(resolve(__dirname, "../backend/lib/join-challenge.ts"), "utf8");
    expect(join).toContain("day1Defers");
    expect(join).toContain('.from("day_secures")');
    expect(join).not.toContain('.delete()');
  });

  it("reads start_at local date for Day 1 copy", () => {
    const now = new Date("2026-09-22T20:46:00.000Z");
    expect(day1StartCopy("2026-09-22T11:00:00.000Z", "America/New_York", now)).toBe(JOIN_CAPTION_TODAY);
    expect(day1StartCopy("2026-09-23T04:00:00.000Z", "America/New_York", now)).toBe(
      JOIN_CAPTION_TOMORROW,
    );
    const wizard = readFileSync(resolve(__dirname, "../components/create/CreateWizardV2.tsx"), "utf8");
    expect(wizard).toContain("day1StartCopy(");
    const catalog = readFileSync(resolve(__dirname, "../app/challenge/[id].tsx"), "utf8");
    expect(catalog).toContain("day1StartCopy(result.start_at, timeZone)");
    expect(catalog).toContain("JOIN_CAPTION_TOMORROW");
    expect(catalog).not.toContain('heading="You\'re in."');
    const detail = readFileSync(
      resolve(__dirname, "../components/challenge/ChallengeDetailV3.tsx"),
      "utf8",
    );
    expect(detail).toContain("deferDay1 ? (");
    expect(detail).toContain("JOIN_CAPTION_TOMORROW");
    expect(catalog).not.toContain('Alert.alert(\n          "You\'re in."');
    const active = readFileSync(
      resolve(__dirname, "../app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    expect(active).toContain("components/ds/Sheet");
    expect(active).toContain("Leave ${title}?");
    expect(active).toContain("Leave at midnight");
    expect(active).toContain("You leave at midnight.");
    expect(active).not.toContain("ConfirmDialog");
  });
});
