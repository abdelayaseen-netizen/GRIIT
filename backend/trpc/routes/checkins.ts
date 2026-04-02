/** checkins.complete lives in checkins-core.ts — hard mode: TIME GATE (schedule_window_start), LOCATION GATE (require_location), require_camera_only, clocked_in_at */
import { createTRPCRouter } from "../create-context";
import { checkinsCoreProcedures } from "./checkins-core";

export const checkinsRouter = createTRPCRouter({
  ...checkinsCoreProcedures,
});
