import { describe, expect, it } from "vitest";
import { respectCountsByOwner } from "./feed-respect-counts";

describe("respectCountsByOwner", () => {
  it("counts feed_reactions on each owner's events", () => {
    const counts = respectCountsByOwner(
      [
        { id: "e1", user_id: "a" },
        { id: "e2", user_id: "b" },
      ],
      [{ event_id: "e1" }, { event_id: "e1" }, { event_id: "missing" }],
    );
    expect(counts.get("a")).toBe(2);
    expect(counts.get("b")).toBeUndefined();
  });
});
