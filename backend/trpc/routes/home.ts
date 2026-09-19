/**
 * Read-only Home aggregate. Calls existing procedure handlers via createCaller.
 * Does not copy query logic. Does not reconcile streaks.
 *
 * listMyActive vs getActive: array (≤50) vs newest single row (or null).
 * getTodayCheckinsForUser vs getTodayCheckins: all ACs, slim columns, profile TZ
 * vs one AC, rich columns, union of task schedule timezones.
 *
 * Each section is allSettled: a throw becomes null + `failed` + Sentry, never 5xx.
 */
import * as Sentry from "@sentry/node";
import { createTRPCRouter, protectedProcedure, type Context } from "../create-context";
import { reportError } from "../../lib/error-reporting";
import { profilesRouter } from "./profiles";
import { challengesRouter } from "./challenges";
import { checkinsRouter } from "./checkins";
import { streaksRouter } from "./streaks";

export const HOME_BOOTSTRAP_SECTIONS = [
  "profile",
  "stats",
  "activeChallenges",
  "activeChallenge",
  "todayCheckinsForUser",
  "todayCheckins",
  "securedDateKeys",
  "freezeStatus",
  "followCounts",
] as const;

export type HomeBootstrapSection = (typeof HOME_BOOTSTRAP_SECTIONS)[number];

function captureSectionFailure(
  name: HomeBootstrapSection,
  reason: unknown,
  ctx: Context & { userId: string }
): void {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  Sentry.captureException(err, { tags: { path: `home.bootstrap.${name}` } });
  reportError({
    requestId: ctx.requestId,
    path: `home.bootstrap.${name}`,
    userId: ctx.userId,
    code: "SECTION_FAILED",
    message: err.message,
    ts: new Date().toISOString(),
  });
}

function takeSettled<T>(
  result: PromiseSettledResult<T>,
  name: HomeBootstrapSection,
  failed: string[],
  ctx: Context & { userId: string }
): T | null {
  if (result.status === "fulfilled") return result.value;
  captureSectionFailure(name, result.reason, ctx);
  failed.push(name);
  return null;
}

export async function runHomeBootstrap(ctx: Context & { userId: string }) {
  const profiles = profilesRouter.createCaller(ctx);
  const challenges = challengesRouter.createCaller(ctx);
  const checkins = checkinsRouter.createCaller(ctx);
  const streaks = streaksRouter.createCaller(ctx);

  const settled = await Promise.allSettled([
    profiles.get(),
    profiles.getStats(),
    challenges.listMyActive(), // Today: applyEnrollmentWindow inside listMyActive
    challenges.getActive(),
    checkins.getTodayCheckinsForUser(),
    profiles.getSecuredDateKeys(),
    streaks.getFreezeStatus(),
    profiles.getFollowCounts({ userId: ctx.userId }),
  ]);

  const failed: string[] = [];
  const profile = takeSettled(settled[0], "profile", failed, ctx);
  const stats = takeSettled(settled[1], "stats", failed, ctx);
  const activeChallenges = takeSettled(settled[2], "activeChallenges", failed, ctx);
  const activeChallenge = takeSettled(settled[3], "activeChallenge", failed, ctx);
  const todayCheckinsForUser = takeSettled(settled[4], "todayCheckinsForUser", failed, ctx);
  const securedDateKeys = takeSettled(settled[5], "securedDateKeys", failed, ctx);
  const freezeStatus = takeSettled(settled[6], "freezeStatus", failed, ctx);
  const followCounts = takeSettled(settled[7], "followCounts", failed, ctx);

  const activeId =
    activeChallenge && typeof activeChallenge === "object" && "id" in activeChallenge
      ? String((activeChallenge as { id: unknown }).id)
      : "";

  let todayCheckins: unknown = [];
  if (activeId) {
    const [checkinsSettled] = await Promise.allSettled([
      checkins.getTodayCheckins({ activeChallengeId: activeId }),
    ]);
    todayCheckins = takeSettled(checkinsSettled, "todayCheckins", failed, ctx);
  }

  return {
    profile,
    stats,
    activeChallenges,
    activeChallenge,
    todayCheckinsForUser,
    todayCheckins,
    securedDateKeys,
    freezeStatus,
    followCounts,
    failed,
  };
}

export const homeRouter = createTRPCRouter({
  bootstrap: protectedProcedure.query(({ ctx }) => runHomeBootstrap(ctx)),
});
