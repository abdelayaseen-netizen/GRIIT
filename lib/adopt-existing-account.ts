import { noteGuestDistinctId } from "@/lib/analytics-identity";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

export const GUEST_MOVE_FAILED = "Couldn't move today's progress. You're still a guest.";
export const GUEST_MOVE_AFTER_SIGN_IN = "Signed in, but today's guest progress could not be moved.";

/**
 * The Apple ID or email already belongs to an account.
 * Sign into that account, move the guest's enrollment, completions, and proofs, then the server deletes the guest.
 */
export async function adoptExistingAccount(input: {
  guestUserId: string;
  signIn: () => Promise<{ ok: true } | { ok: false; message: string }>;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  noteGuestDistinctId(input.guestUserId);
  let ticket = "";
  try {
    const prepared = (await trpcMutate(TRPC.auth.prepareGuestMerge, {})) as { ticket?: string };
    ticket = prepared?.ticket ?? "";
  } catch {
    return { ok: false, message: GUEST_MOVE_FAILED };
  }
  if (!ticket) return { ok: false, message: GUEST_MOVE_FAILED };

  const signed = await input.signIn();
  if (!signed.ok) return signed;

  try {
    await trpcMutate(TRPC.auth.claimGuestMerge, { ticket });
  } catch {
    return { ok: false, message: GUEST_MOVE_AFTER_SIGN_IN };
  }
  return { ok: true };
}
