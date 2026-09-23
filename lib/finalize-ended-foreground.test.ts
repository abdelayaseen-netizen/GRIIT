import { beforeEach, describe, expect, it, vi } from "vitest";

const trpcMutate = vi.fn();
const trpcQuery = vi.fn();
const captureError = vi.fn();
const invalidateQueries = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpcMutate: (...args: unknown[]) => trpcMutate(...args),
  trpcQuery: (...args: unknown[]) => trpcQuery(...args),
}));

vi.mock("@/lib/sentry", () => ({
  captureError: (...args: unknown[]) => captureError(...args),
}));

vi.mock("@/lib/query-client", () => ({
  queryClient: {
    invalidateQueries: (...args: unknown[]) => invalidateQueries(...args),
  },
}));

import { runFinalizeEndedOnForeground } from "@/lib/finalize-ended-foreground";

const USER = "11111111-1111-4111-8111-111111111111";
const UNSEEN = [{ id: "ac-1", challenge_id: "ch-1", status: "completed" }];

describe("runFinalizeEndedOnForeground", () => {
  beforeEach(() => {
    trpcMutate.mockReset();
    trpcQuery.mockReset();
    captureError.mockReset();
    invalidateQueries.mockReset();
  });

  it("finalize throws → end screen still opens when unseen exist", async () => {
    trpcMutate.mockRejectedValue(new Error("finalize failed"));
    trpcQuery.mockResolvedValue(UNSEEN);
    const openEnd = vi.fn();
    await runFinalizeEndedOnForeground({ userId: USER, pathname: "/(tabs)", openEnd });
    expect(captureError).toHaveBeenCalled();
    expect(trpcQuery).toHaveBeenCalledWith("challenges.listUnseenEndings");
    expect(openEnd).toHaveBeenCalledTimes(1);
  });

  it("finalize throws and no unseen → nothing opens", async () => {
    trpcMutate.mockRejectedValue(new Error("finalize failed"));
    trpcQuery.mockResolvedValue([]);
    const openEnd = vi.fn();
    await runFinalizeEndedOnForeground({ userId: USER, pathname: "/(tabs)", openEnd });
    expect(openEnd).not.toHaveBeenCalled();
  });

  it("both succeed → opens once", async () => {
    trpcMutate.mockResolvedValue({ ok: true });
    trpcQuery.mockResolvedValue(UNSEEN);
    const openEnd = vi.fn();
    await runFinalizeEndedOnForeground({ userId: USER, pathname: "/(tabs)", openEnd });
    expect(captureError).not.toHaveBeenCalled();
    expect(openEnd).toHaveBeenCalledTimes(1);
  });
});
