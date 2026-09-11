import { describe, expect, it } from "vitest";
import { guestUsername } from "./guest-username";
import { ensureProfile } from "./ensure-profile";

const UID = "4a4c5f08-c9e6-44a2-b863-561fde115ac7";

function mockDb(state: {
  byUserId?: { id: string; user_id: string | null; username: string | null } | null;
  byId?: { id: string; user_id: string | null; username: string | null } | null;
  upserts: Record<string, unknown>[];
}) {
  return {
    from: (table: string) => {
      expect(table).toBe("profiles");
      return {
        select: () => ({
          eq: (col: string, val: string) => ({
            maybeSingle: async () => {
              if (col === "user_id" && val === UID) return { data: state.byUserId ?? null, error: null };
              if (col === "id" && val === UID) return { data: state.byId ?? null, error: null };
              return { data: null, error: null };
            },
          }),
        }),
        update: (row: Record<string, unknown>) => ({
          eq: async () => {
            if (state.byId) state.byId = { ...state.byId, ...row } as typeof state.byId;
            return { error: null };
          },
        }),
        upsert: async (row: Record<string, unknown>) => {
          state.upserts.push(row);
          state.byUserId = {
            id: String(row.id),
            user_id: String(row.user_id),
            username: String(row.username),
          };
          state.byId = state.byUserId;
          return { error: null };
        },
      };
    },
  };
}

describe("ensureProfile", () => {
  it("inserts id=user_id and generated username when absent", async () => {
    const state = { upserts: [] as Record<string, unknown>[] };
    const first = await ensureProfile(mockDb(state) as never, UID);
    expect(first).toEqual({
      created: true,
      user_id: UID,
      username: guestUsername(UID),
    });
    expect(state.upserts).toHaveLength(1);
    expect(state.upserts[0]).toMatchObject({
      id: UID,
      user_id: UID,
      username: "user_4a4c5f08",
      onboarding_completed: false,
    });
  });

  it("second call is a no-op", async () => {
    const state = { upserts: [] as Record<string, unknown>[] };
    const db = mockDb(state);
    await ensureProfile(db as never, UID);
    const second = await ensureProfile(db as never, UID);
    expect(second.created).toBe(false);
    expect(state.upserts).toHaveLength(1);
  });
});
