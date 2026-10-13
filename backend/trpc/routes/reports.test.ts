import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { createTestCaller } from "../create-test-caller";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: () => null }));
vi.mock("../../lib/sendPush", () => ({ sendPush: vi.fn() }));

const REPORTER = "11111111-1111-4111-8111-111111111111";
const REPORTED = "22222222-2222-4222-8222-222222222222";

function caller(insertError: { code: string } | null, onInsert?: (row: Record<string, unknown>) => void) {
  let selected = false;
  const supabase = {
    from: (table: string) => {
      if (table !== "user_reports") throw new Error(`unexpected table ${table}`);
      return {
        insert: (row: Record<string, unknown>) => {
          onInsert?.(row);
          const result = { error: insertError };
          return {
            select: () => {
              selected = true;
              return Promise.resolve({ data: null, error: { code: "42501", message: "permission denied for select" } });
            },
            then: (resolve: (v: typeof result) => unknown, reject?: (e: unknown) => unknown) =>
              Promise.resolve(result).then(resolve, reject),
          };
        },
      };
    },
  };
  const reports = createTestCaller({ userId: REPORTER, supabase }) as unknown as {
    reports: {
      reportUser: (input: { userId: string; reason: "other"; details?: string }) => Promise<{
        success: boolean;
        alreadyReported: boolean;
      }>;
    };
  };
  return {
    reportUser: reports.reports.reportUser,
    selected: () => selected,
  };
}

describe("reports.reportUser", () => {
  it("inserts without selecting, because user_reports has no select policy", async () => {
    const seen: Record<string, unknown>[] = [];
    const api = caller(null, (row) => seen.push(row));
    const result = await api.reportUser({ userId: REPORTED, reason: "other", details: "post-1" });
    expect(result).toEqual({ success: true, alreadyReported: false });
    expect(seen).toEqual([
      {
        reporter_user_id: REPORTER,
        reported_user_id: REPORTED,
        reason: "other",
        details: "post-1",
      },
    ]);
    expect(api.selected()).toBe(false);
  });

  it("treats a duplicate report as Already reported", async () => {
    const api = caller({ code: "23505" });
    const result = await api.reportUser({ userId: REPORTED, reason: "other" });
    expect(result).toEqual({ success: true, alreadyReported: true });
    expect(api.selected()).toBe(false);
  });

  it("rejects reporting yourself before the insert", async () => {
    const api = caller(null);
    await expect(api.reportUser({ userId: REPORTER, reason: "other" })).rejects.toBeInstanceOf(TRPCError);
  });
});
