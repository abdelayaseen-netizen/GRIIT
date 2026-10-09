import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { completedTaskIds, enrollmentTasksDone } from "@/lib/today-completion";
import { statusLine } from "@/lib/active-challenge-ui";

const rows = [
  { active_challenge_id: "gym", task_id: "workout", status: "completed" },
  { active_challenge_id: "read", task_id: "pages", status: "pending" },
];

describe("completedTaskIds", () => {
  it("Home and challenge detail see the same done set", () => {
    const home = completedTaskIds(rows, "gym");
    const detail = completedTaskIds(rows, "gym");
    expect([...home]).toEqual([...detail]);
    expect(enrollmentTasksDone(["workout"], home).allDone).toBe(true);
    const open = statusLine({ securedToday: false, done: 0, total: 1 });
    expect(open.kind).toBe("progress");
    if (open.kind === "progress") {
      expect(open.text).toBe("Nothing done today. 1 task left.");
    }
  });

  it("ignores another enrollment and a pending row", () => {
    expect(completedTaskIds(rows, "read").size).toBe(0);
    expect(completedTaskIds(rows).has("workout")).toBe(true);
  });
});

describe("challenge detail uses the home check-in list", () => {
  it("reads todayCheckinsForUser and refreshes the detail query after a save", () => {
    const screen = readFileSync(
      resolve(__dirname, "../app/challenge/active/[activeChallengeId].tsx"),
      "utf8",
    );
    const save = readFileSync(resolve(__dirname, "../hooks/useAppChallengeMutations.ts"), "utf8");
    expect(screen).toContain("completedTaskIds");
    expect(screen).toContain("todayCheckinsForUser");
    expect(save).toContain("TODAY_CHECKINS_QUERY_KEY");
  });
});
