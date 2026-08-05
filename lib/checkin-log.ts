/**
 * Client Secured meta for check-in (mirrors backend standing cut).
 * Only claim "On location" when a GPS target was configured and used.
 */
export function formatCheckinSecuredMeta(hasLocationTarget = true): string {
  return hasLocationTarget ? "On location" : "Checked in";
}
