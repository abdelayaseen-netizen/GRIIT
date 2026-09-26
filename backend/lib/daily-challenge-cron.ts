import * as Sentry from "@sentry/node";
import { logger } from "./logger";
import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";
import { createDailyChallengeIfMissing } from "./daily-challenge-generator";

export const DAILY_CHALLENGE_CRON_SKIPPED =
  "daily-challenge cron skipped: SUPABASE_SERVICE_ROLE_KEY is not set";

export type DailyChallengeCronResult =
  | { ok: true; created: boolean; id?: string }
  | { ok: false; skipped: true; error: string };

/** Catalog insert is creator_id NULL — service role only. Never fall back to anon. */
export async function runDailyChallengeCron(
  now: Date = new Date(),
): Promise<DailyChallengeCronResult> {
  if (!hasSupabaseAdmin()) {
    const err = new Error(DAILY_CHALLENGE_CRON_SKIPPED);
    logger.error({ err }, "[cron] daily-challenge skipped — no service role");
    Sentry.captureException(err);
    return { ok: false, skipped: true, error: DAILY_CHALLENGE_CRON_SKIPPED };
  }
  const result = await createDailyChallengeIfMissing(getSupabaseAdmin(), now);
  return { ok: true, created: result.created, id: result.id };
}
