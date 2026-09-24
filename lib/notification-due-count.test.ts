import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { eveningSecureCopy } from "./evening-secure";
import { tasksDueTodayAcrossEnrollments } from "./notification-due-count";

describe("tasksDueTodayAcrossEnrollments", () => {
  it("2 enrollments, 6 tasks due, 3 done → \"3 left\"", () => {
    const counts = tasksDueTodayAcrossEnrollments({
      enrollments: [
        {
          tasks: [{ id: "a1" }, { id: "a2" }, { id: "a3" }, { id: "a4" }],
        },
        {
          tasks: [{ id: "b1" }, { id: "b2" }],
        },
      ],
      completedTaskIds: ["a1", "a2", "b1"],
    });
    expect(counts).toEqual({ due: 6, done: 3, remaining: 3 });
    expect(
      eveningSecureCopy({
        hour: 22,
        remaining: counts.remaining,
        total: counts.due,
        challenge: "Iron man",
        streak: 0,
      }).body,
    ).toBe("3 left. Two hours to secure today.");
    const scheduler = readFileSync(resolve(__dirname, "../hooks/useNotificationScheduler.ts"), "utf8");
    expect(scheduler).toContain("tasksDueTodayAcrossEnrollments");
    expect(scheduler).toContain("getTodayCheckinsForUser");
  });
});
