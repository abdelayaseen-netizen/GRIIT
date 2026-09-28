import { describe, expect, it } from "vitest";
import { dayWord, formatDays, formatOfDays, formatTasks, taskWord } from "@/lib/format-days";

describe("format-days plurals", () => {
  it("singular and plural day words", () => {
    expect(dayWord(1)).toBe("day");
    expect(dayWord(0)).toBe("days");
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(2)).toBe("2 days");
    expect(formatOfDays(1, 1)).toBe("1 of 1 day");
    expect(formatOfDays(1, 14)).toBe("1 of 14 days");
  });

  it("singular and plural task words", () => {
    expect(taskWord(1)).toBe("task");
    expect(taskWord(3)).toBe("tasks");
    expect(formatTasks(1)).toBe("1 task");
    expect(formatTasks(3)).toBe("3 tasks");
  });
});
