import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  audienceShowsInScopeForViewer,
  createsActivityPost,
} from "@/lib/post-audience";
import { shareCardFromToast } from "@/lib/task-complete-toast";
import { buildSharePaint, copyStickerAvailable, paintStrings, storyUsesSticker, stylesForMoment } from "@/lib/share-image";
import { selfReportedCardMeta } from "@/lib/feed-card-family";
import { POST_DETAIL_DONE, POST_DETAIL_SHARE_OUTSIDE, postDetailAudience } from "@/lib/post-detail";
import { CAPTURE_PROOF_REQUIRED, captureHeaderLine } from "@/lib/proof-capture";
import {
  POST_CHOICE_AUDIENCES,
  POST_CHOICE_DEFAULT,
  POST_CHOICE_KEEP,
  POST_CHOICE_PRIVATE,
  needsPostChoice,
  postChoiceLine,
  postChoicePrimary,
} from "@/lib/post-choice";

const root = resolve(__dirname, "..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("04.1 one clear post choice after every task", () => {
  it("offers Friends and Everyone, Friends by default, and Keep it private", () => {
    expect(POST_CHOICE_AUDIENCES).toEqual(["friends", "everyone"]);
    expect(POST_CHOICE_DEFAULT).toBe("friends");
    expect(POST_CHOICE_KEEP).toBe("Keep it private");
    expect(POST_CHOICE_PRIVATE).toBe("only_me");
    expect(postChoicePrimary("friends")).toBe("Post to friends");
    expect(postChoicePrimary("everyone")).toBe("Post to everyone");
    expect(postChoiceLine("friends")).not.toContain("!");
    expect(postChoiceLine("everyone")).not.toContain("!");
  });

  it("asks once: payloads without an audience open the sheet, the photo review does not", () => {
    expect(needsPostChoice({ value: 30 })).toBe(true);
    expect(needsPostChoice({ self_reported: true })).toBe(true);
    expect(needsPostChoice({ noteText: "I went to a park" })).toBe(true);
    expect(needsPostChoice({ proofUrl: "x", audience: "friends" })).toBe(false);
    expect(needsPostChoice({ audience: "only_me" })).toBe(false);
  });

  it("every non-photo submit goes through the sheet and the sheet ends the flow", () => {
    const hook = read("components/task-v2/useTaskFlowV2.ts");
    const submit = hook.slice(hook.indexOf("const submitWithoutPhoto"), hook.indexOf("const answerPostChoice"));
    expect(submit).toContain("needsPostChoice(payload)");
    expect(submit).toContain("setPostChoice({ payload, kind })");
    // Did it, Here, journal, count, run, timer, finished early all use submitWithoutPhoto.
    for (const call of [
      "onDidIt: () => void submitWithoutPhoto(",
      "onHere: () => void submitWithoutPhoto(",
      "onJournalPost: () => void submitWithoutPhoto(",
      "void submitWithoutPhoto({ value: count }, \"self_report\")",
      // Build 92 03.5: the run payload is built first so the day's partial logs ride along.
      "void submitWithoutPhoto(payload, \"self_report\")",
      "await submitWithoutPhoto({ value: Math.floor(requiredSeconds / 60) }, \"timer\")",
    ]) {
      expect(hook).toContain(call);
    }
    // Build 92 02.2: a published post never opens the Proof screen; Day secured never carries openPost.
    expect(hook).not.toContain("openPost:");
    expect(hook).toContain("choiceMade: typeof chosenAudience === \"string\"");
    const flow = read("components/task-v2/TaskFlowV2.tsx");
    expect(flow).toContain("<PostChoiceSheet");
    expect(flow).toContain("onClose={f.onPostChoiceClose}");
    const secured = read("app/task/secured.tsx");
    expect(secured).not.toContain("openPost");
  });

  it("the text card names task, challenge, day and streak", () => {
    expect(selfReportedCardMeta("Read 10 pages a day", 2, 7, 3)).toBe("Read 10 pages a day · Day 2 of 7 · 3 days in a row");
    expect(selfReportedCardMeta("Read 10 pages a day", 1, 7, 1)).toBe("Read 10 pages a day · Day 1 of 7 · 1 day in a row");
    expect(selfReportedCardMeta("Read 10 pages a day", 2, 7, 0)).toBe("Read 10 pages a day · Day 2 of 7");
    expect(read("components/feed/FeedPostV3.tsx")).toContain("selfReportedCardMeta(");
  });
});

