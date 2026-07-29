/**
 * Simple / self-report facts for checkins.complete.
 * No verification rows — client must not show a verifying phase for this type.
 * Facts persist in verification_gates.simple_log.
 */

export type SimpleLogFacts = {
  self_reported: true;
};

export function buildSimpleLogFacts(): SimpleLogFacts {
  return { self_reported: true };
}
