import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { prepareJournalUnmount } from "./journal-leave";

describe("prepareJournalUnmount", () => {
  it("clears the field and lets that paint before the field unmounts", async () => {
    const order: string[] = [];
    await prepareJournalUnmount({
      clear: () => order.push("clear"),
      unmountField: () => order.push("unmount"),
      wait: async () => {
        order.push("wait");
      },
    });
    expect(order).toEqual(["clear", "wait", "unmount", "wait"]);
  });

  it("runs that sequence before the screen leaves, and a blank journal asks for 10 words", () => {
    const flow = readFileSync(
      resolve(__dirname, "../components/task-v2/useTaskFlowV2.ts"),
      "utf8",
    );
    const clearAt = flow.indexOf("prepareJournalUnmount");
    expect(clearAt).toBeGreaterThan(0);
    expect(flow.indexOf("returnToOrigin()", clearAt)).toBeGreaterThan(clearAt);
    expect(flow.indexOf("router.replace", clearAt)).toBeGreaterThan(clearAt);
    expect(flow).toContain("journalMinWords(config.min_words)");
    expect(flow).not.toContain("config.min_words ?? 150");
    expect(flow).not.toContain("setTimeout(resolve, 80)");
  });
});
