import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("feed actions", () => {
  it("keeps respect, comment, and share outside the open gesture", () => {
    const src = readFileSync(resolve(__dirname, "../components/feed/FeedPostV3.tsx"), "utf8");
    const photo = src.indexOf('onOpen={onOpenPhoto ?? open}');
    const actions = src.lastIndexOf("<ActionRow");
    expect(photo).toBeGreaterThan(0);
    expect(actions).toBeGreaterThan(photo);
    expect(src).toContain('testID="feed-respect"');
    expect(src).toContain("width: 44");
    const row = readFileSync(resolve(__dirname, "../components/feed/FeedCompactRow.tsx"), "utf8");
    expect(row).toContain("minWidth: 44");
    expect(row).toContain("minHeight: 44");
  });
});
