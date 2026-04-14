import { createTRPCRouter } from "./create-context";
/**
 * Public procedures (no auth): auth.signUp, auth.signIn, auth.getSession;
 *   challenges.list, challenges.getFeatured, challenges.getStarterPack, challenges.getById;
 *   leaderboard.getWeekly; feed.list (public read path if configured).
 * All other procedures are protected (require Authorization: Bearer <token>).
 */
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { profilesRouter } from "./routes/profiles";
import { challengesRouter } from "./routes/challenges";
import { checkinsRouter } from "./routes/checkins";
import { startersRouter } from "./routes/starters";
import { streaksRouter } from "./routes/streaks";
import { leaderboardRouter } from "./routes/leaderboard";
import { respectsRouter } from "./routes/respects";
import { nudgesRouter } from "./routes/nudges";
import { notificationsRouter } from "./routes/notifications";
import { accountabilityRouter } from "./routes/accountability";
import { feedRouter } from "./routes/feed";
import { achievementsRouter } from "./routes/achievements";
import { integrationsRouter } from "./routes/integrations";
import { sharedGoalRouter } from "./routes/sharedGoal";
import { referralsRouter } from "./routes/referrals";
import { reportsRouter } from "./routes/reports";

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
