import { describe, expect, it } from "vitest";
import { shareDayCells } from "@/lib/share-image";

describe("shareDayCells", () => {
  it("paints each enrollment day from its real secure, miss, hold, and future", () => {
    const cells = shareDayCells({
      startDateKey: "2026-10-06",
      durationDays: 7,
      todayKey: "2026-10-10",
      securedDateKeys: ["2026-10-06", "2026-10-07", "2026-10-09"],
      frozenDateKeys: ["2026-10-08"],
    });
    expect(cells).toEqual(["secured", "secured", "held", "secured", "today", "future", "future"]);
    expect(cells.filter((cell) => cell === "secured")).toHaveLength(3);
  });

  it("marks a past due day missed when it was neither secured nor held", () => {
    const cells = shareDayCells({
      startDateKey: "2026-10-06",
      durationDays: 5,
      todayKey: "2026-10-08",
      securedDateKeys: ["2026-10-06"],
    });
    expect(cells).toEqual(["secured", "missed", "today", "future", "future"]);
  });
});
