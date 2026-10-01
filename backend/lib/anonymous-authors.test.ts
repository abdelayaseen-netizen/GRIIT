import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  anonymousUserIdSet,
  excludeAnonymousUserIds,
  isAnonymousAuthUser,
} from "./anonymous-authors";

describe("anonymous authors", () => {
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
});
