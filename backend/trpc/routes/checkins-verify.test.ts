/**
 * Unit tests for checkins.verifyTask — the server-side verification gate.
 *
 * Covers every top-level rejection branch and the happy path. Uses Vitest
 * with a hand-rolled Supabase mock so no real DB or HTTP calls are made.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createTestCaller } from "../create-test-caller";

// ----- Stable UUIDs ---------------------------------------------------------
const USER_ID     = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const AC_ID       = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TASK_ID     = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const CHALLENGE_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const CHECKIN_ID  = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

const SUPABASE_URL = "https://testproject.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_URL = SUPABASE_URL;

// ----- Minimal Supabase builder -------------------------------------------------
/**
 * Returns the minimal Supabase chain mock that the verifyTask mutation needs.
 * Each call to .from() can be overridden with the `overrides` map keyed by
 * table name and call index (e.g. "check_ins:0" for the first check_ins call).
 */
function buildSupabase(opts: {
  ownershipRows?: { id: string; user_id: string; challenge_id: string } | null;
  ownershipError?: boolean;
  taskRow?: Record<string, unknown> | null;
  existingCheckin?: { id: string; status: string } | null;
  profileRow?: Record<string, unknown> | null;
  upsertResult?: { id: string } | null;
  upsertError?: { code: string; message: string } | null;
  allTasksRows?: { id: string; config: Record<string, unknown> }[];
  completedCheckins?: { task_id: string }[];
  rpcResult?: { new_streak_count: number; last_stand_earned: boolean }[] | null;
  rpcError?: { message: string } | null;
} = {}) {
  const {
    ownershipRows = { id: AC_ID, user_id: USER_ID, challenge_id: CHALLENGE_ID },
    ownershipError = false,
    taskRow = { id: TASK_ID, title: "Test task", task_type: "manual", config: {}, require_photo: false },
    existingCheckin = null,
    profileRow = { timezone: "UTC" },
    upsertResult = { id: CHECKIN_ID },
    upsertError = null,
    allTasksRows = [{ id: TASK_ID, config: {} }],
    completedCheckins = [{ task_id: TASK_ID }],
    rpcResult = null,
    rpcError = null,
  } = opts;

  // Track which from('check_ins') call we are on
  let checkInsCallCount = 0;

  const buildChain = (resolve: () => unknown): Record<string, unknown> => {
    const chain: Record<string, unknown> = {};
    const noop = () => chain;
    chain.select = noop;
    chain.eq = noop;
    chain.neq = noop;
    chain.or = noop;
    chain.gte = noop;
    chain.lte = noop;
    chain.limit = noop;
    chain.order = noop;
    chain.in = noop;
    chain.update = noop;
    chain.upsert = () => ({
      select: () => ({
        single: () => Promise.resolve({ data: upsertError ? null : upsertResult, error: upsertError }),
      }),
    });
    chain.insert = () => Promise.resolve({ data: null, error: null });
    chain.single = () => Promise.resolve(resolve());
    chain.maybeSingle = () => Promise.resolve(resolve());
    chain.then = (fn: (v: unknown) => void) => Promise.resolve(resolve()).then(fn);
    return chain;
  };

  return {
    from: (table: string) => {
      if (table === "active_challenges") {
        // First call from assertActiveChallengeOwnership
        if (ownershipError || !ownershipRows) {
          return buildChain(() => ({ data: null, error: { code: "PGRST116", message: "Not found" } }));
        }
        return buildChain(() => ({ data: ownershipRows, error: null }));
      }

      if (table === "challenge_tasks") {
        // Could be the task lookup (maybeSingle) or the list for required tasks
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: taskRow, error: null }),
              }),
              limit: () =>
                Promise.resolve({ data: allTasksRows, error: null }),
              maybeSingle: () => Promise.resolve({ data: taskRow, error: null }),
            }),
            limit: () => Promise.resolve({ data: allTasksRows, error: null }),
          }),
        };
      }

      if (table === "profiles") {
        return buildChain(() => ({ data: profileRow, error: null }));
      }

      if (table === "check_ins") {
        const callIdx = checkInsCallCount++;
        if (callIdx === 0) {
          // Existing checkin double-claim check
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: existingCheckin, error: null }),
                  }),
                }),
              }),
            }),
          };
        }
        if (callIdx === 1) {
          // The upsert — save completion
          return {
            upsert: () => ({
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: upsertError ? null : upsertResult,
                    error: upsertError,
                  }),
              }),
            }),
          };
        }
        // callIdx >= 2: completed today queries for progress + auto-secure
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  limit: () => Promise.resolve({ data: completedCheckins, error: null }),
                }),
              }),
            }),
          }),
        };
      }

      // Fallback: no-op for activity_events, active_challenges update
      return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        upsert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: upsertError ? null : upsertResult, error: upsertError }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
      };
    },
    rpc: (_name: string, _params: unknown) => {
      if (rpcError) return Promise.resolve({ data: null, error: rpcError });
      return Promise.resolve({ data: rpcResult ?? [], error: null });
    },
    storage: {
      from: () => ({ list: () => Promise.resolve({ data: [], error: null }) }),
    },
  };
}

