import { createTRPCRouter } from "./create-context";
import { authRouter } from "./routes/auth";
import { profilesRouter } from "./routes/profiles";
import { challengesRouter } from "./routes/challenges";
import { checkinsRouter } from "./routes/checkins";
import { storiesRouter } from "./routes/stories";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  profiles: profilesRouter,
  challenges: challengesRouter,
  checkins: checkinsRouter,
  stories: storiesRouter,
});

export type AppRouter = typeof appRouter;
