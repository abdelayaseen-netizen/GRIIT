import { describe, expect, it } from "vitest";
import { activityText, groupActivity } from "./feed-group";

describe("groupActivity", () => {
  it("merges consecutive events for the same challenge and drops extras inside the cap", () => {
    const items = [
      { kind: "activity" as const, challengeId: "c", verb: "started", name: "A" },
      { kind: "activity" as const, challengeId: "c", verb: "started", name: "B" },
      { kind: "post" as const },
      { kind: "activity" as const, challengeId: "c", verb: "started", name: "C" },
    ];
    const out = groupActivity(items, 4);
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ kind: "group", members: [{ name: "A" }, { name: "B" }] });
    expect(out[1]).toMatchObject({ kind: "post" });
  });

  it("names a group as A, B and n others", () => {
    expect(activityText(["A", "B", "C", "D"], "started", "Dawn")).toBe("A, B, C and 1 other started Dawn");
  });
});
