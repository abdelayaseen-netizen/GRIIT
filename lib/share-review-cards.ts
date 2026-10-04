/**
 * The 7 styles × 3 colours, for the dev Photos export.
 */
import { SHARE_COLOURS, type GridCell, type ShareCardInput, type ShareColourId, type ShareStyleId } from "@/lib/share-image";

const CODE = "challenge-id";

function grid30(): GridCell[] {
  return Array.from({ length: 30 }, (_, i) => {
    if (i === 17) return "today";
    if (i < 12) return "secured";
    if (i < 17) return "missed";
    return "future";
  });
}

function grid7(): GridCell[] {
  return Array.from({ length: 7 }, (_, i) => (i < 6 ? "secured" : "today"));
}

export function shareReviewCard(style: ShareStyleId, colour: ShareColourId): ShareCardInput {
  if (style === "A" || style === "B") {
    return {
      style,
      colour,
      challenge: "Show Up 7",
      task: "Go to the gym",
      day: 3,
      durationDays: 7,
      username: "noahb",
      inviteCode: CODE,
      streak: 3,
      cameraSeal: style === "A",
    };
  }
  if (style === "C") {
    return {
      style,
      colour,
      challenge: "10 Pages a Day",
      task: "Read 10 pages",
      day: 3,
      durationDays: 14,
      username: "noahb",
      inviteCode: CODE,
    };
  }
  if (style === "D") {
    return {
      style,
      colour,
      challenge: "Iron man",
      day: 18,
      durationDays: 30,
      secured: 12,
      username: "yaseen",
      inviteCode: CODE,
      cells: grid30(),
    };
  }
  if (style === "E") {
    return {
      style,
      colour,
      challenge: "Iron man",
      streak: 7,
      username: "yaseen",
      inviteCode: CODE,
      activeLine: "Iron man · Daily Gratitude",
      dateLabel: "Saturday 3 October",
    };
  }
  if (style === "F") {
    return {
      style,
      colour,
      challenge: "Quick Steps",
      durationDays: 7,
      secured: 6,
      longestStreak: 5,
      username: "yaseen",
      inviteCode: CODE,
      dateRange: "Sep 26–Oct 2",
      cells: grid7(),
    };
  }
  return {
    style,
    colour,
    challenge: "Show Up 7",
    durationDays: 7,
    username: "noahb",
    inviteCode: CODE,
    proofLine: "7 days · Camera · Gym",
    tasks: [{ title: "Go to the gym", rule: "Camera · At your gym" }],
    membersLine: "Amir, Sami and Noah are in it",
  };
}

const STYLES: ShareStyleId[] = ["A", "B", "C", "D", "E", "F", "G"];

export function shareReviewCards(): ShareCardInput[] {
  return STYLES.flatMap((style) => SHARE_COLOURS.map((colour) => shareReviewCard(style, colour)));
}
