import { describe, expect, it } from "vitest";
import {
  firstTaskHrefFromJoin,
  joinHasEnrollment,
  setPendingFirstTaskHref,
  takePendingFirstTaskHref,
} from "@/lib/open-first-task";
import { ROUTES } from "@/lib/routes";

describe("open-first-task", () => {
  it("rejects waiting-room joins with no enrollment id", () => {
    expect(joinHasEnrollment({ joined: true, runStatus: "waiting" })).toBe(false);
    expect(firstTaskHrefFromJoin({ joined: true, runStatus: "waiting" })).toBeNull();
  });

  it("builds a task complete href from a join with first_task", () => {
    const href = firstTaskHrefFromJoin({
      id: "ac-1",
      challenge_id: "ch-1",
      challenge_title: "Show Up 7",
      current_day: 1,
      duration_days: 7,
      first_task: {
        id: "task-1",
        title: "Get to the gym",
        task_type: "photo",
        config: { photo_required: true },
        require_photo: true,
      },
    });
    expect(href).toContain(ROUTES.TASK_COMPLETE);
    expect(href).toContain("taskId=task-1");
    expect(href).toContain("activeChallengeId=ac-1");
    expect(href).toContain(encodeURIComponent("Get to the gym"));
    expect(href).not.toContain(ROUTES.TABS_HOME);
  });

  it("pending href is taken once", () => {
    setPendingFirstTaskHref("/task/complete?taskId=x");
    expect(takePendingFirstTaskHref()).toBe("/task/complete?taskId=x");
    expect(takePendingFirstTaskHref()).toBeNull();
  });
});
