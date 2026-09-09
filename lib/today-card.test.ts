import { describe, expect, it } from "vitest";
import { formatTimeWindow, taskGates } from "@/lib/challenge-detail-mapping";
import { todayCardGateLabel } from "@/lib/today-card";

describe("todayCardGateLabel", () => {
  it("builds WhyProof sample rows from taskGates and formatTimeWindow", () => {
    const window = formatTimeWindow("06:00", "09:00");
    expect(window).toBe("6–9am");
    const run = taskGates({
      require_photo: true,
      config: { schedule_window_start: "06:00", schedule_window_end: "09:00" },
    });
    expect(todayCardGateLabel({ gates: run.map((g) => g.kind), time_window: window ?? "" })).toBe(
      "Camera · Time window 6–9am"
    );
    expect(todayCardGateLabel({ gates: [] })).toBe("Self-reported");
    const shower = taskGates({ require_photo: true, require_location: true });
    expect(todayCardGateLabel({ gates: shower.map((g) => g.kind) })).toBe("Camera · Location");
  });
});
