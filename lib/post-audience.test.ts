import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  audienceShowsInScope,
  canSeePostAudience,
  profilePostVisible,
  createsActivityPost,
  postButtonLabel,
  shareStateForAudience,
  audiencePublishes,
} from "./post-audience";

describe("post audience", () => {
  it("labels the button for each choice", () => {
    expect(postButtonLabel("friends")).toBe("Post to friends");
    expect(postButtonLabel("everyone")).toBe("Post to everyone");
    expect(postButtonLabel("only_me")).toBe("Save privately");
  });

  it("publishes friends and everyone, and keeps Only me", () => {
    expect(audiencePublishes("friends")).toBe(true);
    expect(audiencePublishes("everyone")).toBe(true);
    expect(audiencePublishes("only_me")).toBe(false);
    expect(audiencePublishes(null)).toBe(false);
  });

  it("keeps Only me off the shared feed", () => {
    expect(shareStateForAudience("friends")).toBe("shared");
    expect(shareStateForAudience("everyone")).toBe("shared");
    expect(shareStateForAudience("only_me")).toBe("kept");
  });

  it("hides friends-only posts from the Everyone scope", () => {
    expect(audienceShowsInScope("friends", "everyone")).toBe(false);
    expect(audienceShowsInScope("friends", "following")).toBe(true);
    expect(audienceShowsInScope("everyone", "everyone")).toBe(true);
    expect(audienceShowsInScope(undefined, "everyone")).toBe(true);
  });

  it("lets friends see a friends post and hides it from everyone else", () => {
    expect(canSeePostAudience({ audience: "friends", viewerId: "a", authorId: "b", isFriend: true })).toBe(true);
    expect(canSeePostAudience({ audience: "friends", viewerId: "a", authorId: "b", isFriend: false })).toBe(false);
    expect(canSeePostAudience({ audience: "only_me", viewerId: "b", authorId: "b", isFriend: false })).toBe(true);
    expect(canSeePostAudience({ audience: "only_me", viewerId: "a", authorId: "b", isFriend: true })).toBe(false);
  });

  it("shows the author their Only me post and hides older private rows", () => {
    expect(profilePostVisible({
      shareState: "kept",
      audience: "only_me",
      viewerId: "a",
      authorId: "a",
      isFriend: false,
    })).toBe(true);
    expect(profilePostVisible({
      shareState: "kept",
      audience: null,
      viewerId: "a",
      authorId: "a",
      isFriend: false,
    })).toBe(false);
  });

  it("does not post a self-reported task that has no photo", () => {
    expect(createsActivityPost(true, false)).toBe(false);
    expect(createsActivityPost(true, true)).toBe(true);
    expect(createsActivityPost(false, false)).toBe(true);
  });

  it("wires the choice into the preview and the complete call", () => {
    const review = readFileSync("components/task-v2/steps/ReviewStep.tsx", "utf8");
    const hook = readFileSync("components/task-v2/useTaskFlowV2.ts", "utf8");
    const checkins = readFileSync("backend/trpc/routes/checkins.ts", "utf8");
    const feed = readFileSync("backend/trpc/routes/feed.ts", "utf8");
    expect(review).toContain("postButtonLabel");
    expect(readFileSync("lib/post-audience.ts", "utf8")).toContain("Post to friends");
    expect(hook).toContain('useState<PostAudience>("friends")');
    expect(hook).toContain("audience: audienceRef.current");
    expect(checkins).toContain("createsActivityPost");
    expect(feed).toContain("audienceShowsInScope");
  });
});
