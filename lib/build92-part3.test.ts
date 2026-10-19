/**
 * Build 92 chunk 10 (Part 3, P3-10 to P3-25): Discover cards, the joined challenge page, Home when
 * today is done, the feed's started lines and the four words.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import {
  DISCOVER_JOINED,
  doesLine,
  peopleLabel,
  featuredHasRunAndGym,
} from "@/lib/discover-card";
import {
  DOT_KEY,
  DOT_KEY_COPY,
  POSTS_HERE_SHEET,
  joinedPrimary,
  topNumbers,
  visibilityRow,
  weekDotsFromProgress,
} from "@/lib/challenge-state";
import { FEED_CAPTION, FEED_EMPTY, foldStartedLines, startedLine } from "@/lib/feed-fold";
import { HOME_DONE, homeSaveError } from "@/lib/home-done";
import { WORDS, WORDS_SHEET_TITLE, FREEZE_EARNED, FREEZE_HELD, SELF_REPORTED_FIRST } from "@/lib/words";
import { conceptLine, type ConceptKind } from "@/lib/concept-once";
import { conceptSeenKey, parseConceptSeen } from "@/lib/concept-seen";
import { FEATURED_BUILTINS } from "@/lib/featured-catalog";
import { taskProofKind } from "@/lib/discover-preview-tasks";

const src = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("10.1 Discover cards", () => {
  it("say what you do and how it is proven", () => {
    expect(doesLine({ title: "Run 3 mi", task_type: "run", config: { require_strava: true } })).toBe("Run 3 mi · Strava");
    expect(doesLine({ title: "Get to the gym", task_type: "check_off", require_photo: true })).toBe("Get to the gym · photo");
    expect(
      doesLine({ title: "Pray Fajr", task_type: "check_off", require_photo: true, gate_time_mode: "between", gate_time_start: "05:00", gate_time_end: "06:30" }),
    ).toBe("Pray Fajr · camera, 5:00–6:30 am");
    expect(doesLine({ title: "Walk 7,000 steps", task_type: "check_off" })).toBe("Walk 7,000 steps · self-reported");
    expect(doesLine({ title: "Read 20 minutes", task_type: "timer" })).toBe("Read 20 minutes · timer");
    expect(doesLine({ title: "Read 10 pages", task_type: "counter" })).toBe("Read 10 pages · counter");
    expect(doesLine({ title: "Pray Fajr", task_type: "check_off", gate_time_mode: "by", gate_time_start: "07:00" })).toBe(
      "Pray Fajr · self-reported, by 7:00 am",
    );
  });

  it("use the same proof rule as the gates (photo_mode wins over legacy flags)", () => {
    expect(taskProofKind({ task_type: "check_off", config: { require_photo_proof: true } })).toBe("camera");
    expect(taskProofKind({ task_type: "check_off", require_photo: true, config: { photo_mode: "none" } })).toBe("self");
    expect(taskProofKind({ task_type: "run", config: { require_strava: true } })).toBe("strava");
    expect(doesLine({ title: "Drink water and post a photo", proof: "camera" })).toBe("Drink water and post a photo · photo");
  });

  it("never say only Camera or Self-reported", () => {
    for (const line of [
      doesLine({ title: "Get to the gym", require_photo: true }),
      doesLine({ title: "Make your bed" }),
    ]) {
      expect(line).not.toMatch(/^(Camera|Self-reported)$/);
    }
  });

  it("under 5 people is New, 5 or more is the count", () => {
    expect(peopleLabel(0)).toBe("New");
    expect(peopleLabel(4)).toBe("New");
    expect(peopleLabel(5)).toBe("5 people");
    expect(peopleLabel(1240)).toBe("1,240 people");
  });

  it("Featured includes a run and a gym challenge", () => {
    expect(featuredHasRunAndGym(FEATURED_BUILTINS)).toBe(true);
    expect(FEATURED_BUILTINS.some((b) => b.taskType === "run")).toBe(true);
  });

  it("joined cards say Joined and open the challenge page", () => {
    expect(DISCOVER_JOINED).toBe("Joined");
    const card = src("components/discover/ChallengeCard.tsx");
    expect(card).toContain("DISCOVER_JOINED");
    const discover = src("components/discover/DiscoverV3.tsx");
    expect(discover).toMatch(/joinedIds\?\.has\(item\.id\)[\s\S]{0,200}onOpenChallenge\(item\.id\)/);
  });

  it("covers use the motif system (no gradient, no photo)", () => {
    const cover = src("components/ds/Cover.tsx");
    expect(cover).not.toContain("LinearGradient");
    expect(cover).toContain("CATEGORY_MOTIF");
  });
});

describe("10.2 challenge page after joining", () => {
  it("top numbers are exactly Day n of N and n days secured", () => {
    expect(topNumbers({ day: 5, total: 14, secured: 2 })).toEqual({ day: "Day 5 of 14", secured: "2 days secured" });
    expect(topNumbers({ day: 1, total: 7, secured: 1 }).secured).toBe("1 day secured");
    expect(topNumbers({ day: 1, total: 7, secured: 0 }).secured).toBe("0 days secured");
  });

  it("dots come from the same day records; held days are a freeze, not secured", () => {
    const week = ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"];
    const days = [
      { date_key: "2026-10-14", state: "secured" },
      { date_key: "2026-10-15", state: "held" },
      { date_key: "2026-10-16", state: "missed" },
      { date_key: "2026-10-17", state: "secured" },
      { date_key: "2026-10-18", state: "today" },
    ];
    // An open today is "missed" + todayIndex, which WeekStrip draws as the outlined today ring.
    expect(weekDotsFromProgress(days, week, false)).toEqual(["before", "before", "secured", "frozen", "missed", "secured", "missed"]);
    expect(weekDotsFromProgress(days, week, true)[6]).toBe("secured");
    const secured = weekDotsFromProgress(days, week, false).filter((s) => s === "secured").length;
    expect(secured).toBe(2);
  });

  it("the dot key and the posts-here sheet use the copy table", () => {
    expect(DOT_KEY).toEqual({ secured: "Secured", today: "Today", freeze: "Held by a freeze", missed: "Missed", before: "Before you joined" });
    expect(DOT_KEY_COPY).toEqual({ title: "What the dots mean", done: "Got it" });
    expect(visibilityRow("friends")).toBe("Your posts here: Friends");
    expect(visibilityRow("only_me")).toBe("Your posts here: Only me");
    expect(POSTS_HERE_SHEET.title("Show Up 7")).toBe("Your posts in Show Up 7");
    expect(POSTS_HERE_SHEET.body).toBe("The default for new posts in this challenge. You can still change it on each post.");
  });

  it("the primary is Start today's task, or Today's task is done (disabled)", () => {
    expect(joinedPrimary(false)).toEqual({ label: "Start today’s task", disabled: false });
    expect(joinedPrimary(true)).toEqual({ label: "Today’s task is done", disabled: true });
  });

  it("never shows Join after joining or says You're already in this challenge", () => {
    const page = src("app/challenge/[id].tsx");
    expect(page).not.toMatch(/already in this challenge/i);
    expect(page).toContain("membershipKnown");
    const active = src("components/challenge/ActiveChallengeV3.tsx");
    expect(active).not.toContain("PEOPLE_SOLO");
    expect(active).toContain("joinedPrimary(");
  });
});

describe("10.3 Home when today is secured", () => {
  it("copy", () => {
    expect(HOME_DONE.line).toBe("Today is secured. See you tomorrow.");
    expect(HOME_DONE.fold(4)).toBe("4 done");
    expect(HOME_DONE.show).toBe("Show");
  });

  it("errors give the real reason; Try again only when a retry can work", () => {
    expect(homeSaveError("Window closed.", "6:30 am")).toEqual({
      message: "This task’s window closed at 6:30 am. It opens tomorrow.",
      retry: false,
    });
    expect(homeSaveError("Network request failed")).toEqual({ message: "Couldn’t save. No connection. Try again", retry: true });
    expect(homeSaveError("")).toEqual({ message: "Couldn't save. Tap to try again.", retry: true });
  });

  it("one secured flag drives the card and the Today block (no Finish the task once secured)", () => {
    const home = src("app/(tabs)/index.tsx");
    expect(home).toContain("const securedNow = todaySecured || proofAllDone;");
    expect(home).toMatch(/firstDayLine=\{\s*!securedNow/);
    expect(home).toMatch(/startLabel=\{\s*!securedNow/);
  });
});

function proof(id: string, at = "2026-10-18T15:00:00Z"): LiveFeedPost {
  return {
    id,
    userId: `u-${id}`,
    username: id,
    displayName: id,
    avatarUrl: null,
    streakCount: 1,
    challengeId: "c1",
    challengeName: "Show Up 7",
    currentDay: 1,
    totalDays: 7,
    eventType: "task_completed",
    isCompleted: true,
    hasProof: true,
    photoUrl: null,
    verified: false,
    createdAt: at,
  } as LiveFeedPost;
}

function started(id: string, name: string, at = "2026-10-18T14:00:00Z", challenge = "c2"): LiveFeedPost {
  return {
    ...proof(id, at),
    userId: `u-${id}`,
    displayName: name,
    username: name.toLowerCase(),
    challengeId: challenge,
    challengeName: "Quran Daily",
    eventType: "joined_challenge",
    isCompleted: false,
    hasProof: false,
  } as LiveFeedPost;
}

const TODAY = { todayKey: "2026-10-18", timeZone: "UTC" };
const kinds = (rows: ReturnType<typeof foldStartedLines>) => rows.map((r) => ("kind" in r && r.kind === "startedDay" ? "S" : "P"));

describe("10.4 feed: proofs lead, started lines fold", () => {
  it("fixture 1: only started events gives the empty state, never a feed of started lines", () => {
    expect(foldStartedLines([started("a", "Bilal"), started("b", "Zayd")], TODAY)).toEqual([]);
  });

  it("fixture 2: started at the top moves to one line after the first proof", () => {
    const rows = foldStartedLines([started("a", "Bilal"), started("b", "Zayd"), proof("p1"), proof("p2")], TODAY);
    expect(kinds(rows)).toEqual(["P", "S", "P"]);
    const group = rows[1] as Extract<(typeof rows)[number], { kind: "startedDay" }>;
    expect(startedLine(group)).toBe("Bilal and Zayd started challenges today");
  });

  it("fixture 3: one line per day; never two in a row; at most one per 5 posts", () => {
    const input = [
      proof("p1"),
      started("a", "Bilal"),
      started("b", "Zayd", "2026-10-18T13:00:00Z", "c3"),
      proof("p2"),
      started("c", "Omar"),
      proof("p3"),
      proof("p4"),
      started("d", "Musa"),
      proof("p5"),
      proof("p6"),
    ];
    const rows = foldStartedLines(input, TODAY);
    expect(kinds(rows).filter((k) => k === "S")).toHaveLength(1);
    expect(kinds(rows)[0]).toBe("P");
    expect(kinds(rows).join("")).not.toContain("SS");
    const group = rows.find((r) => "kind" in r && r.kind === "startedDay") as Extract<(typeof rows)[number], { kind: "startedDay" }>;
    expect(startedLine(group)).toBe("Bilal, Zayd and 2 others started challenges today");
  });

  it("fixture 4: started events from another day are not folded into today's line", () => {
    const rows = foldStartedLines(
      [proof("p1"), started("a", "Bilal", "2026-10-17T10:00:00Z"), proof("p2", "2026-10-17T09:00:00Z")],
      TODAY,
    );
    expect(kinds(rows)).toEqual(["P", "P"]);
  });

  it("names unknown: {n} people started challenges today", () => {
    expect(startedLine({ names: [], others: 0, count: 3 })).toBe("3 people started challenges today");
  });

  it("captions match the tab, and the empty state offers Discover and Invite", () => {
    expect(FEED_CAPTION.following(12)).toBe("Proofs from the 12 people you follow.");
    expect(FEED_CAPTION.everyone).toBe("Proofs from everyone on GRIIT, newest first.");
    expect(FEED_EMPTY).toEqual({
      following: "No proofs from people you follow yet.",
      everyone: "No proofs yet today.",
      body: "Find a challenge, or invite a friend to start one with you.",
      discover: "Discover",
      invite: "Invite",
    });
  });

  it("started lines have no like or comment", () => {
    const feed = src("components/LiveFeedSection.tsx");
    expect(feed).toContain("foldStartedLines(");
    expect(feed).toMatch(/isStartedDay\(item\)[\s\S]{0,400}StartedDayRow/);
  });
});

describe("10.5 words", () => {
  it("one definition each, word for word", () => {
    expect(WORDS).toEqual({
      Secured: "Every task today is done, so the day counts toward your streak.",
      Freeze: "Covers one missed day so your streak doesn’t break. You earn one every 7 days in a row.",
      "Self-reported": "You marked it done yourself, with no photo or app proof.",
      Verified: "Proven by the camera or Strava.",
    });
    expect(WORDS_SHEET_TITLE).toBe("What these words mean");
    expect(FREEZE_EARNED.title).toBe("You earned a freeze.");
    expect(FREEZE_EARNED.count(1, 2, 4)).toBe("You have 1. Hold up to 2 (4 with Pro).");
    expect(FREEZE_HELD(12)).toBe("A freeze covered yesterday. Your 12-day streak is safe.");
    expect(SELF_REPORTED_FIRST).toBe("Self-reported: you marked it done yourself, with no photo or app proof.");
  });

  it("each definition shows once per user", () => {
    const seen = new Set<ConceptKind>();
    const kinds: ConceptKind[] = ["secured", "freeze", "self", "verified"];
    for (const k of kinds) {
      expect(conceptLine(k, seen)).not.toBeNull();
      seen.add(k);
      expect(conceptLine(k, seen)).toBeNull();
    }
    expect(conceptSeenKey("user-a")).not.toBe(conceptSeenKey("user-b"));
    expect(parseConceptSeen(JSON.stringify(["self"])).has("self")).toBe(true);
  });

  it("Home reads the per-user seen set, not the old device-wide key", () => {
    const home = src("app/(tabs)/index.tsx");
    expect(home).not.toContain('"griit.concept.seen"');
    expect(home).toContain("readConceptSeen(");
  });

  it("the freeze line is said once on Start here (not per card)", () => {
    const screen = src("components/onboarding/v2/screens/FirstChallengeScreen.tsx");
    expect(screen.match(/FREEZE_LINE/g)?.length).toBe(2);
  });
});
