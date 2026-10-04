import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function sql(name: string): string {
  return readFileSync(resolve(__dirname, "../../supabase/migrations", name), "utf8");
}

describe("draft migrations that record objects already in prod", () => {
  it("records clocked_in_at without a second verification_gates column", () => {
    const clocked = sql("20261004120000_check_ins_clocked_in_at.sql");
    expect(clocked).toContain("DO NOT APPLY");
    expect(clocked).toContain("add column if not exists clocked_in_at");
    expect(clocked).toContain("[UNVERIFIED]");
    const gates = sql("20261004010000_check_ins_verification_gates.sql");
    expect(gates).toContain("verification_gates");
    expect(gates.toLowerCase()).toContain("do not apply");
  });

  it("records streaks with IF NOT EXISTS and unverified columns", () => {
    const streaks = sql("20261004120001_streaks_table.sql");
    expect(streaks).toContain("DO NOT APPLY");
    expect(streaks).toContain("create table if not exists public.streaks");
    expect(streaks).toContain("[UNVERIFIED]");
    expect(streaks).toContain("active_streak_count");
    expect(streaks).toContain("last_completed_date_key");
  });
});
