/**
 * Re-exports shared Ready Start helpers.
 * Prefer `@/lib/ready-start` — kept so existing imports keep resolving.
 */
export {
  decideReadyStart,
  decideReadyStart as decidePhotoReadyStart,
  formatOpensAtLabel,
  type ReadyStartDecision,
  type ReadyStartDecision as PhotoReadyStartDecision,
} from "./ready-start";
