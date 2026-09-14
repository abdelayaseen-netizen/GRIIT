import { beforeEach, describe, expect, it, vi } from "vitest";

const trpcQuery = vi.fn<(path: string, input?: unknown) => Promise<unknown>>();

vi.mock("@/lib/trpc", () => ({
  trpcQuery: (path: string, input?: unknown) =>
    input === undefined ? trpcQuery(path) : trpcQuery(path, input),
}));

import { readOwnProfileOnce } from "@/lib/profile-read";

describe("readOwnProfileOnce", () => {
  beforeEach(() => {
    trpcQuery.mockReset();
  });

  it("profiles.get NOT_FOUND → one call, error state rendered", async () => {
    const err = Object.assign(new Error("tRPC query failed: profiles.get (404)"), {
      data: { code: "NOT_FOUND" },
    });
    trpcQuery.mockRejectedValue(err);
    const state = await readOwnProfileOnce();
    expect(trpcQuery).toHaveBeenCalledTimes(1);
    expect(trpcQuery).toHaveBeenCalledWith("profiles.get");
    expect(state).toEqual({ status: "error", error: err });
  });
});
