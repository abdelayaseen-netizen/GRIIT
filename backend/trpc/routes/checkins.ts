import { createTRPCRouter } from "../create-context";
import { checkinsCoreProcedures } from "./checkins-core";

export const checkinsRouter = createTRPCRouter({
  ...checkinsCoreProcedures,
});
