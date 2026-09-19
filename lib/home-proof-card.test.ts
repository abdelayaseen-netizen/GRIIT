import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  HOME_PROOF_CTA_TODAY,
  HOME_PROOF_HEADING,
  homeProofCtaLabel,
  homeProofDayLine,
  homeProofRingState,
  homeProofTitleMuted,
  selectHomeProofCard,
} from "@/lib/home-proof-card";
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
  it("two challenges × two tasks: one section each, tasks never cross", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({
          id: "i1",
          name: "Outdoor workout",
          challengeName: "Iron man",
          challengeId: "ch-iron",
          activeChallengeId: "ac-iron",
          durationDays: 14,
        }),
        task({
          id: "i2",
          name: "Read ten pages",
          challengeName: "Iron man",
          activeChallengeId: "ac-iron",
          durationDays: 14,
        }),
        task({
          id: "g1",
          name: "Write 3 gratitudes",
          challengeName: "Daily Gratitude",
          activeChallengeId: "ac-grat",
          durationDays: 30,
        }),
        task({
          id: "g2",
          name: "Evening note",
          challengeName: "Daily Gratitude",
          activeChallengeId: "ac-grat",
          durationDays: 30,
        }),
      ],
      tasksDoneToday: 0,
      totalTasksToday: 4,
      firstProofEver: false,
      securedToday: false,
    });
    expect(card.sections).toHaveLength(2);
    expect(card.sections[0]).toMatchObject({
      challenge: "Iron man",
      challengeId: "ch-iron",
      doneCount: 0,
      totalCount: 2,
    });
    expect(card.sections[0]?.rows.map((r) => r.name)).toEqual(["Outdoor workout", "Read ten pages"]);
    expect(card.sections[1]).toMatchObject({
      challenge: "Daily Gratitude",
      doneCount: 0,
      totalCount: 2,
    });
    expect(card.sections[1]?.rows.map((r) => r.name)).toEqual(["Write 3 gratitudes", "Evening note"]);
    expect(card.sections[0]?.rows.some((r) => r.name === "Write 3 gratitudes")).toBe(false);
    expect(card.sections[1]?.rows.some((r) => r.name === "Read ten pages")).toBe(false);
  });

  it("Iron man + Daily Gratitude + Quick Steps render three sections", () => {
    const card = selectHomeProofCard({
      tasks: [
        task({ id: "1", name: "Workout", challengeName: "Iron man", activeChallengeId: "ac-iron" }),
        task({ id: "2", name: "Read ten pages", challengeName: "Iron man", activeChallengeId: "ac-iron" }),
        task({ id: "3", name: "Gallon of water", challengeName: "Iron man", activeChallengeId: "ac-iron" }),
        task({ id: "4", name: "Outdoor photo", challengeName: "Iron man", activeChallengeId: "ac-iron" }),
        task({
          id: "5",
          name: "Write 3 gratitudes",
          challengeName: "Daily Gratitude",
          activeChallengeId: "ac-grat",
        }),
        task({
          id: "6",
          name: "Log your steps",
          challengeName: "Quick Steps",
          activeChallengeId: "ac-steps",
        }),
      ],
      tasksDoneToday: 0,
      totalTasksToday: 6,
      firstProofEver: false,
      securedToday: false,
    });
    expect(card.sections).toHaveLength(3);
    expect(card.sections.map((s) => s.challenge)).toEqual([
      "Iron man",
      "Daily Gratitude",
      "Quick Steps",
    ]);
    expect(card.sections.map((s) => s.totalCount)).toEqual([4, 1, 1]);
    expect(card.sections.map((s) => s.doneCount)).toEqual([0, 0, 0]);
    expect(card.doneCount).toBe(0);
    expect(card.totalCount).toBe(6);
    expect(card.sections[0]?.rows).toHaveLength(4);
    expect(card.sections[1]?.rows.map((r) => r.name)).toEqual(["Write 3 gratitudes"]);
    expect(card.sections[2]?.rows.map((r) => r.name)).toEqual(["Log your steps"]);
    expect(homeProofDayLine(card.sections[0]!.day, card.sections[0]!.dayTotal)).toBe("Day 1 of 1");
    expect(HOME_PROOF_HEADING).toBe("Today");
  });

  it("3 enrollments, 2 complete: each challenge keeps its own chip, CTA on the incomplete one", () => {
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
    expect(card.sections).toHaveLength(3);
    expect(card.doneCount).toBe(2);
    expect(card.totalCount).toBe(3);
    expect(card.sections[0]).toMatchObject({ challenge: "Run", doneCount: 1, totalCount: 1, showCta: false });
    expect(card.sections[1]).toMatchObject({ challenge: "Read", doneCount: 1, totalCount: 1, showCta: false });
    expect(card.sections[2]).toMatchObject({ challenge: "Write", doneCount: 0, totalCount: 1, showCta: false });
    expect(card.sections[2]?.rows[0]?.name).toBe("Journal");
    expect(card.posted).toBe(false);
    expect(card.showCta).toBe(false);
    expect(homeProofCtaLabel(card)).toBe(HOME_PROOF_CTA_TODAY);
    expect(homeProofCtaLabel(card)).toBe("Post your proof");
  });

  it("3 enrollments, 2 secured, third on current_day 1 unsecured shows Day 1 on that section", () => {
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
    expect(card.sections[2]?.day).toBe(1);
    expect(card.sections[2]?.day).not.toBe(0);
    expect(card.sections[2]?.day).not.toBe(2);
    expect(card.sections[2]?.challenge).toBe("Write");
    expect(card.sections[2]?.dayTotal).toBe(1);
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
    expect(card.sections[0]?.dayTotal).toBe(75);
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
    expect(card.sections[0]?.rows[0]?.caption).toBe("Self-reported");
    expect(card.sections[0]?.rows[0]?.caption).not.toBe("Photo");
    expect(card.sections[0]?.showCta).toBe(false);
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
    expect(card.sections).toHaveLength(1);
    expect(card.sections[0]?.showCta).toBe(false);
    expect(card.sections[0]?.rows).toHaveLength(6);
    expect(card.sections[0]?.rows[0]).toMatchObject({ done: true, hasCameraProof: true, caption: "Camera" });
    expect(card.sections[0]?.rows[1]).toMatchObject({ done: true, hasCameraProof: false, caption: "Self-reported" });
    expect(card.sections[0]?.rows[2]).toMatchObject({
      closed: true,
      caption: "Window closed · 6:00–9:00 am",
    });
    expect(card.sections[0]?.rows[3]?.caption).toBe("Camera");
    expect(card.sections[0]?.rows[4]?.caption).toBe("By 7:00 am");
    expect(card.sections[0]?.rows[5]?.caption).toBe("Self-reported");
    expect(card.sections[0]?.doneCount).toBe(2);
    expect(card.sections[0]?.totalCount).toBe(6);
  });
});

