import { beforeEach, describe, expect, it, vi } from "vitest";

const captureException = vi.fn();
const createDaily = vi.fn();
const hasAdmin = vi.fn();
const getAdmin = vi.fn();

vi.mock("@sentry/node", () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}));

vi.mock("./supabase-admin", () => ({
  hasSupabaseAdmin: () => hasAdmin(),
  getSupabaseAdmin: () => getAdmin(),
}));

vi.mock("./daily-challenge-generator", () => ({
  createDailyChallengeIfMissing: (...args: unknown[]) => createDaily(...args),
}));

vi.mock("./logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe("runDailyChallengeCron", () => {
  beforeEach(() => {
    captureException.mockReset();
    createDaily.mockReset();
    hasAdmin.mockReset();
    getAdmin.mockReset();
  });

  it("skips, reports to Sentry, and does not insert when the service role is missing", async () => {
    hasAdmin.mockReturnValue(false);
    const { runDailyChallengeCron, DAILY_CHALLENGE_CRON_SKIPPED } = await import("./daily-challenge-cron");
    const result = await runDailyChallengeCron();
    expect(result).toEqual({
      ok: false,
      skipped: true,
      error: DAILY_CHALLENGE_CRON_SKIPPED,
    });
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(createDaily).not.toHaveBeenCalled();
    expect(getAdmin).not.toHaveBeenCalled();
  });

  it("uses the admin client when the service role is set", async () => {
    const admin = { kind: "service-role" };
    hasAdmin.mockReturnValue(true);
    getAdmin.mockReturnValue(admin);
    createDaily.mockResolvedValue({ created: true, id: "daily-1" });
    const { runDailyChallengeCron } = await import("./daily-challenge-cron");
    const now = new Date("2026-09-26T12:00:00.000Z");
    await expect(runDailyChallengeCron(now)).resolves.toEqual({
      ok: true,
      created: true,
      id: "daily-1",
    });
    expect(createDaily).toHaveBeenCalledWith(admin, now);
    expect(captureException).not.toHaveBeenCalled();
  });
});
