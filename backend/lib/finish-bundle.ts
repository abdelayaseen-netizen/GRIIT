/**
 * One finish request completes the task, secures the day when it is the last
 * required task, and applies a share choice when one was sent.
 * secureDay and shareProof stay as their own procedures for older builds.
 *
 * Build 90 01b.2: secure and share no longer wait for each other. The secure
 * starts at once; the share starts as soon as the event id is known.
 */
export async function bundleTaskFinish<T>(args: {
  requiredRemaining: number;
  applyShare: boolean;
  /** The activity row's id when one was written (or a thunk that writes it and resolves to the id). */
  eventId: string | null | (() => Promise<string | null>);
  secure: () => Promise<T>;
  share: (eventId: string) => Promise<void>;
}): Promise<{ daySecure: T | null; daySecureAttempted: boolean; shared: boolean; eventId: string | null }> {
  const daySecureAttempted = args.requiredRemaining === 0;
  const securePromise: Promise<T | null> = daySecureAttempted
    ? args.secure().catch(() => null)
    : Promise.resolve(null);
  const eventPromise: Promise<string | null> =
    typeof args.eventId === "function" ? args.eventId().catch(() => null) : Promise.resolve(args.eventId);
  const sharedPromise = eventPromise.then((eventId) =>
    args.applyShare && eventId ? args.share(eventId).then(() => true, () => false) : false,
  );
  const [daySecure, shared, eventId] = await Promise.all([securePromise, sharedPromise, eventPromise]);
  return { daySecure, daySecureAttempted, shared, eventId };
}
