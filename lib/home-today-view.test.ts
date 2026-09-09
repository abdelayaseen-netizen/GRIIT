import { describe, expect, it } from "vitest";
import { homeTodayView, homeTodayVisibleCopy, NO_ACTIVE_CHALLENGE, TODAY_LOAD_ERROR } from "@/lib/home-today-view";

describe("homeTodayView", () => {
  it("error → no \"No active challenge\" string", () => {
    const q = { isLoading: false, isError: true, isSuccess: false, enrollmentCount: 0 };
    expect(homeTodayView(q)).toBe("error");
    const copy = homeTodayVisibleCopy(q);
    expect(copy).toContain(TODAY_LOAD_ERROR);
    expect(copy.join(" ")).not.toContain(NO_ACTIVE_CHALLENGE);
    expect(copy.join(" ")).not.toContain("No active challenge");
  });

  it("loading uses the skeleton, not empty", () => {
    const q = { isLoading: true, isError: false, isSuccess: false, enrollmentCount: 0 };
    expect(homeTodayView(q)).toBe("loading");
    expect(homeTodayVisibleCopy(q)).toEqual([]);
  });

  it("empty only after success with zero enrollments", () => {
    expect(
      homeTodayView({ isLoading: false, isError: false, isSuccess: true, enrollmentCount: 0 }),
    ).toBe("empty");
    expect(
      homeTodayVisibleCopy({ isLoading: false, isError: false, isSuccess: true, enrollmentCount: 0 }),
    ).toContain(NO_ACTIVE_CHALLENGE);
    expect(
      homeTodayView({ isLoading: false, isError: false, isSuccess: true, enrollmentCount: 1 }),
    ).toBe("ready");
  });
});
