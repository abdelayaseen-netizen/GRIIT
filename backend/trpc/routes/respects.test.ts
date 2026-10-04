import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTestCaller } from "../create-test-caller";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

describe("respects table is not used", () => {
  it("rejects give without writing a row", async () => {
    const src = readFileSync(resolve(__dirname, "./respects.ts"), "utf8");
    expect(src).not.toContain('.from("respects")');
    const caller = createTestCaller({
      userId: USER_A,
      supabase: { from: () => { throw new Error("no db"); } },
    });
    if (!caller) return;
    await expect(caller.respects.give({ recipientId: USER_B })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Respects are on feed posts.",
    });
  });
});
