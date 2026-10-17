import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createStepTimer, medianMs } from "./step-timer";

const read = (p: string) => readFileSync(resolve(__dirname, p), "utf8");

describe("step timer (01b.1)", () => {
  it("records each step's ms, repeats as #2, total and the uncovered gap", async () => {
    let now = 1000;
    const t = createStepTimer(() => now);
    const a = await t.step("task", async () => {
      now += 120;
      return "row";
    });
    expect(a).toBe("row");
    now += 30; // CPU between steps
    await t.step("upsert", async () => {
      now += 200;
    });
    await t.step("task", async () => {
      now += 10;
    });
    const out = t.finish();
    expect(out.steps).toEqual({ task: 120, upsert: 200, "task#2": 10 });
    expect(out.totalMs).toBe(360);
    expect(out.gapMs).toBe(30);
  });

  it("a step that throws is still recorded and the error rethrown", async () => {
    let now = 0;
    const t = createStepTimer(() => now);
    await expect(
      t.step("boom", async () => {
        now += 50;
        throw new Error("x");
      }),
    ).rejects.toThrow("x");
    expect(t.finish().steps).toEqual({ boom: 50 });
  });

  it("medianMs", () => {
    expect(medianMs([5, 1, 3])).toBe(3);
    expect(medianMs([4, 1, 3, 2])).toBe(2.5);
    expect(medianMs([])).toBe(0);
  });

  it("checkins.complete and secureDay time every Supabase step and log the map (source)", () => {
    const src = read("../trpc/routes/checkins.ts");
    expect(src).toMatch(/const t = createStepTimer\(\);/);
    // 01b.2: the serial chain became four rounds — setup, context, upsert, finish — with the
    // activity row, the progress write, the secure and the share timed inside the finish.
    for (const name of [
      "setup",
      "context",
      "upsert",
      "finish",
      "activity_event",
      "progress",
      "secure",
      "share",
      "sign_urls",
    ]) {
      expect(src, name).toContain(`t.step("${name}"`);
    }
    expect(src).toMatch(/"\[checkins\.complete\] steps"/);
    expect(src).toMatch(/"\[checkins\.secureDay\] steps"/);
    for (const name of ["secure_setup", "secure_context", "secure_day_rpc", "secure_after_rpc", "days_update", "freeze_grant"]) {
      expect(src, name).toContain(`t.step("${name}"`);
    }
  });

  it("/api/health/deep reports the Supabase round trip in ms (source)", () => {
    const src = read("../hono.ts");
    expect(src).toMatch(/supabase_ms/);
  });
});
