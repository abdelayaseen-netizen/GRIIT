import { describe, expect, it } from "vitest";
import { neighborUris, step, viewerDays, viewerPosFor } from "@/lib/proof-viewer";

const days = [
  { tasks: [{ photos: 2 }, { photos: 1 }] },
  { tasks: [{ photos: 1 }] },
];

describe("proof viewer step", () => {
  it("moves through photos, then tasks, then days", () => {
    expect(step({ day: 0, task: 0, photo: 0 }, "tapRight", days)).toEqual({ day: 0, task: 0, photo: 1 });
    expect(step({ day: 0, task: 0, photo: 1 }, "tapRight", days)).toEqual({ day: 0, task: 1, photo: 0 });
    expect(step({ day: 0, task: 1, photo: 0 }, "swipeLeft", days)).toEqual({ day: 0, task: 1, photo: 0 });
    expect(step({ day: 0, task: 1, photo: 0 }, "swipeRight", days)).toEqual({ day: 0, task: 0, photo: 0 });
    expect(step({ day: 0, task: 0, photo: 0 }, "swipeDown", days)).toEqual({ day: 1, task: 0, photo: 0 });
    expect(step({ day: 1, task: 0, photo: 0 }, "swipeUp", days)).toEqual({ day: 0, task: 0, photo: 0 });
    expect(step({ day: 0, task: 0, photo: 0 }, "close", days)).toBe("close");
    expect(step({ day: 0, task: 0, photo: 0 }, "swipeDownHeader", days)).toBe("close");
  });

  it("groups a day newest first and lists neighbour urls", () => {
    const grouped = viewerDays([
      { id: "a", dateKey: "2026-10-01", uri: "u1", taskName: "Read", challengeName: "Read 30", day: 1, durationDays: 30, shared: true, capturedAt: null },
      { id: "b", dateKey: "2026-10-01", uri: "u2", taskName: "Read", challengeName: "Read 30", day: 1, durationDays: 30, shared: true, capturedAt: null },
      { id: "c", dateKey: "2026-09-30", uri: "u3", taskName: "Walk", challengeName: "Steps", day: 2, durationDays: 7, shared: false, capturedAt: null },
    ]);
    expect(grouped[0]?.dateKey).toBe("2026-10-01");
    expect(grouped[0]?.tasks).toHaveLength(1);
    expect(grouped[0]?.tasks[0]?.photos).toHaveLength(2);
    expect(neighborUris(grouped, 0)).toEqual(["u3"]);
  });

  it("uses the day the photo was taken, in the profile time zone", () => {
    const grouped = viewerDays(
      [
        {
          id: "oct9",
          dateKey: "2026-10-11",
          uri: "a",
          taskName: "Pray",
          challengeName: "Prayer",
          day: 7,
          durationDays: 30,
          shared: true,
          capturedAt: "2026-10-09T18:00:00.000Z",
          startDateKey: "2026-10-05",
        },
        {
          id: "oct11",
          dateKey: "2026-10-11",
          uri: "b",
          taskName: "Pray",
          challengeName: "Prayer",
          day: 7,
          durationDays: 30,
          shared: true,
          capturedAt: "2026-10-11T18:00:00.000Z",
          startDateKey: "2026-10-05",
        },
      ],
      { timeZone: "UTC" },
    );
    const oct9 = grouped.find((day) => day.dateKey === "2026-10-09");
    const oct11 = grouped.find((day) => day.dateKey === "2026-10-11");
    expect(oct9?.tasks[0]?.dayLine).toBe("Day 5 of 30");
    expect(oct11?.tasks[0]?.dayLine).toBe("Day 7 of 30");
    expect(viewerPosFor(grouped, "2026-10-11", "oct9").day).toBe(grouped.findIndex((day) => day.dateKey === "2026-10-09"));
  });
});
