import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canSeeContent, coMemberChallengeIds, isFriend, mutualFriendIds, viewerCanSee } from "./is-friend";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

type Follow = { follower_id: string; following_id: string; status?: string | null };

function followsClient(follows: Follow[]): SupabaseClient {
  return {
    from: (table: string) => {
      const filters: Record<string, string> = {};
      const rows = () => {
        if (table !== "user_follows") return [];
        return follows.filter((f) => {
          if (filters.follower_id && f.follower_id !== filters.follower_id) return false;
          if (filters.following_id && f.following_id !== filters.following_id) return false;
          return true;
        });
      };
      const b: Record<string, unknown> = {};
      b.select = () => b;
      b.eq = (col: string, val: string) => {
        filters[col] = val;
        return b;
      };
      b.limit = () => Promise.resolve({ data: rows(), error: null });
      b.maybeSingle = () => Promise.resolve({ data: rows()[0] ?? null, error: null });
      return b;
    },
  } as unknown as SupabaseClient;
}

describe("canSeeContent", () => {
  it("hides a friends-only post when A follows B only", () => {
    expect(canSeeContent(A, B, "friends", new Set())).toBe(false);
  });

  it("shows a friends-only post when A and B follow each other", () => {
    expect(canSeeContent(A, B, "friends", new Set([B]))).toBe(true);
  });

  it("lets the owner see friends-only and private content", () => {
    expect(canSeeContent(B, B, "friends", new Set())).toBe(true);
    expect(canSeeContent(B, B, "private", new Set())).toBe(true);
  });

  it("leaves public visible without a follow", () => {
    expect(canSeeContent(A, B, "public", new Set())).toBe(true);
  });

  it("keeps private owner-only even when the follow is mutual", () => {
    expect(canSeeContent(A, B, "private", new Set([B]))).toBe(false);
  });

  it("shows a shared group post to a co-member with no follow", () => {
    const group = new Set(["challenge-1"]);
    expect(
      canSeeContent(A, B, "friends", new Set(), {
        challengeId: "challenge-1",
        coMemberChallengeIds: group,
        shared: true,
      }),
    ).toBe(true);
    expect(
      canSeeContent(A, B, "private", new Set(), {
        challengeId: "challenge-1",
        coMemberChallengeIds: group,
        shared: true,
      }),
    ).toBe(true);
  });

  it("does not show an unshared group post to a co-member", () => {
    expect(
      canSeeContent(A, B, "friends", new Set(), {
        challengeId: "challenge-1",
        coMemberChallengeIds: new Set(["challenge-1"]),
        shared: false,
      }),
    ).toBe(false);
  });

  it("hides a friends or private challenge from someone who did not join", () => {
    expect(
      canSeeContent(A, B, "friends", new Set(), {
        challengeId: "challenge-1",
        coMemberChallengeIds: new Set(),
        shared: true,
      }),
    ).toBe(false);
    expect(
      canSeeContent(A, B, "private", new Set(), {
        challengeId: "challenge-1",
        coMemberChallengeIds: new Set(),
        shared: true,
      }),
    ).toBe(false);
  });
});

describe("isFriend", () => {
  it("is false for a one-way accepted follow", async () => {
    const supabase = followsClient([{ follower_id: A, following_id: B, status: "accepted" }]);
    expect(await isFriend(supabase, A, B)).toBe(false);
  });

  it("is true only when both directions are accepted", async () => {
    const supabase = followsClient([
      { follower_id: A, following_id: B, status: "accepted" },
      { follower_id: B, following_id: A, status: "accepted" },
    ]);
    expect(await isFriend(supabase, A, B)).toBe(true);
    expect(await mutualFriendIds(supabase, A)).toEqual(new Set([B]));
  });

  it("ignores a pending reverse follow", async () => {
    const supabase = followsClient([
      { follower_id: A, following_id: B, status: "accepted" },
      { follower_id: B, following_id: A, status: "pending" },
    ]);
    expect(await isFriend(supabase, A, B)).toBe(false);
    expect(await viewerCanSee(supabase, A, B, "friends")).toBe(false);
  });
});

describe("coMemberChallengeIds", () => {
  it("includes active members and active or finished enrollments, once", async () => {
    const CH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const QUIT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const DONE = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const LEFT = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const supabase = {
      from: (table: string) => {
        const b: Record<string, unknown> = {};
        b.select = () => b;
        b.eq = () => b;
        b.limit = () => {
          if (table === "challenge_members") {
            return Promise.resolve({
              data: [
                { challenge_id: CH, status: "active" },
                { challenge_id: QUIT, status: "quit" },
              ],
              error: null,
            });
          }
          return Promise.resolve({
            data: [
              { challenge_id: CH, status: "active" },
              { challenge_id: DONE, status: "completed" },
              { challenge_id: LEFT, status: "abandoned" },
            ],
            error: null,
          });
        };
        return b;
      },
    } as unknown as SupabaseClient;
    expect(await coMemberChallengeIds(supabase, A)).toEqual(new Set([CH, DONE]));
  });
});
