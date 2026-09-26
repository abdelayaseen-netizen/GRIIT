import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  dayViewerCountLabel,
  dayViewerCursorFromPage,
  dayViewerDateKeys,
  dayViewerNextDayHint,
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
    expect(dayViewerSwipeNext(pages, 2)).toBeNull();
  });

  it("swipe right goes back a photo, then to the newer day last photo", () => {
    const pages = dayViewerPages(items);
    expect(dayViewerSwipePrev(pages, 2)).toBe(1);
    expect(dayViewerCursorFromPage(pages, 1)).toEqual({ dateKey: "2026-09-25", photoIndex: 1 });
    expect(dayViewerSwipePrev(pages, 0)).toBeNull();
  });

  it("count is per day, not across days", () => {
    const pages = dayViewerPages(items);
    expect(dayViewerPhotoCount(pages, "2026-09-25")).toBe(2);
    expect(dayViewerPhotoCount(pages, "2026-09-19")).toBe(1);
    expect(dayViewerPageFromCursor(pages, { dateKey: "2026-09-19", photoIndex: 0 })).toBe(2);
  });

  it("hint only on the last photo when an older day exists", () => {
    const pages = dayViewerPages(items);
    expect(dayViewerNextDayHint({ pages, pageIndex: 0, isOwner: true })).toBeNull();
    expect(dayViewerNextDayHint({ pages, pageIndex: 1, isOwner: true })).toBe(
      "Swipe left at the last photo for 19 September",
    );
    expect(dayViewerNextDayHint({ pages, pageIndex: 1, isOwner: false })).toBe(
      "Swipe left at the last photo for the previous shared day",
    );
    expect(dayViewerNextDayHint({ pages, pageIndex: 2, isOwner: true })).toBeNull();
  });

  it("DayViewer pages with a horizontal paging list", () => {
    const src = readFileSync(resolve(__dirname, "../components/profile/DayViewer.tsx"), "utf8");
    expect(src).toContain("pagingEnabled");
    expect(src).toContain("horizontal");
    expect(src).not.toMatch(/<Modal/);
  });
});
