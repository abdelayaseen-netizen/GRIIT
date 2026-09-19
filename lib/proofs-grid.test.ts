import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PROOFS_EMPTY_HEADING,
  PROOFS_EMPTY_NEW,
  itemsFromRecordProofs,
  proofsCountLine,
  proofsDateLabel,
  proofsEmptyBody,
  proofsFullBody,
  proofsGatePill,
  proofsSectionHeader,
  proofsSections,
} from "@/lib/proofs-grid";

describe("proofs grid copy", () => {
  it("dates, empty states, and the count line follow frame 60", () => {
    expect(proofsDateLabel("2026-09-17")).toBe("17 September");
    expect(proofsSectionHeader("2026-09-17", 2)).toBe("17 September · 2 proofs");
    expect(PROOFS_EMPTY_HEADING).toBe("No camera proofs yet");
    expect(proofsEmptyBody(0)).toBe(PROOFS_EMPTY_NEW);
    expect(proofsEmptyBody(4)).toBe(
      "Your 4 secured days were all self-reported. A task with the Camera gate puts a photo here.",
    );
    expect(proofsCountLine(9, 4)).toBe(
      "9 camera proofs. 4 more days were secured self-reported and have no photo.",
    );
    expect(proofsCountLine(1, 0)).toBe("1 camera proof.");
  });

  it("sections by date, newest first, challenge on the tile not the day number", () => {
    const items = itemsFromRecordProofs([
      {
        dateKey: "2026-09-16",
        day: 8,
        imageUrl: "https://cdn/a.jpg",
        challengeName: "Daily Gratitude",
        eventId: "e1",
        durationDays: 30,
      },
      {
        dateKey: "2026-09-17",
        day: 2,
        imageUrl: "https://cdn/b.jpg",
        challengeName: "Iron man",
        eventId: "e2",
        durationDays: 75,
        capturedAt: "2026-09-17T12:00:00.000Z",
        gates: ["camera", "time"],
        gateTime: { mode: "by", start: null, end: "07:00" },
        taskName: "Run",
      },
    ]);
    const sections = proofsSections(items);
    expect(sections.map((s) => s.dateKey)).toEqual(["2026-09-17", "2026-09-16"]);
    expect(sections[0]?.label).toBe("17 September · 1 proof");
    expect(proofsGatePill(items[1]!)).toContain("Camera");
    expect(proofsGatePill(items[1]!)).toContain("Taken in the app");
    expect(proofsFullBody(items[1]!)).toContain("Iron man · Day 2 of 75");
    expect(items.map((i) => i.challengeName)).toEqual(["Daily Gratitude", "Iron man"]);
  });
});

describe("proofs grid wiring", () => {
  it("own profile uses the grid and full-view Share flip, not a feed post", () => {
    const profile = readFileSync(resolve(__dirname, "../app/(tabs)/profile.tsx"), "utf8");
    const grid = readFileSync(resolve(__dirname, "../components/profile/ProofsGrid.tsx"), "utf8");
    const full = readFileSync(resolve(__dirname, "../app/proof/[id].tsx"), "utf8");
    expect(profile).toContain("ProofsGrid");
    expect(profile).toContain("ROUTES.PROOF");
    expect(profile).not.toContain("ROUTES.POST_ID");
    expect(profile).not.toContain("title={`Day ${item.day}`}");
    expect(grid).toContain("item.challengeName");
    expect(grid).not.toContain("Day {");
    expect(full).toContain("TRPC.checkins.shareProof");
    expect(full).toContain("aspectRatio: 4 / 5");
    expect(full).not.toContain("Stamp");
  });
});
