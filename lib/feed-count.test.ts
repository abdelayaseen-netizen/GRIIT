import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { showFeedCount } from "@/lib/feed-count";

describe("showFeedCount", () => {
  it("hides 0 next to heart and comment", () => {
    expect(showFeedCount(0)).toBe(false);
    expect(showFeedCount(1)).toBe(true);
    const compact = readFileSync(
      resolve(__dirname, "../components/feed/FeedCompactRow.tsx"),
      "utf8",
    );
    expect(compact).toContain("showFeedCount(p.respects)");
    expect(compact).toContain("showFeedCount(p.comments)");
  });
});
