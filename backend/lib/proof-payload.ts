import { z } from "zod";

/**
 * Strict shape for check_ins.proof_payload_json when written via checkins.complete.
 * Strava uses its own writer path with a different payload — do not widen here
 * until a second complete-path producer exists.
 */
export const photoProofPayloadSchema = z
  .object({
    capturedAt: z.string().datetime(),
    captured_in_app: z.boolean(),
  })
  .strict();

export type PhotoProofPayload = z.infer<typeof photoProofPayloadSchema>;
