/**
 * Build 90 07.1 / 07.3: every public text field is moderated server-side and a blocked
 * value is rejected *before* any write, with a message that names the field.
 * One test per field. Plus the comment report route and the reporter-side hide.
 */
import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { createTestCaller } from "../create-test-caller";
import { blockedTextFor } from "../../../lib/blocked-text";
import { commentReportDetails } from "../../../lib/comment-report";

vi.mock("../../lib/supabase-server", () => ({ getSupabaseServer: vi.fn(() => null) }));
vi.mock("../../lib/sendPush", () => ({
  sendPush: vi.fn().mockResolvedValue(undefined),
  sendPushToProfile: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../../lib/push", () => ({ sendExpoPush: vi.fn().mockResolvedValue(undefined) }));

import { getSupabaseServer } from "../../lib/supabase-server";

const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const EVENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const COMMENT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const COMMENT_2 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

type Write = { table: string; op: string; row: unknown };

/** Chainable stub: reads return `reads[table]`, every write is recorded. */
function stubDb(reads: Record<string, unknown[]> = {}) {
  const writes: Write[] = [];
  const from = (table: string) => {
    const rows = reads[table] ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = {};
    const self = () => q;
    for (const m of ["select", "eq", "neq", "in", "or", "order", "limit", "gte", "lte", "gt", "lt", "not", "is", "ilike", "like", "range"]) {
      q[m] = self;
    }
    q.maybeSingle = async () => ({ data: rows[0] ?? null, error: null });
    q.single = async () => ({ data: rows[0] ?? null, error: rows[0] ? null : { code: "PGRST116", message: "no rows" } });
    q.then = (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) =>
      Promise.resolve({ data: rows, error: null, count: rows.length }).then(res, rej);
    q.insert = (row: unknown) => {
      writes.push({ table, op: "insert", row });
      return q;
    };
    q.update = (row: unknown) => {
      writes.push({ table, op: "update", row });
      return q;
    };
    q.upsert = (row: unknown) => {
      writes.push({ table, op: "upsert", row });
      return q;
    };
    q.delete = () => {
      writes.push({ table, op: "delete", row: null });
      return q;
    };
    return q;
  };
  return { supabase: { from }, writes };
}

type Caller = {
  profiles: {
    update: (input: Record<string, unknown>) => Promise<unknown>;
    create: (input: Record<string, unknown>) => Promise<unknown>;
  };
  user: { completeOnboarding: (input: Record<string, unknown>) => Promise<unknown> };
  challenges: { create: (input: Record<string, unknown>) => Promise<unknown> };
  feed: {
    comment: (input: Record<string, unknown>) => Promise<unknown>;
    shareCompletion: (input: Record<string, unknown>) => Promise<unknown>;
    getComments: (input: { eventId: string; limit?: number }) => Promise<{ id: string }[]>;
  };
  reports: {
    reportComment: (input: { commentId: string; reason: "other"; details?: string }) => Promise<{
      success: boolean;
      alreadyReported: boolean;
    }>;
  };
};

function caller(reads: Record<string, unknown[]> = {}, userId = ME) {
  const db = stubDb(reads);
  const api = createTestCaller({ userId, supabase: db.supabase }) as unknown as Caller;
  return { api, writes: db.writes };
}

async function rejectsWith(p: Promise<unknown>, message: string) {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(TRPCError);
  expect((err as TRPCError).code).toBe("BAD_REQUEST");
  expect((err as TRPCError).message).toBe(message);
}

const createInput = {
  title: "Morning run club",
  description: "",
  type: "standard" as const,
  durationDays: 30,
  participationType: "solo" as const,
  visibility: "PRIVATE" as const,
  tasks: [{ title: "Run 3 km", type: "simple", required: true }],
};

const profileRow = [{ user_id: ME, username: "me", display_name: "Me", is_test: false }];

describe("07.1 every public text field is moderated before any write", () => {
  it("profiles.update: username", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.profiles.update({ username: "sh1t_user" }), blockedTextFor("username"));
    expect(writes).toEqual([]);
  });
  it("profiles.update: display name", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.profiles.update({ display_name: "F u c k" }), blockedTextFor("display name"));
    expect(writes).toEqual([]);
  });
  it("profiles.update: bio", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.profiles.update({ bio: "a fúck of a bio" }), blockedTextFor("bio"));
    expect(writes).toEqual([]);
  });
  it("profiles.create: username, display name, bio", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.profiles.create({ username: "b1tch_me" }), blockedTextFor("username"));
    await rejectsWith(api.profiles.create({ username: "fine_name", display_name: "d.i.c.k" }), blockedTextFor("display name"));
    await rejectsWith(api.profiles.create({ username: "fine_name", bio: "pu55y cat" }), blockedTextFor("bio"));
    expect(writes).toEqual([]);
  });
  it("user.completeOnboarding: username and display name", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.user.completeOnboarding({ username: "shiiiit" }), blockedTextFor("username"));
    await rejectsWith(api.user.completeOnboarding({ displayName: "c0ck" }), blockedTextFor("display name"));
    expect(writes).toEqual([]);
  });
  it("challenges.create: challenge title", async () => {
    const { api, writes } = caller({ profiles: profileRow });
    await rejectsWith(api.challenges.create({ ...createInput, title: "Sh1t show" }), blockedTextFor("challenge title"));
    expect(writes).toEqual([]);
  });
  it("challenges.create: challenge description", async () => {
    const { api, writes } = caller({ profiles: profileRow });
    await rejectsWith(
      api.challenges.create({ ...createInput, description: "A daily plan, no f.u.c.k.ing excuses allowed." }),
      blockedTextFor("challenge description"),
    );
    expect(writes).toEqual([]);
  });
  it("challenges.create: task title", async () => {
    const { api, writes } = caller({ profiles: profileRow });
    await rejectsWith(
      api.challenges.create({ ...createInput, tasks: [{ title: "Run like a b1tch", type: "simple", required: true }] }),
      blockedTextFor("task title"),
    );
    expect(writes).toEqual([]);
  });
  it("challenges.create: journal prompt, location name, routine", async () => {
    const { api, writes } = caller({ profiles: profileRow });
    await rejectsWith(
      api.challenges.create({ ...createInput, tasks: [{ title: "Write", type: "journal", required: true, journalPrompt: "what the fuuuck happened today" }] }),
      blockedTextFor("journal prompt"),
    );
    await rejectsWith(
      api.challenges.create({ ...createInput, tasks: [{ title: "Gym", type: "simple", required: true, locationName: "a$$ gym" }] }),
      blockedTextFor("location name"),
    );
    await rejectsWith(
      api.challenges.create({ ...createInput, tasks: [{ title: "Gym", type: "simple", required: true, routineAnchorCustom: "after my sh1t coffee" }] }),
      blockedTextFor("routine"),
    );
    expect(writes).toEqual([]);
  });
  it("feed.comment: comment", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.feed.comment({ eventId: EVENT, text: "s h i t post" }), blockedTextFor("comment"));
    expect(writes).toEqual([]);
  });
  it("feed.shareCompletion: caption", async () => {
    const { api, writes } = caller();
    await rejectsWith(api.feed.shareCompletion({ challengeId: EVENT, caption: "fúck yes" }), blockedTextFor("caption"));
    expect(writes).toEqual([]);
  });
  it("clean text in every field is not rejected by moderation", async () => {
    // The stub has no rows, so each call fails later for a *different* reason or
    // succeeds; the point is that none of them throws a blocked-text message.
    const { api } = caller({ profiles: profileRow });
    const outcomes = await Promise.allSettled([
      api.profiles.update({ username: "class_act", display_name: "Scunthorpe", bio: "Cocktail assessor" }),
      api.user.completeOnboarding({ username: "glass_half", displayName: "Bass Player" }),
      api.feed.comment({ eventId: EVENT, text: "massive assist" }),
    ]);
    for (const o of outcomes) {
      if (o.status === "rejected") {
        expect(String((o.reason as Error).message)).not.toMatch(/aren't allowed/);
      }
    }
  });
});

