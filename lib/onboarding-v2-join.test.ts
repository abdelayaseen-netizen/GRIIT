import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureAnonymousSession = vi.fn();
const trpcMutate = vi.fn();

vi.mock("@/lib/anon-auth", () => ({
  ensureAnonymousSession: (...args: unknown[]) => ensureAnonymousSession(...args),
}));

vi.mock("@/lib/trpc", () => ({
  trpcMutate: (...args: unknown[]) => trpcMutate(...args),
}));

import { joinFirstChallenge } from "@/lib/onboarding-v2-join";

const UUID = "a1000001-4000-4000-8000-000000000005";

describe("joinFirstChallenge", () => {
  beforeEach(() => {
    ensureAnonymousSession.mockReset();
    trpcMutate.mockReset();
  });

  it("does not join when ensureAnonymousSession fails", async () => {
    ensureAnonymousSession.mockResolvedValue({
      kind: "offline",
      user: null,
      session: null,
      message: "You're offline. Connect and try again.",
      previousAnonUserId: null,
    });
    const res = await joinFirstChallenge(UUID);
    expect(res).toEqual({ ok: false, message: "You're offline. Connect and try again." });
    expect(trpcMutate).not.toHaveBeenCalled();
  });

  it("stays failed when challenges.join throws", async () => {
    ensureAnonymousSession.mockResolvedValue({
      kind: "ok",
      user: { id: "anon-1" },
      session: {},
      message: null,
      previousAnonUserId: "anon-1",
    });
    trpcMutate.mockRejectedValue(new Error("Challenge not found."));
    const res = await joinFirstChallenge(UUID);
    expect(res).toEqual({ ok: false, message: "Challenge not found." });
    expect(trpcMutate).toHaveBeenCalledWith("challenges.join", { challengeId: UUID });
  });

  it("calls ensureAnonymousSession then challenges.join on success", async () => {
    ensureAnonymousSession.mockResolvedValue({
      kind: "ok",
      user: { id: "anon-1" },
      session: {},
      message: null,
      previousAnonUserId: "anon-1",
    });
    trpcMutate.mockResolvedValue({ ok: true });
    const res = await joinFirstChallenge(UUID);
    expect(res).toEqual({ ok: true });
    expect(ensureAnonymousSession).toHaveBeenCalledTimes(1);
    expect(trpcMutate).toHaveBeenCalledWith("challenges.join", { challengeId: UUID });
  });

  it("rejects non-joinable ids without hitting the network", async () => {
    const res = await joinFirstChallenge("fallback-cold-7");
    expect(res.ok).toBe(false);
    expect(ensureAnonymousSession).not.toHaveBeenCalled();
    expect(trpcMutate).not.toHaveBeenCalled();
  });
});
