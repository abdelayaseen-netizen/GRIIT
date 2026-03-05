import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { profilesRouter } from "./routes/profiles";
import { challengesRouter } from "./routes/challenges";
import { checkinsRouter } from "./routes/checkins";
import { storiesRouter } from "./routes/stories";
import { startersRouter } from "./routes/starters";
import { streaksRouter } from "./routes/streaks";
import { leaderboardRouter } from "./routes/leaderboard";
import { respectsRouter } from "./routes/respects";
import { nudgesRouter } from "./routes/nudges";
import { notificationsRouter } from "./routes/notifications";
import { accountabilityRouter } from "./routes/accountability";
import { metaRouter } from "./routes/meta";
import { feedRouter } from "./routes/feed";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  profiles: profilesRouter,
  challenges: challengesRouter,
  checkins: checkinsRouter,
  stories: storiesRouter,
  starters: startersRouter,
  streaks: streaksRouter,
  leaderboard: leaderboardRouter,
  respects: respectsRouter,
  nudges: nudgesRouter,
  notifications: notificationsRouter,
  accountability: accountabilityRouter,
  meta: metaRouter,
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