describe("04.1 a self-reported task can post a text card when asked", () => {
  it("keeps the old rule when no audience was chosen", () => {
    expect(createsActivityPost(true, false)).toBe(false);
    expect(createsActivityPost(true, false, null)).toBe(false);
    expect(createsActivityPost(true, false, "only_me")).toBe(false);
  });

  it("writes the row when the user chose Friends or Everyone", () => {
    expect(createsActivityPost(true, false, "friends")).toBe(true);
    expect(createsActivityPost(true, false, "everyone")).toBe(true);
    expect(createsActivityPost(false, false, "only_me")).toBe(true);
  });

  it("the server passes the audience in", () => {
    const checkins = read("backend/trpc/routes/checkins.ts");
    expect(checkins).toMatch(/createsActivityPost\(input\.self_reported === true, hasPhoto, input\.audience/);
  });
});

describe("04.2 photo-proof tasks say so up front", () => {
  it("the capture header is the challenge and the day, with Photo proof required under it", () => {
    expect(captureHeaderLine("Read 10 pages a day", "Day 2 of 7")).toBe("Read 10 pages a day · Day 2 of 7");
    expect(captureHeaderLine("Read 10 pages a day", null)).toBe("Read 10 pages a day");
    expect(CAPTURE_PROOF_REQUIRED).toBe("Photo proof required.");
    const capture = read("components/task-v2/TaskCapture.tsx");
    expect(capture).toContain("captureHeaderLine(challenge, dayLine)");
    expect(capture).toContain("{CAPTURE_PROOF_REQUIRED}");
    const step = read("components/task-v2/steps/CaptureStep.tsx");
    expect(step).toContain("dayLine={homeDayLine(currentDay, durationDays)}");
    expect(read("components/task-v2/TaskFlowV2.tsx")).toMatch(/<CaptureStep[\s\S]*?durationDays=\{f\.durationDays\}/);
  });

  it("camera only: the capture screen never opens the photo library", () => {
    const capture = read("components/task-v2/TaskCapture.tsx");
    expect(capture).toContain("<CameraView");
    expect(capture).not.toContain("launchImageLibraryAsync");
    expect(capture).not.toContain("expo-image-picker");
    expect(read("components/task-v2/steps/CaptureStep.tsx")).not.toContain("expo-image-picker");
  });
});

describe("04.3 the Proof screen has a finish", () => {
  // Build 92 04.6: no Done and no "Share outside GRIIT" button on the Proof screen. Back returns to
  // where the post was opened from; Share and the audience moved into the owner's "…" menu.
  it("no Done, no inline audience control, Back goes back or Home", () => {
    const screen = read("app/post/[id]/index.tsx");
    expect(screen).not.toContain("label={POST_DETAIL_DONE}");
    expect(screen).not.toContain("POST_DETAIL_SHARE_OUTSIDE");
    expect(screen).not.toContain("<SegmentedControl");
    expect(screen).not.toContain("POST_DETAIL_AUDIENCE_LABEL");
    expect(screen).not.toContain(">Share outside GRIIT</Text>");
    expect(screen).not.toContain(">Back to today</Text>");
    expect(screen).not.toContain("<Text style={styles.time}>{audienceLabel(choice)}</Text>");
    expect(screen).toContain("router.replace(ROUTES.TABS_HOME as never)");
    expect(screen).toContain("router.canGoBack()");
  });

  it("an older post with no stored audience reads as Friends", () => {
    expect(postDetailAudience(null)).toBe("friends");
    expect(postDetailAudience("everyone")).toBe("everyone");
    expect(postDetailAudience("only_me")).toBe("only_me");
    expect(POST_DETAIL_DONE).toBe("Done");
    expect(POST_DETAIL_SHARE_OUTSIDE).toBe("Share outside GRIIT");
  });
});

describe("04.4 your own post always shows in your feed", () => {
  it("a Friends post from the viewer stays in the Everyone scope", () => {
    expect(
      audienceShowsInScopeForViewer({ audience: "friends", scope: "everyone", viewerId: "me", authorId: "me" }),
    ).toBe(true);
    expect(
      audienceShowsInScopeForViewer({ audience: "friends", scope: "following", viewerId: "me", authorId: "me" }),
    ).toBe(true);
  });

  it("other people's posts keep the scope rule", () => {
    expect(
      audienceShowsInScopeForViewer({ audience: "friends", scope: "everyone", viewerId: "me", authorId: "them" }),
    ).toBe(false);
    expect(
      audienceShowsInScopeForViewer({ audience: "everyone", scope: "everyone", viewerId: "me", authorId: "them" }),
    ).toBe(true);
    expect(
      audienceShowsInScopeForViewer({ audience: "only_me", scope: "following", viewerId: "me", authorId: "them" }),
    ).toBe(false);
  });

  it("getLiveFeed uses the viewer-aware rule", () => {
    const feed = read("backend/trpc/routes/feed.ts");
    expect(feed).toContain("audienceShowsInScopeForViewer(");
    expect(feed).not.toMatch(/\baudienceShowsInScope\(audience, input\.scope\)/);
  });
});

describe("04.5 the share card shows the real challenge, day and streak", () => {
  const toast = {
    taskId: "t1",
    title: "Saved.",
    body: "Read 10 pages",
    photoUri: null,
    cameraSeal: false,
    challengeName: "Read 10 pages a day",
    taskName: "Read 10 pages",
    currentDay: 2,
    totalDays: 7,
    streak: 3,
  };

  it("maps the toast to the card", () => {
    const card = shareCardFromToast(toast, "yaseen");
    expect(card.challenge).toBe("Read 10 pages a day");
    expect(card.task).toBe("Read 10 pages");
    expect(card.day).toBe(2);
    expect(card.durationDays).toBe(7);
    expect(card.streak).toBe(3);
    expect(card.username).toBe("yaseen");
  });

  it("the painted card says Day 2 of 7 and the challenge name, never Saved or 1 of 1", () => {
    const card = shareCardFromToast(toast, "yaseen");
    const strings = paintStrings(buildSharePaint({ ...card, style: "C", colour: "ink" }));
    expect(strings).toContain("READ 10 PAGES A DAY");
    expect(strings).toContain("Day 2");
    expect(strings).toContain("of 7");
    expect(strings.join(" ")).not.toContain("Saved");
    expect(strings.join(" ")).not.toContain("of 1");
    expect(strings.join(" ")).not.toContain("CHALLENGE");
  });

  it("the streak is left off when it is 0", () => {
    const card = shareCardFromToast({ ...toast, streak: 0 }, "yaseen");
    expect(card.streak).toBeUndefined();
  });

  it("the tab layout hands the toast through the mapper", () => {
    const layout = read("app/(tabs)/_layout.tsx");
    expect(layout).toContain("shareCardFromToast(");
    // The old path stripped the toast title into the task slot.
    expect(layout).not.toContain("(done|saved)");
  });
});

describe("04.6 sticker set", () => {
  const base = { challenge: "Read 10 pages a day", task: "Read 10 pages", day: 2, durationDays: 7, username: "yaseen" };

  it("a photo task with a streak swipes through four cards: day stamp, streak, progress, photo", () => {
    expect(stylesForMoment("photo_proof", { streak: 3, hasPhoto: true })).toEqual(["H", "E", "D", "A"]);
  });

  it("the streak card hides at 0 and the photo card needs the user's photo", () => {
    expect(stylesForMoment("photo_proof", { streak: 0, hasPhoto: true })).toEqual(["H", "D", "A"]);
    expect(stylesForMoment("self_reported", { streak: 0, hasPhoto: false })).toEqual(["H", "D"]);
    expect(stylesForMoment("self_reported", { streak: 1, hasPhoto: false })).toEqual(["H", "E", "D"]);
    expect(stylesForMoment("photo_proof", { streak: 2, hasPhoto: false })).toEqual(["H", "E", "D"]);
  });

  it("no moment lists the glow sticker and the stock landscape is gone", () => {
    for (const moment of ["photo_proof", "self_reported", "day_secured", "challenge_finished", "invite"] as const) {
      expect(stylesForMoment(moment)).not.toContain("B");
    }
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).not.toContain("SAMPLE_STORY");
    expect(sheet).not.toContain("sunrise1");
  });

  it("the four cards say different things", () => {
    const strings = (style: "H" | "E" | "D" | "A") =>
      paintStrings(buildSharePaint({ ...base, style, colour: "ink", streak: 3, photoUri: "file://p.jpg", cameraSeal: true }));
    const stamp = strings("H");
    expect(stamp).toContain("READ 10 PAGES A DAY");
    expect(stamp).toContain("Read 10 pages");
    expect(stamp).toContain("Day 2");
    expect(stamp).toContain("of 7");
    const streak = strings("E");
    expect(streak).toContain("3");
    expect(streak).toContain("days in a row");
    const progress = buildSharePaint({ ...base, style: "D", colour: "ink" });
    expect(paintStrings(progress)).toContain("Day 2");
    expect(paintStrings(progress)).toContain("of 7");
    expect(paintStrings(progress).join(" ")).not.toContain("0 of 7");
    expect(progress.block.items.some((item) => item.kind === "grid")).toBe(true);
    const photo = buildSharePaint({ ...base, style: "A", colour: "ink", photoUri: "file://p.jpg", cameraSeal: true });
    expect(photo.photo).toBe(true);
  });

  it("Copy sticker is on every card", () => {
    for (const style of ["H", "E", "D", "A"] as const) expect(copyStickerAvailable(style)).toBe(true);
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).toContain("copyStickerAvailable(styleId)");
    expect(sheet).toContain("stylesForMoment(moment, { streak: card.streak, hasPhoto: Boolean(card.photoUri) })");
  });

  it("Instagram Story sends every card as a sticker, not as a background", () => {
    // Every card any moment can show. B is the retired glow sticker; it stays true too.
    for (const style of ["H", "E", "D", "A", "F", "G", "B", "C"] as const) expect(storyUsesSticker(style)).toBe(true);
    for (const moment of ["photo_proof", "self_reported", "day_secured", "challenge_finished", "invite"] as const) {
      for (const style of stylesForMoment(moment, { streak: 3, hasPhoto: true })) expect(storyUsesSticker(style)).toBe(true);
    }
    const sheet = read("components/share/ShareSystemSheet.tsx");
    expect(sheet).toContain("asSticker: storyUsesSticker(styleId)");
    expect(sheet).toContain("backgroundTopColor: palette.bg");
  });
});
