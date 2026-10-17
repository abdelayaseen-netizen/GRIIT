import { beforeEach, describe, expect, it, vi } from "vitest";

const trpcMutate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpcMutate: (...args: unknown[]) => trpcMutate(...args),
}));

import { adoptExistingAccount } from "@/lib/adopt-existing-account";
import { peekGuestDistinctId } from "@/lib/analytics-identity";

describe("adoptExistingAccount", () => {
  beforeEach(() => {
    trpcMutate.mockReset();
  });

  it("signs into the existing account, then moves the guest progress", async () => {
    const order: string[] = [];
    trpcMutate.mockImplementation(async (path: string) => {
      order.push(path);
      if (String(path).includes("prepare")) return { ticket: "ticket-1" };
      return { ok: true };
    });
    const signIn = vi.fn(async () => {
      order.push("sign-in");
      return { ok: true as const };
    });

    const result = await adoptExistingAccount({ guestUserId: "guest-1", signIn });

    expect(result).toEqual({ ok: true });
    expect(order).toEqual(["auth.prepareGuestMerge", "sign-in", "auth.claimGuestMerge"]);
    expect(peekGuestDistinctId()).toBe("guest-1");
    expect(trpcMutate).toHaveBeenLastCalledWith("auth.claimGuestMerge", { ticket: "ticket-1" });
  });

  it("does not sign in when the move cannot be prepared", async () => {
    trpcMutate.mockRejectedValue(new Error("no admin"));
    const signIn = vi.fn(async () => ({ ok: true as const }));

    const result = await adoptExistingAccount({ guestUserId: "guest-1", signIn });

    expect(result.ok).toBe(false);
    expect(signIn).not.toHaveBeenCalled();
  });
});
