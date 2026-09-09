import { describe, expect, it } from "vitest";
import { HOME_PROOF_CTA_TODAY, homeProofCtaLabel, selectHomeProofCard } from "@/lib/home-proof-card";
import type { HomeProofTask } from "@/lib/home-proof-card";

function task(partial: Partial<HomeProofTask> & Pick<HomeProofTask, "name" | "challengeName">): HomeProofTask {
  return {
    currentDay: 1,
    done: false,
    challengeSecuredToday: false,
    taskType: "photo",
    ...partial,
  };
}

describe("selectHomeProofCard", () => {
  it("3 enrollments, 2 complete, card shows the incomplete one, CTA is Post today's proof", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({ name: "Run 1 mile", challengeName: "Run", currentDay: 3, done: true, challengeSecuredToday: true }),
        task({ name: "Read 10 pages", challengeName: "Read", currentDay: 3, done: true, challengeSecuredToday: true }),
        task({ name: "Journal", challengeName: "Write", currentDay: 1, done: false, challengeSecuredToday: false }),
      ],
      tasksDoneToday: 2,
      totalTasksToday: 3,
      firstProofEver: false,
    });
    expect(card.taskText).toBe("Journal");
    expect(card.posted).toBe(false);
    expect(card.doneCount).toBe(2);
    expect(card.totalCount).toBe(3);
    expect(homeProofCtaLabel(card)).toBe(HOME_PROOF_CTA_TODAY);
    expect(homeProofCtaLabel(card)).toBe("Post today's proof");
  });

  it("3 enrollments, 2 secured, third on current_day 1 unsecured shows Day 1", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({ name: "Run 1 mile", challengeName: "Run", currentDay: 3, done: true, challengeSecuredToday: true }),
        task({ name: "Read 10 pages", challengeName: "Read", currentDay: 3, done: true, challengeSecuredToday: true }),
        task({ name: "Journal", challengeName: "Write", currentDay: 1, done: false, challengeSecuredToday: false }),
      ],
      tasksDoneToday: 2,
      totalTasksToday: 3,
      firstProofEver: false,
    });
    expect(card.day).toBe(1);
    expect(card.day).not.toBe(0);
    expect(card.day).not.toBe(2);
    expect(card.challenge).toBe("Write");
  });
});
