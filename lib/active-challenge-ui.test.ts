import { describe, expect, it } from "vitest";
import {
  RESET_NOTICE,
  doneGate,
  footerAction,
  hasCameraProof,
  homeProofGate,
  pendingGate,
  securedTodayFromKeys,
  statusLine,
  taskVerb,
  weekSecuredFromKeys,
  type ActiveChallengeTask,
} from "./active-challenge-ui";

const WEEK = [
  "2026-09-07",
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
  "2026-09-12",
  "2026-09-13",
];
const TODAY = "2026-09-08";

function task(partial: Partial<ActiveChallengeTask> & Pick<ActiveChallengeTask, "id" | "title" | "task_type">): ActiveChallengeTask {
  return {
    require_photo: false,
    completed_today: false,
    ...partial,
  };
}

describe("binding law", () => {
  it("reset_notice is always false until the backend exposes a reset event", () => {
    expect(RESET_NOTICE).toBe(false);
  });

  it("secured_today comes from getSecuredDateKeys, never from task rows", () => {
    const allDone: ActiveChallengeTask[] = [
      task({ id: "1", title: "A", task_type: "timer", completed_today: true }),
    ];
    expect(allDone.every((t) => t.completed_today)).toBe(true);
    expect(securedTodayFromKeys([], TODAY)).toBe(false);
    expect(securedTodayFromKeys([TODAY], TODAY)).toBe(true);
  });

  it("Stamp keys off verified or proof_photo_url, never require_photo", () => {
    expect(hasCameraProof(task({ id: "1", title: "P", task_type: "photo", require_photo: true, completed_today: true }))).toBe(
      false
    );
    expect(hasCameraProof(task({ id: "1", title: "P", task_type: "photo", verified: true, completed_today: true }))).toBe(
      true
    );
    expect(
      hasCameraProof(
        task({
          id: "1",
          title: "P",
          task_type: "photo",
          proof_photo_url: "https://cdn/proof.jpg",
          completed_today: true,
        })
      )
    ).toBe(true);
  });

  it("week_secured is Monday first from the same key set", () => {
    expect(weekSecuredFromKeys([TODAY, "2026-09-10"], WEEK)).toEqual([
      false,
      true,
      false,
      true,
      false,
      false,
      false,
    ]);
  });
});

describe("four states to verify", () => {
  it("Day 1 with 0 done: nothing done, no share footer, next names the first task", () => {
    const tasks: ActiveChallengeTask[] = [
      task({ id: "t1", title: "Workout 1", task_type: "timer", duration_minutes: 45, require_photo: true }),
      task({ id: "t2", title: "Read", task_type: "reading", target_value: 10, unit: "pages" }),
    ];
    const line = statusLine({ securedToday: false, done: 0, total: tasks.length });
    expect(line).toEqual({ kind: "progress", text: "Nothing done today. 2 tasks left." });
    const foot = footerAction({ securedToday: false, tasks });
    expect(foot).toEqual({ kind: "next", task: tasks[0] });
    if (foot.kind === "next") {
      expect(taskVerb(foot.task.task_type)).toBe("Start timer");
    }
  });

  it("some done: counts templated, stamp only on completions with camera proof", () => {
    const tasks: ActiveChallengeTask[] = [
      task({
        id: "t1",
        title: "Workout 1",
        task_type: "timer",
        completed_today: true,
        verified: true,
        require_photo: true,
      }),
      task({
        id: "t2",
        title: "Journal",
        task_type: "journal",
        completed_today: true,
        require_photo: false,
      }),
      task({ id: "t3", title: "Drink 1 gallon water", task_type: "water", target_value: 1, unit: "gallon" }),
    ];
    const done = tasks.filter((t) => t.completed_today).length;
    expect(statusLine({ securedToday: false, done, total: tasks.length })).toEqual({
      kind: "progress",
      text: "2 of 3 done. 1 task left.",
    });
    expect(hasCameraProof(tasks[0]!)).toBe(true);
    expect(hasCameraProof(tasks[1]!)).toBe(false);
    const foot = footerAction({ securedToday: false, tasks });
    expect(foot.kind).toBe("next");
    if (foot.kind === "next") {
      expect(foot.task.title).toBe("Drink 1 gallon water");
      expect(taskVerb(foot.task.task_type)).toBe("Log water");
    }
  });

  it("all done and server-secured: Day secured, share footer, today in week_secured", () => {
    const tasks: ActiveChallengeTask[] = [
      task({ id: "t1", title: "A", task_type: "timer", completed_today: true, proof_photo_url: "x" }),
      task({ id: "t2", title: "B", task_type: "journal", completed_today: true }),
    ];
    const securedToday = securedTodayFromKeys([TODAY], TODAY);
    expect(securedToday).toBe(true);
    expect(statusLine({ securedToday, done: 2, total: 2 })).toEqual({
      kind: "secured",
      allDone: "All 2 done.",
    });
    expect(footerAction({ securedToday, tasks })).toEqual({ kind: "share" });
    expect(weekSecuredFromKeys([TODAY], WEEK)[1]).toBe(true);
  });

  it("all done but server not secured: All N done only, today square unfilled, footer stays on last task", () => {
    const tasks: ActiveChallengeTask[] = [
      task({ id: "t1", title: "A", task_type: "timer", completed_today: true }),
      task({ id: "t2", title: "B", task_type: "journal", completed_today: true }),
    ];
    const securedToday = securedTodayFromKeys([], TODAY);
    expect(securedToday).toBe(false);
    expect(statusLine({ securedToday, done: 2, total: 2 })).toEqual({
      kind: "progress",
      text: "All 2 done.",
    });
    const foot = footerAction({ securedToday, tasks });
    expect(foot).toEqual({ kind: "next", task: tasks[1] });
    expect(weekSecuredFromKeys([], WEEK)[1]).toBe(false);
  });
});

describe("gates", () => {
  it("builds size and proof from fields", () => {
    const timer = task({
      id: "t",
      title: "W",
      task_type: "timer",
      duration_minutes: 45,
      require_photo: true,
    });
    expect(pendingGate(timer)).toBe("45 min timer · Photo required");
    expect(doneGate(timer)).toBe("45 min timer");
    const water = task({
      id: "w",
      title: "Water",
      task_type: "water",
      target_value: 1,
      unit: "gallon",
      require_photo: false,
    });
    expect(pendingGate(water)).toBe("1 gallon · Self-reported");
  });

  it("home proof gate is from task_type, never a constant Photo", () => {
    expect(homeProofGate("journal")).toBe("Self-reported");
    expect(homeProofGate("photo")).toBe("Photo");
    expect(homeProofGate("timer", 45)).toBe("Timer 45 min");
  });
});
