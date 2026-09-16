import { describe, expect, it, vi } from "vitest";
import { HOME_BOOTSTRAP_QUERY_KEY } from "@/lib/home-bootstrap-key";
import { followInvalidateKeys, invalidateAfterFollow } from "./follow-invalidate";

describe("followInvalidateKeys", () => {
  it("after followUser, own follow count and home.bootstrap refresh", () => {
    const keys = followInvalidateKeys("me", "them");
    expect(keys).toContainEqual([...HOME_BOOTSTRAP_QUERY_KEY]);
    expect(keys).toContainEqual(["profile", "me", "followCounts"]);
    expect(keys).toContainEqual(["profile", "them", "followCounts"]);
  });
});

describe("invalidateAfterFollow", () => {
  it("invalidates the viewer follow-count key", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);
    await invalidateAfterFollow(
      { invalidateQueries } as never,
      "viewer-1",
      "owner-2",
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["profile", "viewer-1", "followCounts"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: HOME_BOOTSTRAP_QUERY_KEY,
    });
  });
});
