import { describe, expect, it } from "vitest";
import { countFriendsPostedAway } from "@/lib/home-away-count";

describe("countFriendsPostedAway", () => {
  it("excludes posts where author_id is the current user", () => {
    expect(
      countFriendsPostedAway(
        [{ author_id: "me", userId: "me" }, { author_id: "friend", userId: "friend" }],
        "me"
      )
    ).toBe(1);
  });

  it("is zero when only the current user posted", () => {
    expect(countFriendsPostedAway([{ author_id: "me" }], "me")).toBe(0);
  });
});
