import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("feed actions", () => {
  it("keeps respect, comment, and share outside the open gesture", () => {
    const src = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    // Build 92 04.4: the open now lives on the gesture wrapper (a multi-line prop), not a Pressable.
    const photo = src.indexOf("onOpen={onOpenPhoto ?? open}");
    const actions = src.lastIndexOf("<ActionRow");
    expect(photo).toBeGreaterThan(0);
    expect(actions).toBeGreaterThan(photo);
    expect(src).toContain('testID="feed-respect"');
    expect(src).toContain("Challenge complete");
    expect(src).toContain("Longest streak");
    expect(src).toContain("Held");
    expect(src).toContain("Started");
    expect(src).not.toContain("finishMeta");
    // Build 92 04.2: the timed "Self-reported · 7:00 pm" line became the one badge in PostResultRow.
    expect(src).not.toContain("selfReportedLine");
    expect(src).toContain("<PostResultRow");
    expect(src).not.toContain("Verified");
    expect(src).toContain("width: 44");
    const row = readFileSync(resolve(__dirname, "../components/feed/FeedCompactRow.tsx"), "utf8");
    expect(row).toContain("minWidth: 44");
    expect(row).toContain("minHeight: 44");
  });
});
