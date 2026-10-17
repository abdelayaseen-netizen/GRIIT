/**
 * Build 90 chunk 09: the STRAVA_AUTO_VERIFY flag on the server.
 * The client constant (lib/feature-flags.ts) is the default; env STRAVA_AUTO_VERIFY=true turns
 * the webhook on without a code change. Off: events are acknowledged and dropped.
 */
import { FLAGS } from "../../lib/feature-flags";

export function isStravaAutoVerifyEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const raw = (env.STRAVA_AUTO_VERIFY ?? "").trim().toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  const flag: boolean = FLAGS.STRAVA_AUTO_VERIFY;
  return flag;
}
