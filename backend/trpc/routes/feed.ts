import { createTRPCRouter, publicProcedure } from "../create-context";

export const feedRouter = createTRPCRouter({
  list: publicProcedure.query(() => {
    return [] as { id: string; [key: string]: unknown }[];
  }),
});
