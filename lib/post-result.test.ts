import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hms, likedByLine, postBadge, resultLine, JOURNAL_ENTRY, JOURNAL_PRIVATE } from "@/lib/post-result";
import { POST_MENU_DELETE, POST_MENU_DELETE_NOTE, POST_MENU_SHARE, POST_MENU_WHO_SEES } from "@/lib/post-menu";

const root = resolve(fileURLToPath(import.meta.url), "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("build 92 04.1 · post result lines", () => {
  it("run: distance, time and pace in the task's unit", () => {
    expect(resultLine({ kind: "run", distance_km: 4.828032, duration_min: 27.5, distance_unit: "mi" })).toEqual({
      kind: "Run",
      big: "3 mi · 27:30 · 9:10 /mi",
    });
    expect(resultLine({ kind: "run", distance_km: 10, duration_min: 65, distance_unit: "km" })?.big).toBe("10 km · 1:05:00 · 6:30 /km");
  });
  it("workout, counter, timer", () => {
    expect(resultLine({ kind: "workout", workout_kind: "Lift", duration_min: 45 })?.big).toBe("Lift · 45 min");
    expect(resultLine({ kind: "counter", count: 12, unit: "pages" })?.big).toBe("12 pages");
    expect(resultLine({ kind: "timer", duration_min: 20 })?.big).toBe("20 min");
  });
  it("journal shows 'Journal entry' and never the text", () => {
    const line = resultLine({ kind: "journal", ...({ text: "my private words" } as object) } as never);
    expect(line).toEqual({ kind: "Journal", big: JOURNAL_ENTRY, sub: JOURNAL_PRIVATE });
    expect(JSON.stringify(line)).not.toContain("private words");
  });
  it("no result (photo check-off, build 91 post) → nothing but the badge", () => {
    expect(resultLine(null)).toBeNull();
    expect(resultLine({ kind: "check" })).toBeNull();
  });
  it("h:mm:ss", () => {
    expect(hms(90)).toBe("1:30");
    expect(hms(3900)).toBe("1:05:00");
  });
});

describe("build 92 04.2 · one badge per post", () => {
  it("stored badge wins; otherwise Strava → camera → self", () => {
    expect(postBadge({ badge: "Verified" })).toBe("Verified");
    expect(postBadge({ verifiedBy: "strava" })).toBe("Verified by Strava");
    expect(postBadge({ proofPhotoUrl: "https://cdn/p.jpg" })).toBe("Verified");
    expect(postBadge({})).toBe("Self-reported");
  });
  it("the card renders the badge once: no seal overlay, no timed self-reported line", () => {
    const card = read("components/feed/FeedPostV3.tsx");
    expect(card).toContain("<PostResultRow");
    expect(card).not.toContain("<CameraSeal");
    expect(card).not.toContain("selfReportedLine(");
  });
});

describe("build 92 04.3 · post header", () => {
  it("subject on one line, time never wraps or shrinks", () => {
    const card = read("components/feed/FeedPostV3.tsx");
    expect(card).toMatch(/<Text style=\{styles\.subject\} numberOfLines=\{1\}/);
    expect(card).toMatch(/<Text style=\{styles\.when\} numberOfLines=\{1\}>/);
    expect(card).toMatch(/when: \{[^}]*flexShrink: 0/);
  });
});

describe("build 92 04.4 · double-tap to like", () => {
  it("one gesture owns both taps; the photo is no longer a Pressable", () => {
    const dt = read("components/feed/DoubleTapRespect.tsx");
    expect(dt).toContain("Gesture.Exclusive(");
    expect(dt).toContain("runOnJS(onOpen)()");
    expect(dt).not.toContain("void onOpen");
    expect(dt).toContain("BURST_MS = 600");
    const card = read("components/feed/FeedPostV3.tsx");
    expect(card).not.toMatch(/onPress=\{onOpenPhoto \?\? open\}/);
  });
  it("proof detail and full screen wrap the photo in the same gesture and only ever add a like", () => {
    const detail = read("app/post/[id]/index.tsx");
    const photo = read("app/post/[id]/photo.tsx");
    expect(detail).toContain("<DoubleTapRespect");
    expect(photo).toContain("<DoubleTapRespect");
    expect(detail).toContain('mode: "like"');
    expect(photo).toContain('mode: "like"');
    const feed = read("components/LiveFeedSection.tsx");
    expect(feed).toContain('onLikeOnce={() => void onRespect(item, "like")}');
    expect(read("components/feed/FeedPostV3.tsx")).toContain("onRespect={likeOnce}");
  });
});

describe("build 92 04.5 · own posts", () => {
  it("Liked by {name} and {n} others", () => {
    expect(likedByLine("Sami", 4)).toBe("Liked by Sami and 3 others");
    expect(likedByLine("Sami", 2)).toBe("Liked by Sami and 1 other");
    expect(likedByLine("Sami", 1)).toBe("Liked by Sami");
    expect(likedByLine(null, 3)).toBeNull();
    expect(likedByLine("Sami", 0)).toBeNull();
  });
  it("the card has no heart on an own post and the double tap does nothing", () => {
    const card = read("components/feed/FeedPostV3.tsx");
    expect(card).toContain("ownPost ? (");
    expect(card).toContain("likedByLine(");
  });
});

describe("build 92 04.6 · proof detail", () => {
  it("Back goes back or Home, no Done, title is the challenge, menu words, composer pinned", () => {
    const screen = read("app/post/[id]/index.tsx");
    expect(screen).toMatch(/if \(router\.canGoBack\(\)\) router\.back\(\);\s+else router\.replace\(ROUTES\.TABS_HOME as never\)/);
    expect(screen).not.toContain("POST_DETAIL_DONE");
    expect(screen).not.toContain('testID="post-done"');
    expect(screen).toContain("title={displayPost?.challengeName");
    expect(screen).toContain("ownerMenuOptions(");
    expect(screen).toContain('action === "who_sees"');
    expect(screen).toContain('action === "share"');
    expect(screen).toContain("POST_MENU_DELETE_NOTE");
    expect(screen).toContain("keyboardVerticalOffset={0}");
    expect(screen).toContain("keyboardUp ? DS_V3.space.sm");
    expect(screen).toContain("scrollToEnd(");
    expect(POST_MENU_WHO_SEES).toBe("Who sees this");
    expect(POST_MENU_SHARE).toBe("Share");
    expect(POST_MENU_DELETE).toBe("Delete post");
    expect(POST_MENU_DELETE_NOTE).toBe("Delete removes it from the feed only. The proof stays in your record and the day stays secured.");
    const feed = read("components/LiveFeedSection.tsx");
    expect(feed).toContain("ownerMenuOptions(");
    expect(feed).not.toContain('"Who can see this"');
    expect(feed).not.toContain('"Delete from the feed"');
  });
});
