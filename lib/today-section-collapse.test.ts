import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  TODAY_SECTION_COLLAPSE_PREFIX,
  filterTodaySectionCollapseKeys,
  parseTodaySectionChoice,
  serializeTodaySectionChoice,
  todaySectionCollapseKey,
  todaySectionDefaultExpanded,
  todaySectionExpanded,
} from "./today-section-collapse";

describe("todaySection default by completion", () => {
  it("expands while tasks are open and collapses once n/n", () => {
    expect(todaySectionDefaultExpanded(0, 3)).toBe(true);
    expect(todaySectionDefaultExpanded(2, 3)).toBe(true);
    expect(todaySectionDefaultExpanded(3, 3)).toBe(false);
    expect(todaySectionDefaultExpanded(0, 0)).toBe(false);
  });
});

describe("todaySection manual choice wins", () => {
  it("stored expanded stays open on n/n; stored collapsed stays shut with open tasks", () => {
    expect(todaySectionExpanded(true, 3, 3)).toBe(true);
    expect(todaySectionExpanded(false, 0, 3)).toBe(false);
    expect(todaySectionExpanded(null, 1, 3)).toBe(true);
    expect(todaySectionExpanded(undefined, 3, 3)).toBe(false);
  });
});

describe("todaySection persist key", () => {
  it("is per user + challenge + date, so remount same day hits the same key and next day resets", () => {
    const a = todaySectionCollapseKey("user-a", "ac-iron", "2026-09-19");
    const remount = todaySectionCollapseKey("user-a", "ac-iron", "2026-09-19");
    const nextDay = todaySectionCollapseKey("user-a", "ac-iron", "2026-09-20");
    const otherUser = todaySectionCollapseKey("user-b", "ac-iron", "2026-09-19");
    expect(a).toBe(`${TODAY_SECTION_COLLAPSE_PREFIX}:user-a:ac-iron:2026-09-19`);
    expect(remount).toBe(a);
    expect(nextDay).not.toBe(a);
    expect(otherUser).not.toBe(a);
    expect(parseTodaySectionChoice(serializeTodaySectionChoice(false))).toBe(false);
    expect(parseTodaySectionChoice(serializeTodaySectionChoice(true))).toBe(true);
    expect(parseTodaySectionChoice(null)).toBeNull();
    expect(todaySectionExpanded(parseTodaySectionChoice(null), 3, 3)).toBe(false);
  });

  it("sign-out filter is per-user and leaves the other user's key", () => {
    const keys = [
      todaySectionCollapseKey("user-a", "ac-iron", "2026-09-19"),
      todaySectionCollapseKey("user-b", "ac-iron", "2026-09-19"),
      "miss_ack_date_key:user-a",
    ];
    expect(filterTodaySectionCollapseKeys(keys, "user-a")).toEqual([
      todaySectionCollapseKey("user-a", "ac-iron", "2026-09-19"),
    ]);
    expect(filterTodaySectionCollapseKeys(keys, "user-b")).toEqual([
      todaySectionCollapseKey("user-b", "ac-iron", "2026-09-19"),
    ]);
  });
});

describe("todaySection Home + cleanup wiring", () => {
  it("Home persists the choice and Feed/Home share ROUTES.CHALLENGE_ID", () => {
    const home = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    const homeV3 = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../components/feed/FeedCardHeader.tsx"), "utf8");
    const cleanup = readFileSync(resolve(__dirname, "./signout-cleanup.ts"), "utf8");
    expect(home).toContain("todaySectionCollapseKey(user.id,");
    expect(home).toContain("serializeTodaySectionChoice(");
    expect(home).toContain("ROUTES.CHALLENGE_ID(");
    expect(homeV3).toContain("ChevronDown");
    expect(homeV3).toContain("ChevronUp");
    expect(homeV3).toContain("onPressChallenge");
    expect(feed).toContain("router.push(ROUTES.CHALLENGE_ID(challengeId)");
    expect(cleanup).toContain("filterTodaySectionCollapseKeys");
    expect(cleanup).toContain("AsyncStorage.getAllKeys()");
  });
});