describe("homeProofRingState", () => {
  it("done is brand-filled, pending is a textSecondary ring, closed is a border ring", () => {
    expect(homeProofRingState({ done: true, closed: false })).toBe("done");
    expect(homeProofRingState({ done: false, closed: false })).toBe("pending");
    expect(homeProofRingState({ done: false, closed: true })).toBe("closed");
  });

  it("closed and done titles are muted; pending is not; closed is not dimmed", () => {
    expect(homeProofTitleMuted({ done: true, closed: false })).toBe(true);
    expect(homeProofTitleMuted({ done: false, closed: true })).toBe(true);
    expect(homeProofTitleMuted({ done: false, closed: false })).toBe(false);
  });
});

describe("Home Today card", () => {
  it("has no per-section Post your proof button", () => {
    const src = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(src).not.toContain("HOME_PROOF_CTA_TODAY");
    expect(src).not.toContain("section.showCta");
  });

  it("name tap is separate from the 44pt chevron; the n/n chip is not a press target", () => {
    const src = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    expect(src).toContain("onPressChallenge?.(section.challengeId!)");
    expect(src).toContain("chevronHit");
    expect(src).toContain("width: DS_V3.size.tap");
    expect(src).toContain("ChevronDown");
    expect(src).toContain("ChevronUp");
    const chipBlock = src.slice(src.indexOf("countChip"), src.indexOf("countTxt"));
    expect(chipBlock).not.toContain("Pressable");
  });
});
