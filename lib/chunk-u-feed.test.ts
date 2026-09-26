import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  feedCardEyebrow,
  feedCardMeta,
  feedCardShowsVerified,
  feedCardSubject,
  feedCardVariant,
  inlineCommentsState,
  viewAllComments,
} from "@/lib/feed-card-family";
import {
  boardSlices,
  elapsedWeekLine,
  rankBoard,
  ranksBelowLine,
} from "@/lib/challenge-board";

const base = {
  challengeName: "Iron man",
  taskName: "Run",
  currentDay: 68,
  totalDays: 75,
  isCompleted: false,
  hasProof: false,
};

describe("Chunk U feed card family", () => {
  it("maps the five variants and camera-only stamp", () => {
    expect(feedCardVariant({ ...base, eventType: "task_completed", hasProof: true })).toBe("task_camera");
    expect(feedCardVariant({ ...base, eventType: "task_completed", hasProof: false })).toBe("task_self");
    expect(feedCardVariant({ ...base, eventType: "secured_day" })).toBe("day_secured");
    expect(feedCardVariant({ ...base, eventType: "joined_challenge" })).toBe("challenge_started");
    expect(feedCardVariant({ ...base, eventType: "completed_challenge", isCompleted: true })).toBe("challenge_finished");
    expect(feedCardEyebrow({ ...base, eventType: "secured_day" }, "day_secured")).toBe("Iron man · Day 68 of 75");
    expect(feedCardSubject({ ...base, eventType: "secured_day" }, "day_secured")).toBe("Day secured");
    expect(feedCardSubject({ ...base, eventType: "joined_challenge" }, "challenge_started")).toBe("Started the challenge");
    expect(feedCardSubject({ ...base, eventType: "completed_challenge" }, "challenge_finished")).toBe("Finished the challenge");
    expect(feedCardMeta({ ...base, eventType: "task_completed" }, "task_self")).toBe("Self-reported");
    expect(feedCardMeta({ ...base, eventType: "completed_challenge", securedDays: 62 }, "challenge_finished")).toBe(
      "62 of 75 days secured",
    );
    expect(feedCardShowsVerified("task_camera", true, true)).toBe(true);
    expect(feedCardShowsVerified("task_self", false, false)).toBe(false);
  });

  it("inline comments copy", () => {
    expect(inlineCommentsState(0)).toBe("none");
    expect(inlineCommentsState(2)).toBe("few");
    expect(inlineCommentsState(40)).toBe("more");
    expect(viewAllComments(40)).toBe("View all 40 comments");
  });
});

describe("Chunk U challenge board", () => {
  it("ties share a rank, slices top and around-you, and names lowestShown", () => {
    const ranked = rankBoard(
      [
        { userId: "a", displayName: "Amir", username: "amir", avatarUrl: null, secured: 1 },
        { userId: "b", displayName: "Bina", username: "bina", avatarUrl: null, secured: 1 },
        { userId: "c", displayName: "Cleo", username: "cleo", avatarUrl: null, secured: 0 },
        { userId: "y", displayName: "Yaseen", username: "yaseen", avatarUrl: null, secured: 0 },
      ],
      "y",
    );
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[1]?.rank).toBe(1);
    expect(ranked.find((r) => r.userId === "y")?.rank).toBe(3);
    const slices = boardSlices(ranked, "y");
    expect(slices.split).toBe(true);
    expect(slices.top).toHaveLength(3);
    expect(slices.around.some((r) => r.you)).toBe(true);
    expect(ranksBelowLine(slices.lowestShown)).toContain(String(slices.lowestShown));
    expect(elapsedWeekLine(1)).toBe("One day of the week has ended.");
    expect(elapsedWeekLine(5)).toBe("Five days of the week have ended.");
    expect(elapsedWeekLine(7)).toBe("Seven days of the week have ended.");
  });

  it("LeaderboardTab drops Global and FeedPostV3 uses the card family", () => {
    const board = readFileSync(resolve(__dirname, "../components/activity/LeaderboardTab.tsx"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(board).not.toContain('label="Global"');
    expect(board).toContain("BOARD_RULE");
    expect(board).toContain("secured");
    expect(board).not.toContain("elapsedEnded ?? 1");
    expect(board).toContain('typeof challengeBoard.data?.elapsedEnded === "number"');
    expect(feed).toContain("feedCardVariant");
    expect(feed).toContain("InlineComments");
    expect(feed).toContain("ArrowUpRight");
    expect(home).toContain("weekStripFromDays");
    expect(home).toContain("streakFromDays");
  });
});
