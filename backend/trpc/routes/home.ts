/**
 * Read-only Home aggregate. Calls existing procedure handlers via createCaller.
 * Does not copy query logic. Does not reconcile streaks.
 *
 * listMyActive vs getActive: array (≤50) vs newest single row (or null).
 * getTodayCheckinsForUser vs getTodayCheckins: all ACs, slim columns, profile TZ
 * vs one AC, rich columns, union of task schedule timezones.
 */
import { createTRPCRouter, protectedProcedure, type Context } from "../create-context";
import { profilesRouter } from "./profiles";
import { challengesRouter } from "./challenges";
import { checkinsRouter } from "./checkins";
import { streaksRouter } from "./streaks";

export async function runHomeBootstrap(ctx: Context & { userId: string }) {
  const profiles = profilesRouter.createCaller(ctx);
  const challenges = challengesRouter.createCaller(ctx);
  const checkins = checkinsRouter.createCaller(ctx);
  const streaks = streaksRouter.createCaller(ctx);

  const [
    profile,
    stats,
    activeChallenges,
    activeChallenge,
    todayCheckinsForUser,
    securedDateKeys,
    freezeStatus,
    followCounts,
  ] = await Promise.all([
    profiles.get(),
    profiles.getStats(),
    challenges.listMyActive(),
    challenges.getActive(),
    checkins.getTodayCheckinsForUser(),
    profiles.getSecuredDateKeys(),
    streaks.getFreezeStatus(),
    profiles.getFollowCounts({ userId: ctx.userId }),
  ]);

  const activeId =
    activeChallenge && typeof activeChallenge === "object" && "id" in activeChallenge
      ? String((activeChallenge as { id: unknown }).id)
      : "";

  const todayCheckins = activeId
    ? await checkins.getTodayCheckins({ activeChallengeId: activeId })
    : [];

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
  };
}

export const homeRouter = createTRPCRouter({
  bootstrap: protectedProcedure.query(({ ctx }) => runHomeBootstrap(ctx)),
});
