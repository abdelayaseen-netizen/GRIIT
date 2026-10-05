import { describe, expect, it } from "vitest";
import { REVIEW_PHOTOS_LINE } from "@/backend/lib/create-visibility";
import {
  START_THE_CHALLENGE,
  reviewModeLabel,
  reviewSettingsRows,
  reviewTaskLine,
  reviewTitleLine,
} from "@/lib/create-review";
import { gateLabel } from "@/lib/task-ui";

describe("create review", () => {
  it("title is category · days · Solo|Group · mode in title case", () => {
    expect(
      reviewTitleLine({
        category: "learning",
        days: 30,
        who: "solo",
        difficulty: "standard",
      }),
    ).toBe("Learning · 30 days · Solo · Standard");
    expect(
      reviewTitleLine({
        category: "fitness",
        days: 75,
        who: "group",
        difficulty: "hard",
      }),
    ).toBe("Fitness · 75 days · Group · Strict");
    expect(START_THE_CHALLENGE).toBe("Start the challenge");
  });

  it("Each day proof line comes from gateLabel", () => {
    const task = {
      name: "Cold shower",
      gates: ["camera", "time"] as const,
      gateTime: { mode: "by" as const, start: "07:00", end: null },
    };
    expect(reviewTaskLine(task)).toEqual({
      name: "Cold shower",
      proof: gateLabel(task),
    });
    expect(reviewTaskLine(task).proof).toBe("Camera · By 7:00 am");
  });

  it("Settings lists Visibility, Photos, Starts", () => {
    const rows = reviewSettingsRows({ visibility: "PRIVATE", starts: "Today" });
    expect(rows.map((r) => r.label)).toEqual(["Visibility", "Photos", "Starts"]);
    expect(rows[1]?.value).toBe(REVIEW_PHOTOS_LINE);
  });

  it("mode labels", () => {
    expect(reviewModeLabel("standard")).toBe("Standard");
    expect(reviewModeLabel("hard")).toBe("Strict");
  });
});
