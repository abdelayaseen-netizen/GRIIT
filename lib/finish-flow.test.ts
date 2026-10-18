import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AUDIENCE_COPY,
  FINISH_COPY,
  POST_SHEET_AUDIENCES,
  audienceLine,
  finishDates,
  freezesUsedLabel,
  inARow,
  isOfflineError,
  markTeachingSeen,
  otherOpenLine,
  postButton,
  postSheetSubtitle,
  remainingAfter,
  remainingToast,
  routeAfterFinish,
  teachingShows,
  verifyLabel,
} from "./finish-flow";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("02.1 the post sheet asks once", () => {
  it("Friends first and default, the button names the choice", () => {
    expect(POST_SHEET_AUDIENCES).toEqual(["friends", "everyone", "only_me"]);
    expect(AUDIENCE_COPY.friends.button).toBe("Post to friends");
    expect(AUDIENCE_COPY.everyone.button).toBe("Post to everyone");
    expect(AUDIENCE_COPY.only_me.button).toBe("Save privately");
    expect(postButton({ audience: "friends", busy: false, error: false })).toBe("Post to friends");
    expect(postButton({ audience: "friends", busy: true, error: false })).toBe("Posting");
    expect(postButton({ audience: "everyone", busy: false, error: true })).toBe("Try again");
    expect(audienceLine("friends", 4)).toBe("Your 4 friends see it in their feed.");
    expect(audienceLine("friends", 0)).toBe("Your friends see it in their feed.");
    expect(audienceLine("only_me")).toBe("Only you can see it. It still counts for today.");
    expect(postSheetSubtitle("Morning run", "Run every day", 3, 30)).toBe("Morning run · Run every day · Day 3 of 30");
    expect(FINISH_COPY.closedPrivate).toBe("Saved privately.");
    expect(FINISH_COPY.offline).toBe(
      "No connection. Your task is saved and counts. Post again when you're back online.",
    );
    for (const s of Object.values(FINISH_COPY)) if (typeof s === "string") expect(s).not.toContain("!");
  });

  it("the photo review no longer asks the audience; the sheet does, and closing saves privately", () => {
    const review = read("components/task-v2/steps/ReviewStep.tsx");
    expect(review).not.toContain("POST_AUDIENCES");
    expect(review).not.toContain("audienceChip");
    const sheet = read("components/task-v2/steps/PostChoiceSheet.tsx");
    expect(sheet).toContain("POST_SHEET_AUDIENCES");
    expect(sheet).toContain("FINISH_COPY.postTitle");
    expect(sheet).toContain('testID="post-choice-post"');
    expect(sheet).toContain('closeTestID="post-choice-close"');
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    expect(hook).toContain("FINISH_COPY.closedPrivate");
    expect(hook).toContain("isOfflineError(");
  });

  it("offline reads as a network failure", () => {
    expect(isOfflineError("Network request failed")).toBe(true);
    expect(isOfflineError("TypeError: Failed to fetch")).toBe(true);
    expect(isOfflineError("Couldn't save")).toBe(false);
    expect(isOfflineError(null)).toBe(false);
  });
});

