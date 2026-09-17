import { describe, expect, it } from "vitest";
import { DS_V3 } from "@/lib/design-system";
import { COMMENT_AVATAR_SIZE, commentRowParts } from "@/lib/comment-row";

describe("CommentRow", () => {
  it("uses avatar 32, not MemberRow 40", () => {
    expect(COMMENT_AVATAR_SIZE).toBe(32);
    expect(COMMENT_AVATAR_SIZE).toBe(DS_V3.size.avatar.xs);
    expect(COMMENT_AVATAR_SIZE).not.toBe(DS_V3.size.avatar.sm);
  });

  it("keeps name and time as a baseline pair, body below", () => {
    const row = commentRowParts({
      displayName: "Maya",
      username: "maya",
      createdAt: "2026-09-17T12:00:00.000Z",
      text: "Keep going.",
      formatTime: () => "2h",
    });
    expect(row.name).toBe("Maya");
    expect(row.time).toBe("2h");
    expect(row.body).toBe("Keep going.");
    expect(row.avatarSize).toBe(32);
    expect(`${row.name} ${row.time}`).not.toBe(row.body);
  });

  it("falls back to username when display name is empty", () => {
    expect(
      commentRowParts({
        displayName: "  ",
        username: "maya",
        createdAt: "2026-09-17T12:00:00.000Z",
        text: "Nice.",
        formatTime: () => "just now",
      }).name,
    ).toBe("maya");
  });
});
