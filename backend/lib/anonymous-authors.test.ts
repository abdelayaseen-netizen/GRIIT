import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ANON_AUTHOR_CACHE_TTL_MS,
  anonymousUserIdSet,
  clearAnonymousAuthorCache,
  excludeAnonymousUserIds,
  isAnonymousAuthUser,
} from "./anonymous-authors";

function adminMock(
  getUserById: (id: string) => Promise<{
    data: { user: { is_anonymous?: boolean } | null };
    error?: { message?: string } | null;
  }>,
) {
  return { auth: { admin: { getUserById } } };
}

describe("anonymous authors", () => {
  beforeEach(() => {
    clearAnonymousAuthorCache();
  });

  it("detects auth.users.is_anonymous and never username patterns", () => {
    expect(isAnonymousAuthUser({ is_anonymous: true })).toBe(true);
    expect(isAnonymousAuthUser({ is_anonymous: false })).toBe(false);
    expect(isAnonymousAuthUser({})).toBe(false);
    const src = readFileSync(resolve(__dirname, "./anonymous-authors.ts"), "utf8");
    expect(src).toContain("auth.users.is_anonymous");
    expect(src).toContain("admin.getUserById");
    expect(src).not.toMatch(/username.*user_|\/\^user_/);
  });

  it("drops anonymous authors from events and others counts", async () => {
    const admin = {
      auth: {
        admin: {
          getUserById: async (id: string) => ({
            data: {
              user:
                id === "guest-1"
                  ? { is_anonymous: true }
                  : { is_anonymous: false },
            },
            error: null,
          }),
        },
      },
    };
    const anon = await anonymousUserIdSet(admin, ["guest-1", "real-1", "guest-1"]);
    expect([...anon]).toEqual(["guest-1"]);
    const events = [
      { user_id: "guest-1", id: "e1" },
      { user_id: "real-1", id: "e2" },
    ];
    expect(excludeAnonymousUserIds(events, anon)).toEqual([{ user_id: "real-1", id: "e2" }]);
    const others = events.filter((e) => !anon.has(e.user_id)).length;
    expect(others).toBe(1);
  });

  it("Everyone feed and featured others_count use the admin flag", () => {
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const discover = readFileSync(
      resolve(__dirname, "../trpc/routes/challenges-discover.ts"),
      "utf8",
    );
    expect(feed).toContain("anonymousUserIdSet");
    expect(feed).toMatch(/scope === "everyone"[\s\S]*anonymousUserIdSet|anonymousUserIdSet[\s\S]*everyone/);
    expect(discover).toContain("anonymousUserIdSet");
    expect(discover).toContain("others_count");
  });

  it("second call within TTL makes zero admin calls", async () => {
    const getUserById = vi.fn(async (id: string) => ({
      data: { user: { is_anonymous: id === "guest-1" } },
      error: null,
    }));
    const admin = adminMock(getUserById);
    const first = await anonymousUserIdSet(admin, ["guest-1", "real-1"], 1_000);
    expect([...first]).toEqual(["guest-1"]);
    expect(getUserById).toHaveBeenCalledTimes(2);
    getUserById.mockClear();
    const second = await anonymousUserIdSet(admin, ["guest-1", "real-1"], 1_000 + 60_000);
    expect([...second]).toEqual(["guest-1"]);
    expect(getUserById).toHaveBeenCalledTimes(0);
  });

  it("expired entry re-fetches", async () => {
    const getUserById = vi.fn(async () => ({
      data: { user: { is_anonymous: true } },
      error: null,
    }));
    const admin = adminMock(getUserById);
    await anonymousUserIdSet(admin, ["guest-1"], 0);
    expect(getUserById).toHaveBeenCalledTimes(1);
    getUserById.mockClear();
    const again = await anonymousUserIdSet(
      admin,
      ["guest-1"],
      ANON_AUTHOR_CACHE_TTL_MS + 1,
    );
    expect([...again]).toEqual(["guest-1"]);
    expect(getUserById).toHaveBeenCalledTimes(1);
  });

  it("lookup error is not cached and is treated as not anonymous", async () => {
    const getUserById = vi
      .fn()
      .mockRejectedValueOnce(new Error("admin down"))
      .mockResolvedValueOnce({
        data: { user: { is_anonymous: true } },
        error: null,
      });
    const admin = adminMock(getUserById);
    const first = await anonymousUserIdSet(admin, ["guest-1"], 5_000);
    expect([...first]).toEqual([]);
    expect(getUserById).toHaveBeenCalledTimes(1);
    const second = await anonymousUserIdSet(admin, ["guest-1"], 5_000);
    expect([...second]).toEqual(["guest-1"]);
    expect(getUserById).toHaveBeenCalledTimes(2);
  });
});