describe("02.2 where it goes next", () => {
  it("challenge complete beats day secured, then the Home toast", () => {
    expect(routeAfterFinish({ challengeFinished: true, daySecuredNow: true, remainingToday: 0 }, "Run")).toEqual({
      to: "ChallengeComplete",
      otherChallengesOpen: false,
    });
    expect(routeAfterFinish({ challengeFinished: true, daySecuredNow: false, remainingToday: 1 }, "Run")).toEqual({
      to: "ChallengeComplete",
      otherChallengesOpen: true,
    });
    expect(routeAfterFinish({ challengeFinished: false, daySecuredNow: true, remainingToday: 0 }, "Run")).toEqual({
      to: "DaySecured",
    });
    expect(
      routeAfterFinish({ challengeFinished: false, daySecuredNow: false, remainingToday: 2, nextTaskId: "t2" }, "Morning run"),
    ).toEqual({ to: "Home", toast: "Morning run done. 2 left today.", highlightTaskId: "t2" });
    expect(remainingToast("Read", 0)).toBe("Read done. 0 left today.");
    expect(remainingAfter(["a", "b", "c"], "b")).toBe(2);
    expect(remainingAfter(["a"], "a")).toBe(0);
    expect(otherOpenLine("7K Steps")).toBe("Today isn't secured yet. 7K Steps still needs today.");
  });

  it("the Proof screen is never a destination in the finish flow", () => {
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    expect(hook).not.toContain("ROUTES.POST_ID(");
    expect(hook).toContain("routeAfterFinish(");
    const secured = read("app/task/secured.tsx");
    expect(secured).not.toContain("ROUTES.POST_ID(");
    expect(secured).not.toContain("openPost");
  });

  it("the toast names the task and the count; Home marks the next task", () => {
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    expect(hook).toContain("remainingAfter(");
    expect(hook).not.toContain("taskDoneTitle(");
    const home = read("components/home/HomeV3.tsx");
    expect(home).toContain("FINISH_COPY.next");
    expect(home).toContain('testID="home-task-next"');
  });
});

describe("02.3 Day secured", () => {
  it("no scroll view, the Part 1 order, and Done / Back / swipe all go Home", () => {
    const screen = read("components/task-v2/SecuredDayScreen.tsx");
    expect(screen).not.toContain("<ScrollView");
    expect(screen).not.toContain("ScrollView,");
    expect(screen).toContain("FINISH_COPY.secured");
    expect(screen).toContain("FINISH_COPY.securedFirst");
    expect(screen).toContain("<WeekStrip");
    expect(screen).toContain("<FloatingActionBar");
    expect(screen).toContain("PanResponder");
    expect(screen).toContain('accessibilityLabel="Go back"');
    expect(screen).not.toContain("InviteLinkRow");
    expect(screen).not.toContain("SECURED_PHOTO_H");
    const order = ["styles.streak", "FINISH_COPY.secured}", "<WeekStrip", "styles.tasks", "<FloatingActionBar"];
    const idx = order.map((s) => screen.indexOf(s));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it("verification labels per task", () => {
    expect(verifyLabel({ verifiedBy: "strava" })).toBe("Verified by Strava");
    expect(verifyLabel({ hasCameraProof: true })).toBe("Verified");
    expect(verifyLabel({})).toBe("Self-reported");
    expect(inARow(1)).toBe("day in a row");
    expect(inARow(3)).toBe("days in a row");
  });

  it("the teaching line shows once per user", () => {
    expect(teachingShows(null, "u1")).toBe(true);
    const after = markTeachingSeen(null, "u1");
    expect(teachingShows(after, "u1")).toBe(false);
    expect(teachingShows(after, "u2")).toBe(true);
    expect(teachingShows(markTeachingSeen(after, "u2"), "u2")).toBe(false);
    expect(teachingShows("not json", "u1")).toBe(true);
    expect(teachingShows(after, "")).toBe(false);
    const secured = read("app/task/secured.tsx");
    expect(secured).toContain("teachingShows(");
    expect(secured).toContain("markTeachingSeen(");
  });
});

describe("02.4 Challenge complete", () => {
  it("freeze wording, dates, and the other-challenges line", () => {
    expect(freezesUsedLabel(1)).toBe("Freeze used");
    expect(freezesUsedLabel(2)).toBe("Freezes used");
    expect(finishDates("2026-10-01T07:00:00.000Z", 30)).toMatch(/^Oct 1 – Oct 30$/);
    expect(finishDates(null, 30)).toBeNull();
    const complete = read("app/challenge/complete.tsx");
    expect(complete).toContain("otherOpenLine(");
    const moment = read("components/task-v2/MomentScreenV3.tsx");
    expect(moment).toContain("freezesUsedLabel(");
    expect(moment).toContain("otherOpen");
  });
});

describe("02.5 the Proof screen asks nothing", () => {
  it("no inline Who sees this control on the post", () => {
    const proof = read("app/post/[id]/index.tsx");
    expect(proof).not.toContain("<SegmentedControl");
    expect(proof).not.toContain("POST_DETAIL_AUDIENCE_LABEL");
  });
});
