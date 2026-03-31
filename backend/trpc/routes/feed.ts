import { createTRPCRouter } from "../create-context";
import { feedCoreProcedures } from "./feed-core";
import { feedSocialProcedures } from "./feed-social";

export const feedRouter = createTRPCRouter({
  ...feedCoreProcedures,
  ...feedSocialProcedures,
});
