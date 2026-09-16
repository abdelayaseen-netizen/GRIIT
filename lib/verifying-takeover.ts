export const VERIFYING_TAKEOVER_MS = 800;

export function shouldMountVerifyingTakeover(elapsedMs: number): boolean {
  return elapsedMs >= VERIFYING_TAKEOVER_MS;
}
