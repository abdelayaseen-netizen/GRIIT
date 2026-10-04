import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createTestCaller } from "../create-test-caller";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

describe("accountability is retired", () => {
  it("does not send partner pushes or read a partners table", () => {
    const src = readFileSync(resolve(__dirname, "./accountability.ts"), "utf8");
    expect(src).not.toContain("sendExpoPush");
    expect(src).not.toContain("accountability_pairs");
    expect(src).toContain("Accountability partners are now groups.");
    const awards = readFileSync(resolve(__dirname, "../../lib/achievements.ts"), "utf8");
    expect(awards).not.toContain("accountability_pairs");
    expect(awards).not.toContain("ACCOUNTABILITY_PARTNER");
  });

  it("rejects invite without writing a row", async () => {
    const caller = createTestCaller({ userId: USER_A, supabase: { from: () => { throw new Error("no db"); } } });
    if (!caller) return;
    await expect(caller.accountability.invite({ partnerId: USER_B })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Accountability partners are now groups.",
    });
  });
});
