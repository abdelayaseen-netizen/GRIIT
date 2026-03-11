import { createTRPCRouter, publicProcedure } from "../create-context";

/**
 * Feed router. list is an intentional stub: Home does not call it and instead
 * shows an empty "No activity yet" state plus leaderboard (SuggestedFollows).
 * To implement a real feed later, aggregate from day_secures/respects/activity.
 */
export const feedRouter = createTRPCRouter({
  list: publicProcedure.query(() => {
    return [] as { id: string; [key: string]: unknown }[];
  }),
});
