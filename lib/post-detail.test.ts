import { describe, expect, it } from "vitest";
import {
  COMMENT_PLACEHOLDER,
  COMMENTS_EMPTY,
  COMMENTS_HEADING,
  composerFieldGround,
  commentsCountLabel,
  commentsSectionKind,
  completionLine,
  postDetailLoading,
  postDetailStamp,
  sendComposerArmed,
} from "@/lib/post-detail";

describe("sendComposerArmed", () => {
  it("is unarmed on empty or whitespace", () => {
    expect(sendComposerArmed("")).toBe(false);
    expect(sendComposerArmed("   ")).toBe(false);
  });

  it("is armed once there is text", () => {
    expect(sendComposerArmed("nice")).toBe(true);
    expect(sendComposerArmed("  go  ")).toBe(true);
  });
});

describe("postDetailStamp", () => {
  it("passes Verified when the completion has camera proof", () => {
    expect(
      postDetailStamp({ proofPhotoUrl: "https://cdn.example/p.jpg" }),
    ).toBe("Verified");
    expect(
      postDetailStamp({ hasProof: true, photoUrl: "https://cdn.example/p.jpg" }),
    ).toBe("Verified");
  });

  it("passes nothing on self-reported, ignoring verified/require_photo", () => {
    expect(postDetailStamp({ hasProof: false, photoUrl: null })).toBeUndefined();
    expect(
      postDetailStamp({
        hasProof: false,
        photoUrl: null,
        proofPhotoUrl: null,
      }),
    ).toBeUndefined();
  });
});

describe("comments section render", () => {
  it("is loading when the post has not arrived", () => {
    expect(postDetailLoading({ postPending: true, hasPost: false })).toBe(true);
    expect(postDetailLoading({ postPending: false, hasPost: true })).toBe(false);
  });

  it("is empty vs list vs loading for comments", () => {
    expect(commentsSectionKind(true, 0)).toBe("loading");
    expect(commentsSectionKind(false, 0)).toBe("empty");
    expect(commentsSectionKind(false, 3)).toBe("list");
    expect(commentsSectionKind(true, 3)).toBe("list");
  });

  it("uses the handoff empty line and comment count", () => {
    expect(COMMENTS_EMPTY).toBe("No comments yet.");
    expect(commentsCountLabel(0)).toBe("0 comments");
    expect(commentsCountLabel(3)).toBe("3 comments");
    expect(COMMENT_PLACEHOLDER).toBe("Add a comment");
    expect(COMMENTS_HEADING).toBe("Comments");
  });
});

describe("composerFieldGround", () => {
  it("inverts the field against its ground", () => {
    expect(composerFieldGround("sheet")).toBe("canvas");
    expect(composerFieldGround("route")).toBe("surface");
  });
});

describe("completionLine", () => {
  it("is {name} completed {task} · {challenge}", () => {
    expect(
      completionLine({
        author: "Maya",
        task: "Outdoor workout",
        challenge: "75 Hard Classic",
      }),
    ).toBe("Maya completed Outdoor workout · 75 Hard Classic");
  });
});
