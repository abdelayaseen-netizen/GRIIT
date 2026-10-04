import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { createTestCaller } from "../create-test-caller";
import { NUDGE_MESSAGES, pickRandomMessage } from "./nudges";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

describe("Nudge messages", () => {
  it("has exactly the 3 allowed messages", () => {
    expect(NUDGE_MESSAGES).toHaveLength(3);
    expect(NUDGE_MESSAGES).toContain("You showed up today. That's discipline.");
    expect(NUDGE_MESSAGES).toContain("Don't break the chain.");
    expect(NUDGE_MESSAGES).toContain("Small wins stack.");
  });

  it("pickRandomMessage returns one of the allowed messages", () => {
    for (let i = 0; i < 20; i++) {
      const msg = pickRandomMessage();
      expect(NUDGE_MESSAGES).toContain(msg);
    }
  });
});

describe("nudges.send (via createCaller)", () => {
  it("rejects without writing the missing nudges table", async () => {
    const src = readFileSync(resolve(__dirname, "./nudges.ts"), "utf8");
    expect(src).not.toContain('.from("nudges")');
    expect(src).toContain("Nudges live in group challenges now.");
    const caller = createTestCaller({
      userId: USER_A,
      supabase: { from: () => { throw new Error("no db"); } },
    });
    if (!caller) return;
    await expect(caller.nudges.send({ toUserId: USER_B })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Nudges live in group challenges now.",
    });
  });
});
