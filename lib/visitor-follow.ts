import { inlineServerError } from "@/lib/inline-server-error";
import { TRPC } from "@/lib/trpc-paths";

export type VisitorFollowAction = "follow" | "request" | "unfollow";

export type VisitorFollowResult = { ok: true } | { ok: false; message: string };

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function visitorFollowShouldRetryAsRequest(err: unknown): boolean {
  return /requires a follow request/i.test(errorMessage(err));
}

export function visitorFollowShouldRetryAsFollow(err: unknown): boolean {
  return /Use follow for public/i.test(errorMessage(err));
}

export async function runVisitorFollow(args: {
  action: VisitorFollowAction;
  userId: string;
  mutate: (path: string, input: { userId: string }) => Promise<unknown>;
}): Promise<VisitorFollowResult> {
  const first =
    args.action === "unfollow"
      ? TRPC.profiles.unfollowUser
      : args.action === "request"
        ? TRPC.profiles.sendFollowRequest
        : TRPC.profiles.followUser;
  try {
    await args.mutate(first, { userId: args.userId });
    return { ok: true };
  } catch (err) {
    const retryPath = visitorFollowShouldRetryAsRequest(err)
      ? TRPC.profiles.sendFollowRequest
      : visitorFollowShouldRetryAsFollow(err)
        ? TRPC.profiles.followUser
        : null;
    if (retryPath && retryPath !== first) {
      try {
        await args.mutate(retryPath, { userId: args.userId });
        return { ok: true };
      } catch (retryErr) {
        return { ok: false, message: inlineServerError(retryErr) };
      }
    }
    return { ok: false, message: inlineServerError(err) };
  }
}
