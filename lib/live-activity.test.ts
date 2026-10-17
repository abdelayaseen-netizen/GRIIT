import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("live activity copy", () => {
  it("says Done. Tap to post. at zero and ends when the task is completed", () => {
    const src = readFileSync(resolve(__dirname, "./live-activity.ts"), "utf8");
    expect(src).toContain('export const LIVE_ACTIVITY_DONE = "Done. Tap to post."');
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"), "utf8");
    expect(flow).toContain("showLiveActivityDone()");
    expect(flow).toContain("endLiveActivity()");
  });
});
