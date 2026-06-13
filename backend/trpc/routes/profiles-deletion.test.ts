import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestCaller } from "../create-test-caller";

// deleteAccount dynamically imports these modules; hoist the spies so the
// vi.mock factories can reference them (vi.mock is hoisted above imports).
const { captureException, captureMessage, hasSupabaseAdmin, getSupabaseAdmin } = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  hasSupabaseAdmin: vi.fn(),
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@sentry/node", () => ({
  captureException,
  captureMessage,
  isEnabled: () => true,
}));

vi.mock("../../lib/supabase-admin", () => ({
  hasSupabaseAdmin,
  getSupabaseAdmin,
}));

const USER_A = "11111111-1111-4111-8111-111111111111";

/** Caller surface for the profiles router (not in the shared TestAppCaller type). */
type DeletionCaller = {
  profiles: {
    deleteAccount: (input: Record<string, never>) => Promise<{ ok: boolean }>;
  };
};

function getDeleteAccount(userId: string, supabase: unknown) {
  const caller = createTestCaller({ userId, supabase, req: {} as Request });
  if (!caller) return undefined;
  return (caller as unknown as DeletionCaller).profiles.deleteAccount;
}

/** Mock the user-scoped supabase client: from("profiles").delete().eq(...) -> { error }. */
function createMockSupabase(opts: { deleteError?: unknown } = {}) {
  const { deleteError = null } = opts;
  const eq = vi.fn().mockResolvedValue({ error: deleteError });
  const del = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ delete: del }));
  return { client: { from }, from, delete: del, eq };
}

/** Mock the service-role admin client: storage list/remove + auth.admin.deleteUser. */
function createMockAdmin(opts: { listFiles?: { name: string }[]; removeError?: unknown } = {}) {
  const { listFiles = [{ name: "proof-1.jpg" }], removeError = null } = opts;
  const list = vi.fn().mockResolvedValue({ data: listFiles, error: null });
  const remove = vi.fn().mockResolvedValue({ data: null, error: removeError });
  const storageFrom = vi.fn(() => ({ list, remove }));
  const deleteUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
  return {
    client: {
      storage: { from: storageFrom },
      auth: { admin: { deleteUser } },
    },
    list,
    remove,
    storageFrom,
    deleteUser,
  };
}

describe("profiles.deleteAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path: deletes storage objects, deletes profile row, deletes auth user", async () => {
    hasSupabaseAdmin.mockReturnValue(true);
    const admin = createMockAdmin();
    getSupabaseAdmin.mockReturnValue(admin.client);
    const supa = createMockSupabase();

    const deleteAccount = getDeleteAccount(USER_A, supa.client);
    if (!deleteAccount) return;

    const result = await deleteAccount({});

    expect(result).toEqual({ ok: true });
    // both user-owned buckets enumerated and cleared
    expect(admin.storageFrom).toHaveBeenCalledWith("task-proofs");
    expect(admin.storageFrom).toHaveBeenCalledWith("avatars");
    expect(admin.remove).toHaveBeenCalledWith([`${USER_A}/proof-1.jpg`]);
    // profile row deleted
    expect(supa.from).toHaveBeenCalledWith("profiles");
    expect(supa.eq).toHaveBeenCalledWith("user_id", USER_A);
    // auth user deleted with the correct id
    expect(admin.deleteUser).toHaveBeenCalledWith(USER_A);
  });

  it("storage failure does not block deletion and is reported to Sentry", async () => {
    hasSupabaseAdmin.mockReturnValue(true);
    const admin = createMockAdmin({ removeError: new Error("storage boom") });
    getSupabaseAdmin.mockReturnValue(admin.client);
    const supa = createMockSupabase();

    const deleteAccount = getDeleteAccount(USER_A, supa.client);
    if (!deleteAccount) return;

    const result = await deleteAccount({});

    expect(result).toEqual({ ok: true });
    expect(captureException).toHaveBeenCalledTimes(1);
    // deletion still proceeded past the storage failure
    expect(supa.from).toHaveBeenCalledWith("profiles");
    expect(admin.deleteUser).toHaveBeenCalledWith(USER_A);
  });

  it("no admin client: profile deleted, auth deletion skipped, no throw, warning captured", async () => {
    hasSupabaseAdmin.mockReturnValue(false);
    const supa = createMockSupabase();

    const deleteAccount = getDeleteAccount(USER_A, supa.client);
    if (!deleteAccount) return;

    const result = await deleteAccount({});

    expect(result).toEqual({ ok: true });
    expect(supa.from).toHaveBeenCalledWith("profiles");
    // admin client never constructed -> no storage cleanup, no auth deletion
    expect(getSupabaseAdmin).not.toHaveBeenCalled();
    expect(captureMessage).toHaveBeenCalledTimes(1);
  });

  it("profile delete failure throws INTERNAL_SERVER_ERROR and skips auth deletion", async () => {
    hasSupabaseAdmin.mockReturnValue(true);
    const admin = createMockAdmin();
    getSupabaseAdmin.mockReturnValue(admin.client);
    const supa = createMockSupabase({ deleteError: { message: "delete failed" } });

    const deleteAccount = getDeleteAccount(USER_A, supa.client);
    if (!deleteAccount) return;

    await expect(deleteAccount({})).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(admin.deleteUser).not.toHaveBeenCalled();
  });

  it("unauthenticated: rejects with UNAUTHORIZED (protectedProcedure)", async () => {
    const supa = createMockSupabase();
    // empty userId -> protectedProcedure guard rejects before any work
    const deleteAccount = getDeleteAccount("", supa.client);
    if (!deleteAccount) return;

    await expect(deleteAccount({})).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(supa.from).not.toHaveBeenCalled();
  });
});
