import { describe, expect, it } from "vitest";
import { dayIndex, dayLine, inviteUrl } from "@/lib/story-card";
import { challengeInviteShareText } from "@/lib/share-copy";

describe("story card", () => {
  it("counts the day from the enrollment, not the streak", () => {
    expect(dayIndex("2026-10-01", "2026-10-08")).toBe(8);
    expect(dayLine(8, 30)).toBe("Day 8 of 30");
    expect(dayLine(40, 30)).toBe("Day 30 of 30");
  });

  it("builds the invite url from the base that was passed in", () => {
    expect(inviteUrl("https://example.com", "k7Q2mX")).toBe("https://example.com/i/k7Q2mX");
    expect(inviteUrl("https://example.com/", "k7Q2mX")).not.toContain("griit.to");
    expect(challengeInviteShareText("Gym once a day", "griit://i/k7Q2mX")).toBe(
      "Join me on Gym once a day on GRIIT. griit://i/k7Q2mX",
    );
  });
});