import { createTRPCRouter, publicProcedure } from "../create-context";

export const metaRouter = createTRPCRouter({
  version: publicProcedure.query(() => {
    return "1.0.0";
  }),
});