// ----- Helpers -----------------------------------------------------------------
async function callVerifyTask(supabase: unknown, input: Record<string, unknown>) {
  const caller = createTestCaller({ userId: USER_ID, supabase });
  return (caller as unknown as {
    checkins: {
      verifyTask: (input: Record<string, unknown>) => Promise<
        | { verified: true; checkinId?: string; streakAdvanced: boolean; newStreakCount?: number }
        | { verified: false; reason: string; reasonCode: string }
      >;
    };
  }).checkins.verifyTask(input);
}

const baseInput = {
  activeChallengeId: AC_ID,
  taskId: TASK_ID,
  task_mode: "full",
} as const;

// ----- Tests -------------------------------------------------------------------
describe("checkins.verifyTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // --- Ownership gate -----------------------------------------------------------
  it("throws FORBIDDEN when active challenge does not exist", async () => {
    const supabase = buildSupabase({ ownershipError: true });
    await expect(callVerifyTask(supabase, baseInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws FORBIDDEN when challenge is owned by a different user", async () => {
    const supabase = buildSupabase({
      ownershipRows: { id: AC_ID, user_id: "other-user-id", challenge_id: CHALLENGE_ID },
    });
    await expect(callVerifyTask(supabase, baseInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  // --- Task-not-found gate -----------------------------------------------------
  it("returns TASK_NOT_FOUND when task does not belong to the challenge", async () => {
    const supabase = buildSupabase({ taskRow: null });
    const result = await callVerifyTask(supabase, baseInput);
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("TASK_NOT_FOUND");
    }
  });

  // --- Idempotent double-claim -------------------------------------------------
  it("returns verified:true immediately when the task is already completed today", async () => {
    const supabase = buildSupabase({
      existingCheckin: { id: CHECKIN_ID, status: "completed" },
    });
    const result = await callVerifyTask(supabase, baseInput);
    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.streakAdvanced).toBe(false);
    }
  });

  // --- Photo path-ownership gate -----------------------------------------------
  it("returns PHOTO_NOT_YOURS when photoUrl does not start with the user's storage folder", async () => {
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Photo task", task_type: "photo", config: {}, require_photo: true },
    });
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/WRONG-USER/${TASK_ID}.jpg`,
    });
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("PHOTO_NOT_YOURS");
    }
  });

  it("returns PHOTO_REQUIRED when a photo task is submitted without a photoUrl", async () => {
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Photo task", task_type: "photo", config: {}, require_photo: true },
    });
    const result = await callVerifyTask(supabase, baseInput);
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("PHOTO_REQUIRED");
    }
  });

  // --- Storage HEAD integrity --------------------------------------------------
  it("returns PHOTO_NOT_FOUND when Storage HEAD returns 404", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Photo task", task_type: "photo", config: {}, require_photo: true },
    });
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/${USER_ID}/photo.jpg`,
    });
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("PHOTO_NOT_FOUND");
    }
  });

  it("returns PHOTO_INVALID_TYPE when Storage HEAD returns a non-image content-type", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-type": "application/pdf", "content-length": "5000" } })
    );
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Photo task", task_type: "photo", config: {}, require_photo: true },
    });
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/${USER_ID}/photo.pdf`,
    });
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("PHOTO_INVALID_TYPE");
    }
  });

  it("returns PHOTO_TOO_SMALL when Storage HEAD reports < 1 KB", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-type": "image/jpeg", "content-length": "512" } })
    );
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Photo task", task_type: "photo", config: {}, require_photo: true },
    });
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/${USER_ID}/photo.jpg`,
    });
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("PHOTO_TOO_SMALL");
    }
  });

  // --- Camera-only gate --------------------------------------------------------
  it("returns CAMERA_REQUIRED when require_camera_only but captureSource is library", async () => {
    const supabase = buildSupabase({
      taskRow: {
        id: TASK_ID, title: "Camera task", task_type: "photo",
        config: { require_camera_only: true }, require_photo: true,
      },
    });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-type": "image/jpeg", "content-length": "50000" } })
    );
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/${USER_ID}/photo.jpg`,
      captureSource: "library",
    });
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("CAMERA_REQUIRED");
    }
  });

  it("returns CAMERA_REQUIRED when require_camera_only and captureSource is missing", async () => {
    const supabase = buildSupabase({
      taskRow: {
        id: TASK_ID, title: "Camera task", task_type: "photo",
        config: { require_camera_only: true }, require_photo: true,
      },
    });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-type": "image/jpeg", "content-length": "50000" } })
    );
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/${USER_ID}/photo.jpg`,
      // captureSource intentionally omitted
    });
    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reasonCode).toBe("CAMERA_REQUIRED");
    }
  });

  // --- Happy path (no photo) ---------------------------------------------------
  it("returns verified:true for a simple manual task with no photo requirement", async () => {
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Simple task", task_type: "manual", config: {}, require_photo: false },
      allTasksRows: [{ id: TASK_ID, config: {} }],
      completedCheckins: [{ task_id: TASK_ID }],
    });
    const result = await callVerifyTask(supabase, baseInput);
    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.checkinId).toBe(CHECKIN_ID);
    }
  });

  // --- Happy path with valid camera photo --------------------------------------
  it("returns verified:true for a camera-only task when captureSource=camera and HEAD passes", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-type": "image/jpeg", "content-length": "80000" } })
    );
    const supabase = buildSupabase({
      taskRow: {
        id: TASK_ID, title: "Camera task", task_type: "photo",
        config: { require_camera_only: true }, require_photo: true,
      },
      allTasksRows: [{ id: TASK_ID, config: {} }],
      completedCheckins: [{ task_id: TASK_ID }],
    });
    const result = await callVerifyTask(supabase, {
      ...baseInput,
      photoUrl: `${SUPABASE_URL}/storage/v1/object/public/task-proofs/${USER_ID}/photo.jpg`,
      captureSource: "camera",
    });
    expect(result.verified).toBe(true);
  });

  // --- Auto-secure: streak advances when all required tasks done ---------------
  it("marks streakAdvanced:true when all required tasks complete and secureDay RPC succeeds", async () => {
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Simple task", task_type: "manual", config: {}, require_photo: false },
      allTasksRows: [{ id: TASK_ID, config: {} }],
      completedCheckins: [{ task_id: TASK_ID }],
      rpcResult: [{ new_streak_count: 5, last_stand_earned: false }],
    });
    const result = await callVerifyTask(supabase, baseInput);
    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.streakAdvanced).toBe(true);
      expect(result.newStreakCount).toBe(5);
    }
  });

  it("still returns verified:true when secureDay RPC errors (migration not yet applied)", async () => {
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Simple task", task_type: "manual", config: {}, require_photo: false },
      allTasksRows: [{ id: TASK_ID, config: {} }],
      completedCheckins: [{ task_id: TASK_ID }],
      rpcError: { message: 'column challenge_tasks.required does not exist' },
    });
    const result = await callVerifyTask(supabase, baseInput);
    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.streakAdvanced).toBe(false);
    }
  });

  // --- Upsert failure ----------------------------------------------------------
  it("throws INTERNAL_SERVER_ERROR when the check_ins upsert fails", async () => {
    const supabase = buildSupabase({
      taskRow: { id: TASK_ID, title: "Simple task", task_type: "manual", config: {}, require_photo: false },
      upsertError: { code: "23505", message: "unique violation" },
    });
    await expect(callVerifyTask(supabase, baseInput)).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
