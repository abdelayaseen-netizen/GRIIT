/**
 * One finish request completes the task, secures the day when it is the last
 * required task, and applies a share choice when one was sent.
 * secureDay and shareProof stay as their own procedures for older builds.
 */
export async function bundleTaskFinish<T>(args: {
  requiredRemaining: number;
  applyShare: boolean;
  eventId: string | null;
  secure: () => Promise<T>;
  share: (eventId: string) => Promise<void>;
}): Promise<{ daySecure: T | null; daySecureAttempted: boolean; shared: boolean }> {
  let daySecure: T | null = null;
  let daySecureAttempted = false;
  if (args.requiredRemaining === 0) {
    daySecureAttempted = true;
    try {
      daySecure = await args.secure();
    } catch {
      daySecure = null;
    }
  }
  let shared = false;
  if (args.applyShare && args.eventId) {
    try {
      await args.share(args.eventId);
      shared = true;
    } catch {
      shared = false;
    }
  }
  return { daySecure, daySecureAttempted, shared };
}
