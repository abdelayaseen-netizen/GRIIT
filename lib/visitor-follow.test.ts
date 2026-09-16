import { describe, expect, it, vi } from "vitest";
import { GENERIC_INLINE_ERROR } from "@/lib/inline-server-error";
import { TRPC } from "@/lib/trpc-paths";
import { runVisitorFollow } from "@/lib/visitor-follow";

describe("runVisitorFollow", () => {
  it("calls followUser for a public Follow tap", async () => {
    const mutate = vi.fn().mockResolvedValue({ success: true });
    const result = await runVisitorFollow({
      action: "follow",
      userId: "11111111-1111-4111-8111-111111111111",
      mutate,
    });
    expect(result).toEqual({ ok: true });
    expect(mutate).toHaveBeenCalledWith(TRPC.profiles.followUser, {
      userId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("retries sendFollowRequest when followUser says the profile needs a request", async () => {
    const mutate = vi
      .fn()
      .mockRejectedValueOnce(new Error("This profile requires a follow request."))
      .mockResolvedValueOnce({ success: true });
    const result = await runVisitorFollow({
      action: "follow",
      userId: "11111111-1111-4111-8111-111111111111",
      mutate,
    });
    expect(result).toEqual({ ok: true });
    expect(mutate).toHaveBeenNthCalledWith(2, TRPC.profiles.sendFollowRequest, {
      userId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("surfaces an inline error when the mutation fails — silence is not allowed", async () => {
    const mutate = vi.fn().mockRejectedValue(new Error("Failed to fetch"));
    const result = await runVisitorFollow({
      action: "follow",
      userId: "11111111-1111-4111-8111-111111111111",
      mutate,
    });
    expect(result).toEqual({ ok: false, message: GENERIC_INLINE_ERROR });
  });

  it("unfollow failure is an inline error, not silence", async () => {
    const mutate = vi.fn().mockRejectedValue(new Error("Failed to fetch"));
    const result = await runVisitorFollow({
      action: "unfollow",
      userId: "11111111-1111-4111-8111-111111111111",
      mutate,
    });
    expect(mutate).toHaveBeenCalledWith(TRPC.profiles.unfollowUser, {
      userId: "11111111-1111-4111-8111-111111111111",
    });
    expect(result).toEqual({ ok: false, message: GENERIC_INLINE_ERROR });
  });

  it("discover request-follow failure is an inline error, not silence", async () => {
    const mutate = vi.fn().mockRejectedValue(new Error("Failed to fetch"));
    const result = await runVisitorFollow({
      action: "request",
      userId: "11111111-1111-4111-8111-111111111111",
      mutate,
    });
    expect(mutate).toHaveBeenCalledWith(TRPC.profiles.sendFollowRequest, {
      userId: "11111111-1111-4111-8111-111111111111",
    });
    expect(result).toEqual({ ok: false, message: GENERIC_INLINE_ERROR });
  });

  it("keeps the server BAD_REQUEST text", async () => {
    const err = Object.assign(new Error("Cannot follow yourself."), {
      data: { code: "BAD_REQUEST" },
    });
    const mutate = vi.fn().mockRejectedValue(err);
    const result = await runVisitorFollow({
      action: "follow",
      userId: "11111111-1111-4111-8111-111111111111",
      mutate,
    });
    expect(result).toEqual({ ok: false, message: "Cannot follow yourself." });
  });
});
