import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { feedProofSubject } from "@/lib/feed-card-family";
import { optimisticTaskPost } from "@/lib/optimistic-feed";

describe("optimistic task post", () => {
  it("uses the enrollment day and task, and skips a card with no challenge", () => {
    const post = optimisticTaskPost({
      eventId: "ev-1",
      userId: "u1",
      username: "yaseenabdelaz",
      displayName: "Yaseen Abdelaziz",
      avatarUrl: null,
      challengeName: "Gym once a day",
      taskName: "Workout",
      currentDay: 6,
      totalDays: 7,
      photoUrl: "file://gym.jpg",
    });
    expect(post).not.toBeNull();
    expect(feedProofSubject(post!.currentDay, post!.totalDays, post!.challengeName)).toBe(
      "Gym once a day · Day 6 of 7",
    );
    expect(post!.taskName).toBe("Workout");
    expect(post!.verified).toBe(false);
    expect(
      optimisticTaskPost({
        eventId: "ev-2",
        userId: "u1",
        username: "yaseenabdelaz",
        displayName: "Yaseen Abdelaziz",
        avatarUrl: null,
        challengeName: "",
        taskName: "Workout",
        currentDay: 1,
        totalDays: 1,
      }),
    ).toBeNull();
  });

  it("does not publish a Day 1 of 1 placeholder from the share toast", () => {
    const layout = readFileSync(resolve(__dirname, "../app/(tabs)/_layout.tsx"), "utf8");
    expect(layout).toContain("optimisticTaskPost");
    expect(layout).not.toContain("currentDay: 1");
    expect(layout).not.toContain('challengeName: ""');
  });
});
