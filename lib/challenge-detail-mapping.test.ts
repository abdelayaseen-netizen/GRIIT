import { describe, expect, it } from "vitest";
import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";
import {
  JOIN_CAPTION_INVITE,
  JOIN_CAPTION_TODAY,
  detailState,
  formatTimeWindow,
  joinCaption,
  taskGates,
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
});

describe("detailState", () => {
  const now = new Date("2026-09-08T12:00:00.000Z");

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
});
