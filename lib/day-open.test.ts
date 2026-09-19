import { describe, expect, it } from "vitest";
import {
  DAY_OPEN_ALSO,
  DAY_OPEN_DONE,
  DAY_OPEN_NEXT,
  dayOpenAlsoLine,
  dayOpenContext,
  dayOpenLeftLine,
  dayOpenTitle,
  selectDayOpen,
  serverSecuredToday,
} from "@/lib/day-open";
import type { HomeProofTask } from "@/lib/home-proof-card";

function task(partial: Partial<HomeProofTask> & Pick<HomeProofTask, "name" | "challengeName">): HomeProofTask {
  return {
    currentDay: 1,
    durationDays: 14,
    done: false,
    challengeSecuredToday: false,
    taskType: "check_off",
    ...partial,
  };
}

describe("day-open copy", () => {
  it("uses the frame 48 table", () => {
    expect(dayOpenTitle("Journal")).toBe("Journal done.");
    expect(dayOpenLeftLine(5)).toBe("5 left to secure today.");
    expect(dayOpenLeftLine(1)).toBe("1 left to secure today.");
    expect(dayOpenLeftLine(0)).toBe("0 left to secure today.");
    expect(dayOpenContext("Iron man", 3, 14)).toBe("Iron man · Day 3 of 14");
    expect(dayOpenAlsoLine("Daily Gratitude", 1)).toBe("Daily Gratitude · 1 left");
    expect(DAY_OPEN_ALSO).toBe("Also today");
    expect(DAY_OPEN_NEXT).toBe("Next task");
    expect(DAY_OPEN_DONE).toBe("Done");
  });
});

describe("serverSecuredToday", () => {
  it("reads the server flags and never a row tally", () => {
    expect(serverSecuredToday({ dayAlreadySecured: false, secureDaySecured: false })).toBe(false);
    expect(serverSecuredToday({ dayAlreadySecured: true, secureDaySecured: false })).toBe(true);
    expect(serverSecuredToday({ dayAlreadySecured: false, secureDaySecured: true })).toBe(true);
  });
});

describe("selectDayOpen", () => {
  it("5 of 6 done → frame 48 with 1 left and the remaining row", () => {
    const tasks: HomeProofTask[] = [
      task({ id: "1", name: "Shower", challengeName: "Morning", activeChallengeId: "ac", done: true }),
      task({ id: "2", name: "Make bed", challengeName: "Morning", activeChallengeId: "ac", done: true }),
      task({ id: "3", name: "Run", challengeName: "Morning", activeChallengeId: "ac", done: true }),
      task({ id: "4", name: "Journal", challengeName: "Morning", activeChallengeId: "ac", done: true }),
      task({ id: "5", name: "Read", challengeName: "Morning", activeChallengeId: "ac", done: true }),
      task({ id: "6", name: "Water", challengeName: "Morning", activeChallengeId: "ac", done: false }),
    ];
    const model = selectDayOpen({ taskName: "Read", challengeId: "ac", tasks });
    expect(model.title).toBe("Read done.");
    expect(model.leftLine).toBe("1 left to secure today.");
    expect(model.contextLine).toBe("Morning · Day 1 of 14");
    expect(model.rows.map((r) => r.name)).toEqual(["Water"]);
    expect(model.alsoToday).toEqual([]);
    expect(model.nextId).toBe("6");
    expect(model.remainingToday).toBe(1);
    expect(model.challengeDoneToday).toBe(false);
    expect(model.challengeName).toBe("Morning");
    expect(model).not.toHaveProperty("streak");
  });

  it("6 of 6 but the server has not secured → frame 48 with 0 left and no remaining rows", () => {
    const tasks: HomeProofTask[] = [1, 2, 3, 4, 5, 6].map((n) =>
      task({
        id: String(n),
        name: `Task ${n}`,
        challengeName: "Morning",
        activeChallengeId: "ac",
        done: true,
      }),
    );
    const model = selectDayOpen({ taskName: "Task 6", challengeId: "ac", tasks });
    expect(model.title).toBe("Task 6 done.");
    expect(model.leftLine).toBe("0 left to secure today.");
    expect(model.rows).toEqual([]);
    expect(model.alsoToday).toEqual([]);
    expect(model.nextId).toBeNull();
    expect(model).not.toHaveProperty("streak");
  });

  it("Also today lists other challenges that still have remaining work", () => {
    const tasks: HomeProofTask[] = [
      task({ id: "i1", name: "Workout", challengeName: "Iron man", activeChallengeId: "iron", done: true }),
      task({ id: "i2", name: "Read ten pages", challengeName: "Iron man", activeChallengeId: "iron", done: false }),
      task({
        id: "g1",
        name: "Write 3 gratitudes",
        challengeName: "Daily Gratitude",
        activeChallengeId: "grat",
        done: false,
        durationDays: 30,
      }),
    ];
    const model = selectDayOpen({ taskName: "Workout", challengeId: "iron", tasks });
    expect(model.leftLine).toBe("2 left to secure today.");
    expect(model.remainingToday).toBe(2);
    expect(model.challengeDoneToday).toBe(false);
    expect(model.rows.map((r) => r.name)).toEqual(["Read ten pages"]);
    expect(model.alsoToday).toEqual([
      { id: "grat", line: "Daily Gratitude · 1 left", nextId: "g1" },
    ]);
    expect(model.nextId).toBe("i2");
  });
});
