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
      securedToday: false,
    });
    expect(card.taskText).toBe("Journal");
    expect(card.posted).toBe(false);
    expect(card.doneCount).toBe(2);
    expect(card.totalCount).toBe(3);
    expect(card.showCta).toBe(false);
    expect(homeProofCtaLabel(card)).toBe(HOME_PROOF_CTA_TODAY);
    expect(homeProofCtaLabel(card)).toBe("Post your proof");
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
      securedToday: false,
    });
    expect(card.day).toBe(1);
    expect(card.day).not.toBe(0);
    expect(card.day).not.toBe(2);
    expect(card.challenge).toBe("Write");
    expect(card.dayTotal).toBe(1);
  });

  it("dayTotal uses target_streak when longer than duration", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({
          name: "Journal",
          challengeName: "Write",
          currentDay: 1,
          durationDays: 30,
        }),
      ],
      tasksDoneToday: 0,
      totalTasksToday: 1,
      firstProofEver: true,
      targetStreak: 75,
      securedToday: false,
    });
    expect(card.dayTotal).toBe(75);
  });

  it("checkin done but securedDateKeys lacks today → posted is false", () => {
    const card = selectHomeProofCard({
      tasks: [task({ name: "Journal", challengeName: "Write", done: true })],
      tasksDoneToday: 1,
      totalTasksToday: 1,
      firstProofEver: false,
      securedToday: false,
    });
    expect(card.posted).toBe(false);
    expect(homeProofCtaLabel(card)).not.toBe("Posted today");
  });

  it("securedDateKeys has today → posted is true even if a task row is undone", () => {
    const card = selectHomeProofCard({
      tasks: [task({ name: "Journal", challengeName: "Write", done: false })],
      tasksDoneToday: 0,
      totalTasksToday: 1,
      firstProofEver: false,
      securedToday: true,
    });
    expect(card.posted).toBe(true);
    expect(homeProofCtaLabel(card)).toBe("Posted today");
  });

  it("manual task without require_photo is Self-reported, not Photo", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({
          name: "Make your bed",
          challengeName: "Bed",
          taskType: "manual",
          requirePhoto: false,
        }),
      ],
      tasksDoneToday: 0,
      totalTasksToday: 1,
      firstProofEver: true,
      securedToday: false,
    });
    expect(card.gate).toBe("Self-reported");
    expect(card.gate).not.toBe("Photo");
    expect(card.showCta).toBe(true);
    expect(card.rows[0]?.caption).toBe("Self-reported");
  });

  it("six tasks: 2 done, 1 closed, 3 pending → no button, captions match", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({
          id: "1",
          name: "Shower",
          challengeName: "Morning",
          done: true,
          hasCameraProof: true,
          gates: ["camera"],
        }),
        task({
          id: "2",
          name: "Make bed",
          challengeName: "Morning",
          done: true,
          hasCameraProof: false,
          gates: [],
        }),
        task({
          id: "3",
          name: "Run",
          challengeName: "Morning",
          done: false,
          windowState: "closed",
          gates: ["time"],
          gateTime: { mode: "between", start: "06:00", end: "09:00" },
        }),
        task({
          id: "4",
          name: "Journal",
          challengeName: "Morning",
          done: false,
          gates: ["camera"],
        }),
        task({
          id: "5",
          name: "Read",
          challengeName: "Morning",
          done: false,
          gates: ["time"],
          gateTime: { mode: "by", start: "07:00", end: null },
        }),
        task({
          id: "6",
          name: "Water",
          challengeName: "Morning",
          done: false,
          gates: [],
        }),
      ],
      tasksDoneToday: 2,
      totalTasksToday: 6,
      firstProofEver: false,
      securedToday: false,
    });
    expect(card.showCta).toBe(false);
    expect(card.rows).toHaveLength(6);
    expect(card.rows[0]).toMatchObject({ done: true, hasCameraProof: true, caption: "Camera" });
    expect(card.rows[1]).toMatchObject({ done: true, hasCameraProof: false, caption: "Self-reported" });
    expect(card.rows[2]).toMatchObject({
      closed: true,
      caption: "Window closed · 6:00–9:00 am",
    });
    expect(card.rows[3]?.caption).toBe("Camera");
    expect(card.rows[4]?.caption).toBe("By 7:00 am");
    expect(card.rows[5]?.caption).toBe("Self-reported");
    expect(card.doneCount).toBe(2);
    expect(card.totalCount).toBe(6);
  });
});