describe("07.3 reports.reportComment", () => {
  const commentRow = { id: COMMENT, user_id: OTHER, event_id: EVENT, text: "nice walk, loser" };

  it("files a user report that names the comment and hides nothing it did not write", async () => {
    const { api, writes } = caller({ feed_comments: [commentRow] });
    const result = await api.reports.reportComment({ commentId: COMMENT, reason: "other" });
    expect(result).toEqual({ success: true, alreadyReported: false });
    expect(writes).toEqual([
      {
        table: "user_reports",
        op: "insert",
        row: {
          reporter_user_id: ME,
          reported_user_id: OTHER,
          reason: "other",
          details: commentReportDetails(COMMENT, commentRow.text),
        },
      },
    ]);
  });
  it("refuses your own comment", async () => {
    const { api, writes } = caller({ feed_comments: [{ ...commentRow, user_id: ME }] });
    await rejectsWith(api.reports.reportComment({ commentId: COMMENT, reason: "other" }), "You can't report your own comment.");
    expect(writes).toEqual([]);
  });
  it("404s a missing comment", async () => {
    const { api } = caller({ feed_comments: [] });
    const err = await api.reports.reportComment({ commentId: COMMENT, reason: "other" }).then(() => null, (e: unknown) => e);
    expect((err as TRPCError).code).toBe("NOT_FOUND");
  });
  it("feed.getComments drops comments the viewer reported", async () => {
    const rows = [
      { id: COMMENT, event_id: EVENT, user_id: OTHER, text: "nice walk, loser", created_at: "2026-10-17T00:00:00Z", parent_id: null },
      { id: COMMENT_2, event_id: EVENT, user_id: OTHER, text: "well done", created_at: "2026-10-17T00:01:00Z", parent_id: null },
    ];
    const server = stubDb({
      user_reports: [{ details: commentReportDetails(COMMENT, "nice walk, loser") }, { details: "post-1" }],
      profiles: [{ user_id: OTHER, username: "other", display_name: "Other", avatar_url: null, is_test: false }],
    });
    vi.mocked(getSupabaseServer).mockReturnValue(server.supabase as never);
    try {
      const { api } = caller({ feed_comments: rows, profiles: [{ user_id: OTHER, username: "other", display_name: "Other", avatar_url: null }] });
      const visible = await api.feed.getComments({ eventId: EVENT, limit: 50 });
      expect(visible.map((c) => c.id)).toEqual([COMMENT_2]);
    } finally {
      vi.mocked(getSupabaseServer).mockReturnValue(null as never);
    }
  });
});
