import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("camera share choice", () => {
  it("uses the outlined photo pill, undo, and an optimistic home insert", () => {
    const choice = readFileSync(resolve(__dirname, "../components/ds/ShareChoice.tsx"), "utf8");
    const copy = readFileSync(resolve(__dirname, "./copy.ts"), "utf8");
    const toast = readFileSync(resolve(__dirname, "../components/task-v2/TaskCompleteToast.tsx"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../components/LiveFeedSection.tsx"), "utf8");
    const checkins = readFileSync(resolve(__dirname, "../backend/trpc/routes/checkins.ts"), "utf8");
    expect(choice).toContain("SHARE.cta");
    expect(copy).toContain("Share this photo to the feed");
    expect(copy).toContain("No answer keeps it private.");
    expect(toast).toContain("PHOTO_LIFE_MS = 4000");
    expect(toast).toContain("testID=\"toast-saved\"");
    expect(toast).not.toContain("PHOTO_LIFE_MS = 8000");
    expect(feed).toContain("subscribeOptimisticFeedPost");
    expect(checkins).toContain("unshareProof:");
    expect(checkins).toContain("keepSharePatch");
  });
});
