import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  starterFreezeGrant,
  starterIsExpired,
  starterJoinStartsTomorrow,
  starterSource,
  starterTitleError,
} from "./starter-task";

describe("starter task", () => {
  it("keeps a written title between 1 and 40 characters", () => {
    expect(starterTitleError("  ")).toBe("Write a task first.");
    expect(starterTitleError("a".repeat(41))).toBe("Keep it to 40 characters.");
    expect(starterTitleError("Make your bed")).toBeNull();
  });

  it("grants one freeze under the cap and never a second", () => {
    expect(starterFreezeGrant({ alreadyGranted: false, held: 0, cap: 2 })).toEqual({
      grant: true,
      nextHeld: 1,
    });
    expect(starterFreezeGrant({ alreadyGranted: false, held: 2, cap: 2 }).grant).toBe(false);
    expect(starterFreezeGrant({ alreadyGranted: true, held: 0, cap: 2 }).grant).toBe(false);
  });

  it("expires only after the day it was created", () => {
    expect(starterIsExpired("2026-10-12", "2026-10-13")).toBe(true);
    expect(starterIsExpired("2026-10-13", "2026-10-13")).toBe(false);
  });

  it("treats the six presets as picked", () => {
    expect(starterSource("Make your bed")).toBe("picked");
    expect(starterSource("Walk the dog")).toBe("written");
  });

  it("starts the joined challenge tomorrow when the starter owns today", () => {
    expect(starterJoinStartsTomorrow({ requested: true, todaySecured: false, windowClosed: false })).toBe(true);
    expect(starterJoinStartsTomorrow({ requested: false, todaySecured: false, windowClosed: false })).toBe(false);
  });

  it("writes starter_tasks only with the service role after an ownership check", () => {
    const src = readFileSync(resolve(__dirname, "../trpc/routes/starter-task.ts"), "utf8");
    expect(src).toContain("getSupabaseServer()");
    expect(src).toContain('.eq("user_id", ctx.userId)');
    expect(src).toContain('.from("day_secures")');
    expect(src).not.toContain("input.userId");
    expect(src).not.toContain('from("freeze_grants")');
    expect(src).not.toContain("ctx.supabase.from(\"starter_tasks\").insert");
    expect(src).not.toContain("ctx.supabase.from(\"starter_tasks\").update");
  });
});
