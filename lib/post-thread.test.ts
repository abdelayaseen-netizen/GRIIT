import { describe, expect, it } from "vitest";
import { replyComposerPlaceholder, threadRows } from "@/lib/post-thread";

describe("replyComposerPlaceholder", () => {
  it("uses the first name", () => {
    expect(replyComposerPlaceholder("Maya Chen")).toBe("Reply to Maya");
    expect(replyComposerPlaceholder("  ")).toBe("Reply to them");
  });
});

describe("threadRows", () => {
  it("nests a reply under its parent and keeps orphans at the top", () => {
    const rows = threadRows([
      { id: "a", parent_id: null },
      { id: "b", parent_id: "a" },
      { id: "c", parent_id: "missing" },
      { id: "d", parent_id: "b" },
    ]);
    expect(rows.map((row) => [row.item.id, row.depth])).toEqual([
      ["a", 0],
      ["b", 1],
      ["d", 1],
      ["c", 0],
    ]);
  });
});
