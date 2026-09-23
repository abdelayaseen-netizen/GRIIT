import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { NO_COMMENTS_YET, SEE_THE_DAY, viewAllComments } from "@/lib/feed-card-family";
import { BOARD_RULE, NO_BOARD_YET, elapsedWeekLine } from "@/lib/challenge-board";
import { DAY_GLYPH_LABEL, HELD_DAY_LINE, consistencyHeadlineFromDays } from "@/lib/day-state";

const NEW_COPY = [
  NO_COMMENTS_YET,
  SEE_THE_DAY,
  viewAllComments(40),
  BOARD_RULE,
  NO_BOARD_YET,
  elapsedWeekLine(1),
  HELD_DAY_LINE,
  ...Object.values(DAY_GLYPH_LABEL),
  consistencyHeadlineFromDays([]),
];

describe("Chunk U U5", () => {
  it("new copy has no exclamation marks", () => {
    for (const s of NEW_COPY) {
      expect(s).not.toContain("!");
    }
    const copyFiles = [
      "../lib/feed-card-family.ts",
      "../lib/challenge-board.ts",
      "../components/profile/ProofDaysGrid.tsx",
      "../components/profile/DayViewer.tsx",
      "../components/profile/BadgeRows.tsx",
    ];
    for (const f of copyFiles) {
      const src = readFileSync(resolve(__dirname, f), "utf8");
      const quoted = src.match(/"(?:\\.|[^"\\])*"/g) ?? [];
      const bangs = quoted.filter((s) => s.includes("!"));
      expect(bangs, f).toEqual([]);
    }
  });

  it("a11y labels and the two Part A literals are present; no new token files", () => {
    const day = readFileSync(resolve(__dirname, "../components/profile/ProofDayCard.tsx"), "utf8");
    const badges = readFileSync(resolve(__dirname, "../components/profile/BadgeRows.tsx"), "utf8");
    const grid = readFileSync(resolve(__dirname, "../components/profile/ConsistencyGrid.tsx"), "utf8");
    expect(day).toContain("proofDayA11y");
    expect(day).toContain("includes private");
    expect(day).toContain("rgba(15,15,15,0.8)");
    expect(day).toContain("rgba(15,15,15,0.72)");
    expect(badges).toContain("badgeRowsA11y");
    expect(grid).toContain("monthSummaryLabel");
    expect(grid).toContain("days secured in");
    expect(readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8")).toContain("borderRadius: CARD_R");
    expect(readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8")).toContain("const CARD_R = 14");
  });
});
