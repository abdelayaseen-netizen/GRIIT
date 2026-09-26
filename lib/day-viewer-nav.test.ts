import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MIN_PROOF_IMAGE_BYTES } from "@/lib/proof-image-bytes";
import { proofsTileIsMissing } from "@/lib/proofs-grid";
import {
  dayViewerCountLabel,
  dayViewerCursorFromPage,
  dayViewerDateKeys,
  dayViewerPageFromCursor,
  dayViewerPages,
  dayViewerPhotoCount,
  dayViewerSwipeNext,
  dayViewerSwipePrev,
} from "@/lib/day-viewer-nav";

const items = [
  { id: "a", dateKey: "2026-09-25" },
  { id: "b", dateKey: "2026-09-25" },
  { id: "c", dateKey: "2026-09-19" },
];

describe("day viewer paging", () => {
  it("orders days newest first and flattens photos within each day", () => {
    expect(dayViewerDateKeys(items)).toEqual(["2026-09-25", "2026-09-19"]);
    expect(dayViewerPages(items).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("swipe left advances photo, then the previous day", () => {
    const pages = dayViewerPages(items);
    expect(dayViewerSwipeNext(pages, 0)).toBe(1);
    expect(dayViewerCursorFromPage(pages, 1)).toEqual({ dateKey: "2026-09-25", photoIndex: 1 });
    expect(dayViewerCountLabel({ dateKey: "2026-09-25", photoIndex: 1 }, 2)).toBe("2 of 2");
    const across = dayViewerSwipeNext(pages, 1);
    expect(across).toBe(2);
    expect(dayViewerCursorFromPage(pages, across!)).toEqual({ dateKey: "2026-09-19", photoIndex: 0 });
    expect(dayViewerCountLabel({ dateKey: "2026-09-19", photoIndex: 0 }, 1)).toBe("1 of 1");
  });

  it("swipe right on the first photo of a day goes to the newer day's last photo", () => {
    const pages = dayViewerPages(items);
    const firstOfOlder = dayViewerPageFromCursor(pages, { dateKey: "2026-09-19", photoIndex: 0 });
    expect(firstOfOlder).toBe(2);
    const prev = dayViewerSwipePrev(pages, firstOfOlder);
    expect(prev).toBe(1);
    expect(dayViewerCursorFromPage(pages, prev!)).toEqual({ dateKey: "2026-09-25", photoIndex: 1 });
    expect(dayViewerSwipePrev(pages, 0)).toBeNull();
  });

  it("oldest day last photo has nothing further", () => {
    const pages = dayViewerPages(items);
    expect(dayViewerSwipeNext(pages, pages.length - 1)).toBeNull();
  });

  it("single-photo day is 1 of 1 and does not page", () => {
    const pages = dayViewerPages([{ id: "only", dateKey: "2026-09-20" }]);
    expect(dayViewerPhotoCount(pages, "2026-09-20")).toBe(1);
    expect(dayViewerCountLabel({ dateKey: "2026-09-20", photoIndex: 0 }, 1)).toBe("1 of 1");
    expect(dayViewerSwipeNext(pages, 0)).toBeNull();
    expect(dayViewerSwipePrev(pages, 0)).toBeNull();
  });

  it("Photo not saved stubs stay in the pager and are swipeable", () => {
    const stub = {
      id: "stub",
      dateKey: "2026-09-19",
      uri: "https://example.test/stub.jpg",
      bytes: 12,
    };
    const live = {
      id: "live",
      dateKey: "2026-09-25",
      uri: "https://example.test/live.jpg",
      bytes: MIN_PROOF_IMAGE_BYTES + 10,
    };
    expect(proofsTileIsMissing(stub)).toBe(true);
    expect(proofsTileIsMissing(live)).toBe(false);
    const pages = dayViewerPages([live, stub]);
    expect(pages.map((p) => p.id)).toEqual(["live", "stub"]);
    expect(dayViewerSwipeNext(pages, 0)).toBe(1);
    const src = readFileSync(resolve(__dirname, "../components/profile/DayViewer.tsx"), "utf8");
    expect(src).toContain("PROOFS_PHOTO_NOT_SAVED");
    expect(src).toContain("proofsTileIsMissing");
  });

  it("DayViewer pages with a windowed horizontal list and no swipe caption", () => {
    const src = readFileSync(resolve(__dirname, "../components/profile/DayViewer.tsx"), "utf8");
    expect(src).toContain("pagingEnabled");
    expect(src).toContain("horizontal");
    expect(src).toContain("initialNumToRender");
    expect(src).toContain("windowSize");
    expect(src).not.toMatch(/<Modal/);
    expect(src).not.toContain("Swipe left at the last photo");
    const screen = readFileSync(resolve(__dirname, "../app/profile/day.tsx"), "utf8");
    expect(screen).toContain("countLabel");
    expect(screen).toContain("proofsDateLabel");
  });
});
