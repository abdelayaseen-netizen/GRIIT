import { describe, expect, it } from "vitest";
import { enrollmentFinished, routeAfterSave } from "@/lib/route-after-save";

describe("routeAfterSave", () => {
  const id = "enr-1";

  it("opens FinishMoment only when the enrollment just finished", () => {
    expect(
      routeAfterSave({ challengeFinished: true, daySecuredNow: true, enrollmentId: id }),
    ).toEqual({ screen: "FinishMoment", enrollmentId: id });
  });

  it("opens Secured when the day just secured and the challenge is still going", () => {
    expect(
      routeAfterSave({ challengeFinished: false, daySecuredNow: true, enrollmentId: id }),
    ).toEqual({ screen: "Secured" });
  });

  it("opens a Home toast for any other save", () => {
    expect(
      routeAfterSave({ challengeFinished: false, daySecuredNow: false, enrollmentId: id }),
    ).toEqual({ screen: "Toast" });
  });

  it("never opens FinishMoment when a counter reaches 30 of 30", () => {
    const finished = enrollmentFinished({
      challengeDone: true,
      dayIndex: 3,
      durationDays: 14,
      counterReachedTarget: true,
    });
    expect(finished).toBe(false);
    expect(
      routeAfterSave({ challengeFinished: finished, daySecuredNow: false, enrollmentId: id }).screen,
    ).not.toBe("FinishMoment");
    expect(
      routeAfterSave({ challengeFinished: finished, daySecuredNow: true, enrollmentId: id }).screen,
    ).toBe("Secured");
  });

  it("does not finish from the day index alone", () => {
    expect(
      enrollmentFinished({ challengeDone: false, dayIndex: 30, durationDays: 30 }),
    ).toBe(false);
  });

  it("finishes when the last day of the enrollment was secured", () => {
    expect(
      enrollmentFinished({ challengeDone: true, dayIndex: 30, durationDays: 30 }),
    ).toBe(true);
  });
});
