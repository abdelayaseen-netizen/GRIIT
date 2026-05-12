import { createTRPCRouter } from "./create-context";
import { logger } from "../lib/logger";

/**
 * Public procedures (no auth): auth.signUp, auth.signIn, auth.getSession;
 *   challenges.list, challenges.getFeatured, challenges.getStarterPack, challenges.getById;
 *   leaderboard.getWeekly; feed.list (public read path if configured).
 * All other procedures are protected (require Authorization: Bearer <token>).
 *
 * Sub-routers are loaded sequentially (dynamic import) so Deploy Logs show which
 * import fails or hangs during Railway diagnosis. logger.debug rather than
 * logger.info so production stays quiet unless LOG_LEVEL=debug.
 */
const log = (msg: string) => logger.debug(msg);

log("[app-router] loading sub-routers");

log("[app-router] importing auth");
const { authRouter } = await import("./routes/auth");
log("[app-router] importing user");
const { userRouter } = await import("./routes/user");
log("[app-router] importing profiles");
const { profilesRouter } = await import("./routes/profiles");
log("[app-router] importing challenges");
const { challengesRouter } = await import("./routes/challenges");
log("[app-router] importing checkins");
const { checkinsRouter } = await import("./routes/checkins");
log("[app-router] importing starters");
const { startersRouter } = await import("./routes/starters");
log("[app-router] importing streaks");
const { streaksRouter } = await import("./routes/streaks");
log("[app-router] importing leaderboard");
const { leaderboardRouter } = await import("./routes/leaderboard");
log("[app-router] importing respects");
const { respectsRouter } = await import("./routes/respects");
log("[app-router] importing nudges");
const { nudgesRouter } = await import("./routes/nudges");
log("[app-router] importing notifications");
const { notificationsRouter } = await import("./routes/notifications");
log("[app-router] importing accountability");
const { accountabilityRouter } = await import("./routes/accountability");
log("[app-router] importing feed");
const { feedRouter } = await import("./routes/feed");
log("[app-router] importing achievements");
const { achievementsRouter } = await import("./routes/achievements");
log("[app-router] importing integrations");
const { integrationsRouter } = await import("./routes/integrations");
log("[app-router] importing sharedGoal");
const { sharedGoalRouter } = await import("./routes/sharedGoal");
log("[app-router] importing referrals");
const { referralsRouter } = await import("./routes/referrals");
log("[app-router] importing reports");
const { reportsRouter } = await import("./routes/reports");

log("[app-router] all sub-routers loaded, building appRouter");

export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  profiles: profilesRouter,
  challenges: challengesRouter,
  checkins: checkinsRouter,
  starters: startersRouter,
  streaks: streaksRouter,
  leaderboard: leaderboardRouter,
  respects: respectsRouter,
  nudges: nudgesRouter,
  notifications: notificationsRouter,
  accountability: accountabilityRouter,
  feed: feedRouter,
  achievements: achievementsRouter,
  integrations: integrationsRouter,
  sharedGoal: sharedGoalRouter,
  referrals: referralsRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
