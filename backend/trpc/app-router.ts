import { createTRPCRouter } from "./create-context";
/**
 * Public procedures (no auth): auth.signUp, auth.signIn, auth.getSession;
 *   challenges.list, challenges.getFeatured, challenges.getStarterPack, challenges.getById;
 *   leaderboard.getWeekly; feed.list (public read path if configured).
 * All other procedures are protected (require Authorization: Bearer <token>).
 *
 * Sub-routers are loaded sequentially (dynamic import) so Deploy Logs show which
 * import fails or hangs during Railway diagnosis.
 */
console.log("[app-router] loading sub-routers");

console.log("[app-router] importing auth");
const { authRouter } = await import("./routes/auth");
console.log("[app-router] importing user");
const { userRouter } = await import("./routes/user");
console.log("[app-router] importing profiles");
const { profilesRouter } = await import("./routes/profiles");
console.log("[app-router] importing challenges");
const { challengesRouter } = await import("./routes/challenges");
console.log("[app-router] importing checkins");
const { checkinsRouter } = await import("./routes/checkins");
console.log("[app-router] importing starters");
const { startersRouter } = await import("./routes/starters");
console.log("[app-router] importing streaks");
const { streaksRouter } = await import("./routes/streaks");
console.log("[app-router] importing leaderboard");
const { leaderboardRouter } = await import("./routes/leaderboard");
console.log("[app-router] importing respects");
const { respectsRouter } = await import("./routes/respects");
console.log("[app-router] importing nudges");
const { nudgesRouter } = await import("./routes/nudges");
console.log("[app-router] importing notifications");
const { notificationsRouter } = await import("./routes/notifications");
console.log("[app-router] importing accountability");
const { accountabilityRouter } = await import("./routes/accountability");
console.log("[app-router] importing feed");
const { feedRouter } = await import("./routes/feed");
console.log("[app-router] importing achievements");
const { achievementsRouter } = await import("./routes/achievements");
console.log("[app-router] importing integrations");
const { integrationsRouter } = await import("./routes/integrations");
console.log("[app-router] importing sharedGoal");
const { sharedGoalRouter } = await import("./routes/sharedGoal");
console.log("[app-router] importing referrals");
const { referralsRouter } = await import("./routes/referrals");
console.log("[app-router] importing reports");
const { reportsRouter } = await import("./routes/reports");

console.log("[app-router] all sub-routers loaded, building appRouter");

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
