/**
 * Pack-level Strava requirement detector.
 *
 * Returns true if any task in the pack has been authored to require Strava
 * verification — either via the modern `verificationMethod === "strava_activity"`
 * config field or the older `require_strava: true` flag.
 */

import type { ChallengePackDef } from "@/lib/challenge-packs";

export function packRequiresStrava(pack: ChallengePackDef): boolean {
  return pack.tasks.some((t) => {
    const cfg = t.config as Record<string, unknown>;
    return cfg.verificationMethod === "strava_activity" || cfg.require_strava === true;
  });
}
