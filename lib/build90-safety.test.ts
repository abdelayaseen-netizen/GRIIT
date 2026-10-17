/**
 * Build 90 chunk 07 (client side): blocked-text messages land under the right field,
 * a reported comment disappears for the reporter at once and stays hidden, and the
 * legacy create-profile screen goes through the server.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (k: string) => store.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
  },
}));
const trpcQuery = vi.fn();
vi.mock("@/lib/trpc", () => ({ trpcQuery: (...args: unknown[]) => trpcQuery(...args), trpcMutate: vi.fn() }));
vi.mock("@/lib/sentry", () => ({ captureError: vi.fn() }));

import { BLOCKED_TEXT, blockedFieldFromMessage, blockedTextFor, isBlockedTextMessage } from "./blocked-text";
import {
  COMMENT_REPORTED,
  REPORT_COMMENT_LABEL,
  commentIdFromReportDetails,
  commentLongPressAction,
  commentReportDetails,
  withoutComments,
} from "./comment-report";
import {
  HIDDEN_COMMENTS_KEY,
  fetchComments,
  hideComment,
  loadHiddenCommentIds,
  parseHiddenCommentIds,
  resetHiddenCommentsForTests,
  unhideComment,
} from "./hidden-comments";
import { LAUNCH_FAILED_BODY, LAUNCH_FIX_WORDS, LAUNCH_RETRY, launchErrorCopy } from "./create-review";

const read = (rel: string) => readFileSync(resolve(__dirname, rel), "utf8");
const ID_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ID_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("07.1 blocked-text messages name the field", () => {
  it("round-trips every field and has no exclamation marks", () => {
    for (const field of ["username", "display name", "bio", "challenge title", "challenge description", "task title", "journal prompt", "location name", "routine", "caption", "comment"] as const) {
      const msg = blockedTextFor(field);
      expect(blockedFieldFromMessage(msg)).toBe(field);
      expect(isBlockedTextMessage(msg)).toBe(true);
      expect(msg).not.toContain("!");
      expect(msg[0]).toBe(msg[0]?.toUpperCase());
    }
    expect(isBlockedTextMessage(BLOCKED_TEXT)).toBe(true);
    expect(blockedFieldFromMessage("Username already taken.")).toBeNull();
    expect(isBlockedTextMessage("Could not launch.")).toBe(false);
  });

  it("the Review step shows the server's words and opens the step that owns the field", () => {
    expect(launchErrorCopy(blockedTextFor("challenge title"))).toEqual({
      heading: "Could not launch",
      body: blockedTextFor("challenge title"),
      actionLabel: LAUNCH_FIX_WORDS,
      editStep: 1,
    });
    expect(launchErrorCopy(blockedTextFor("task title")).editStep).toBe(2);
    expect(launchErrorCopy(blockedTextFor("journal prompt")).editStep).toBe(2);
    // Other server sentences are shown as they are; a transport failure keeps the generic line.
    expect(launchErrorCopy("Your challenge needs at least one daily task.")).toMatchObject({
      body: "Your challenge needs at least one daily task.",
      actionLabel: LAUNCH_RETRY,
      editStep: null,
    });
    expect(launchErrorCopy("tRPC mutation failed: challenges.create — invalid JSON response").body).toBe(LAUNCH_FAILED_BODY);
    expect(launchErrorCopy("Network request failed").body).toBe(LAUNCH_FAILED_BODY);
    expect(launchErrorCopy("").body).toBe(LAUNCH_FAILED_BODY);
  });

  it("StepReview renders launchErrorCopy and the wizard passes launchError", () => {
    const review = read("../components/create/v2/StepReview.tsx");
    expect(review).toContain("launchErrorCopy(launchError)");
    expect(review).toContain("heading={failure.heading}");
    expect(review).toContain("body={failure.body}");
    expect(review).toContain("onEditStep(failure.editStep");
    const wizard = read("../components/create/CreateWizardV2.tsx");
    expect(wizard).toContain("launchError={launchError}");
  });

  it("both comment composers show the refused message under the field and keep the draft", () => {
    for (const rel of ["../components/feed/CommentsSheet.tsx", "../app/post/[id]/index.tsx"]) {
      const src = read(rel);
      expect(src).toMatch(/setSendError\(e instanceof Error && e\.message \? e\.message/);
      expect(src).toContain("{sendError ?? reportComment.notice}");
      expect(src).not.toMatch(/onError: \(e\) => \{\s*captureError\(e, "(CommentsSheetSend|PostThreadComment)"\);\s*\},/);
      expect(src).not.toMatch(/onError[\s\S]{0,200}setDraft\(""\)/);
    }
  });

  it("the legacy create-profile screen saves through profiles.create, not a direct upsert", () => {
    const src = read("../app/create-profile.tsx");
    expect(src).toContain("trpcMutate(TRPC.profiles.create");
    expect(src).not.toMatch(/from\("profiles"\)\.upsert/);
  });
});

describe("07.3 report a comment", () => {
  beforeEach(() => {
    store.clear();
    trpcQuery.mockReset();
    resetHiddenCommentsForTests();
  });

  it("details name the comment and the server can read the id back", () => {
    const details = commentReportDetails(ID_A, "  nice   walk, loser  ");
    expect(details).toBe(`comment:${ID_A} nice walk, loser`);
    expect(commentIdFromReportDetails(details)).toBe(ID_A);
    expect(commentIdFromReportDetails("post-1")).toBeNull();
    expect(commentIdFromReportDetails(`comment:not-a-uuid x`)).toBeNull();
    expect(commentReportDetails(ID_A, "x".repeat(300)).length).toBeLessThanOrEqual(`comment:${ID_A} `.length + 120);
  });

  it("long press: your own comment deletes, someone else's reports, signed out nothing", () => {
    expect(commentLongPressAction("me", "me")).toBe("delete");
    expect(commentLongPressAction("me", "them")).toBe("report");
    expect(commentLongPressAction(null, "them")).toBeNull();
  });

  it("hidden ids persist and every list fetch drops them", async () => {
    trpcQuery.mockResolvedValue([
      { id: ID_A, text: "nice walk, loser" },
      { id: ID_B, text: "well done" },
    ]);
    expect((await fetchComments("ev")).map((r) => r.id)).toEqual([ID_A, ID_B]);
    await hideComment(ID_A);
    expect((await fetchComments("ev")).map((r) => r.id)).toEqual([ID_B]);
    expect(parseHiddenCommentIds(store.get(HIDDEN_COMMENTS_KEY) ?? null).has(ID_A)).toBe(true);
    // A cold start reads the same set back.
    resetHiddenCommentsForTests();
    expect((await loadHiddenCommentIds()).has(ID_A)).toBe(true);
    await unhideComment(ID_A);
    expect((await fetchComments("ev")).map((r) => r.id)).toEqual([ID_A, ID_B]);
  });

  it("parseHiddenCommentIds survives junk", () => {
    expect(parseHiddenCommentIds(null).size).toBe(0);
    expect(parseHiddenCommentIds("{").size).toBe(0);
    expect([...parseHiddenCommentIds(JSON.stringify([ID_A, 3, null]))]).toEqual([ID_A]);
    expect(withoutComments([{ id: "x" }], new Set()).length).toBe(1);
  });

  it("the hook hides first, then files the report, and both lists offer it on long press", () => {
    const hook = read("../components/feed/useReportComment.ts");
    const hideAt = hook.indexOf("await hideComment(commentId)");
    const fileAt = hook.indexOf("TRPC.reports.reportComment");
    expect(hideAt).toBeGreaterThan(0);
    expect(fileAt).toBeGreaterThan(hideAt);
    expect(hook).toContain("unhideComment(commentId)");
    expect(hook).toContain("COMMENT_REPORTED");
    expect(COMMENT_REPORTED).toBe("Reported. The comment is hidden for you.");
    for (const rel of ["../components/feed/CommentsSheet.tsx", "../app/post/[id]/index.tsx"]) {
      const src = read(rel);
      expect(src).toContain("fetchComments(");
      expect(src).toContain("commentLongPressAction(user?.id, item.user_id)");
      expect(src).toContain("accessibilityLabel={REPORT_COMMENT_LABEL}");
    }
    expect(REPORT_COMMENT_LABEL).toBe("Report comment");
    const feed = read("../components/LiveFeedSection.tsx");
    expect(feed).toContain("fetchComments(p.id");
    expect(feed).not.toContain("TRPC.feed.getComments");
  });
});
