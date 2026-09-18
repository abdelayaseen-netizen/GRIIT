import { describe, expect, it } from "vitest";
import { countFriendsPostedAway, friendsPostedAwayLine } from "@/lib/home-away-count";

describe("countFriendsPostedAway", () => {
  it("excludes posts where author_id is the current user", () => {
    expect(
      countFriendsPostedAway(
        [{ author_id: "me", userId: "me" }, { author_id: "friend", userId: "friend" }],
        "me",
        ["friend"],
      ),
    ).toBe(1);
  });

  it("is zero when only the current user posted", () => {
    expect(countFriendsPostedAway([{ author_id: "me" }], "me", ["friend"])).toBe(0);
  });

  it("counts only followed authors", () => {
    expect(
      countFriendsPostedAway(
        [{ author_id: "stranger" }, { author_id: "friend" }],
        "me",
        ["friend"],
      ),
    ).toBe(1);
  });
});

describe("friendsPostedAwayLine", () => {
  it("hides at 0, singular at 1, plural after", () => {
    expect(friendsPostedAwayLine(0)).toBeNull();
    expect(friendsPostedAwayLine(1)).toBe("1 friend posted while you were away.");
    expect(friendsPostedAwayLine(3)).toBe("3 friends posted while you were away.");
  });
});
