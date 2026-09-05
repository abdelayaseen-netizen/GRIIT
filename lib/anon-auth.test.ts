/**
 * Unit tests for anon → permanent upgrade helpers (PR A / Phase A1).
 * Mocks supabase.auth — no network.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const signInAnonymously = vi.fn();
const linkIdentity = vi.fn();
const updateUser = vi.fn();
const setItem = vi.fn(async (_key: string, _value: string) => undefined);
const getItem = vi.fn(async (_key: string): Promise<string | null> => null);
const removeItem = vi.fn(async (_key: string) => undefined);

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    setItem: (key: string, value: string) => setItem(key, value),
    getItem: (key: string) => getItem(key),
    removeItem: (key: string) => removeItem(key),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      signInAnonymously: (...args: unknown[]) => signInAnonymously(...args),
      linkIdentity: (...args: unknown[]) => linkIdentity(...args),
      updateUser: (...args: unknown[]) => updateUser(...args),
    },
  },
}));

vi.mock("@/lib/sentry", () => ({
  captureError: vi.fn(),
}));

const writeDeviceTimezone = vi.fn(async (): Promise<string | null> => "America/New_York");
vi.mock("@/lib/write-device-timezone", () => ({
  writeDeviceTimezone: () => writeDeviceTimezone(),
}));

import {
  __anonAuthTestUtils,
  ensureAnonymousSession,
  isAnonymousUser,
  upgradeAnonymousWithApple,
  upgradeAnonymousWithEmail,
} from "@/lib/anon-auth";

const anonUser = {
  id: "anon-uid-1",
  is_anonymous: true,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "",
};

const permanentUser = {
  ...anonUser,
  id: "anon-uid-1",
  is_anonymous: false,
  email: "a@b.com",
};

describe("isAnonymousUser", () => {
  it("detects is_anonymous flag", () => {
    expect(isAnonymousUser(anonUser as never)).toBe(true);
    expect(isAnonymousUser(permanentUser as never)).toBe(false);
    expect(isAnonymousUser(null)).toBe(false);
  });
});

describe("__anonAuthTestUtils.isIdentityTakenError", () => {
  it("matches known conflict shapes", () => {
    expect(
      __anonAuthTestUtils.isIdentityTakenError({
        message: "Identity is already linked to another user",
        name: "AuthApiError",
        status: 422,
      } as never)
    ).toBe(true);
    expect(
      __anonAuthTestUtils.isIdentityTakenError({
        message: "nope",
        name: "AuthApiError",
        status: 400,
        code: "identity_already_exists",
      } as never)
    ).toBe(true);
    expect(
      __anonAuthTestUtils.isIdentityTakenError({
        message: "invalid token",
        name: "AuthApiError",
        status: 400,
      } as never)
    ).toBe(false);
  });
});

describe("ensureAnonymousSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getItem.mockResolvedValue(null);
    __anonAuthTestUtils.resetEnsureAnonymousInflight();
    writeDeviceTimezone.mockResolvedValue("America/New_York");
  });

  it("returns existing session without calling signInAnonymously", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    const res = await ensureAnonymousSession();
    expect(res.kind).toBe("ok");
    expect(res.user?.id).toBe("anon-uid-1");
    expect(signInAnonymously).not.toHaveBeenCalled();
    expect(writeDeviceTimezone).not.toHaveBeenCalled();
  });

  it("creates anon session when none exists", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    signInAnonymously.mockResolvedValue({
      data: { user: anonUser, session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    const res = await ensureAnonymousSession();
    expect(res.kind).toBe("ok");
    expect(signInAnonymously).toHaveBeenCalledOnce();
    expect(setItem).toHaveBeenCalled();
    expect(writeDeviceTimezone).toHaveBeenCalledOnce();
  });

  it("two concurrent callers share one signInAnonymously and the same session", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    let release: ((value: unknown) => void) | undefined;
    signInAnonymously.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        })
    );

    const first = ensureAnonymousSession();
    const second = ensureAnonymousSession();
    await vi.waitFor(() => {
      expect(signInAnonymously).toHaveBeenCalledOnce();
    });

    release?.({
      data: { user: anonUser, session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    const [a, b] = await Promise.all([first, second]);
    expect(a.user?.id).toBe("anon-uid-1");
    expect(b.user?.id).toBe(a.user?.id);
    expect(signInAnonymously).toHaveBeenCalledOnce();
    expect(writeDeviceTimezone).toHaveBeenCalledOnce();
  });
});

describe("upgradeAnonymousWithApple", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getItem.mockResolvedValue("anon-uid-1");
    writeDeviceTimezone.mockResolvedValue("America/New_York");
  });

  it("links successfully and preserves uid", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    linkIdentity.mockResolvedValue({
      data: { user: permanentUser, session: { user: permanentUser, access_token: "t2" } },
      error: null,
    });
    const res = await upgradeAnonymousWithApple({ identityToken: "tok" });
    expect(res.kind).toBe("ok");
    expect(res.user?.id).toBe("anon-uid-1");
    expect(writeDeviceTimezone).toHaveBeenCalledOnce();
    expect(linkIdentity).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "apple", token: "tok" })
    );
  });

  it("returns identity_taken when Apple is already linked elsewhere", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    linkIdentity.mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: "Identity is already linked to another user",
        name: "AuthApiError",
        status: 422,
        code: "identity_already_exists",
      },
    });
    const res = await upgradeAnonymousWithApple({ identityToken: "tok" });
    expect(res.kind).toBe("identity_taken");
    expect(res.message).toMatch(/already linked/i);
    expect(res.previousAnonUserId).toBe("anon-uid-1");
  });

  it("returns no_anon_session when upgrade has no anonymous session", async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    getItem.mockResolvedValue("lost-anon-uid");
    const res = await upgradeAnonymousWithApple({ identityToken: "tok" });
    expect(res.kind).toBe("no_anon_session");
    expect(res.message).toMatch(/lost/i);
    expect(linkIdentity).not.toHaveBeenCalled();
  });

  it("returns offline without calling linkIdentity", async () => {
    getSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Failed to fetch", name: "AuthRetryableFetchError", status: 0 },
    });
    const res = await upgradeAnonymousWithApple({ identityToken: "tok" });
    expect(res.kind).toBe("offline");
    expect(linkIdentity).not.toHaveBeenCalled();
  });
});

describe("upgradeAnonymousWithEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getItem.mockResolvedValue("anon-uid-1");
    writeDeviceTimezone.mockResolvedValue("America/New_York");
  });

  it("uses updateUser and preserves uid", async () => {
    getSession
      .mockResolvedValueOnce({
        data: { session: { user: anonUser, access_token: "t" } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { session: { user: permanentUser, access_token: "t2" } },
        error: null,
      });
    updateUser.mockResolvedValue({ data: { user: permanentUser }, error: null });
    const res = await upgradeAnonymousWithEmail({ email: "a@b.com", password: "secret1" });
    expect(res.kind).toBe("ok");
    expect(updateUser).toHaveBeenCalledWith({ email: "a@b.com", password: "secret1" });
    expect(res.user?.id).toBe("anon-uid-1");
    expect(writeDeviceTimezone).toHaveBeenCalledOnce();
  });

  /**
   * Identity gap — typo: no format/existence check before updateUser.
   * A free but wrong address (e.g. gmial.com) attaches to the anon uid.
   * Day 1 stays on that uid; it is not merged into any prior account.
   */
  it("typo / unused email: updateUser succeeds on same anon uid (no pre-check)", async () => {
    const typoEmail = "bob@gmial.com";
    const upgraded = {
      ...anonUser,
      is_anonymous: false,
      email: typoEmail,
    };
    getSession
      .mockResolvedValueOnce({
        data: { session: { user: anonUser, access_token: "t" } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { session: { user: upgraded, access_token: "t2" } },
        error: null,
      });
    updateUser.mockResolvedValue({ data: { user: upgraded }, error: null });

    const res = await upgradeAnonymousWithEmail({ email: typoEmail, password: "secret1" });

    expect(res.kind).toBe("ok");
    expect(res.user?.id).toBe("anon-uid-1");
    expect(res.user?.email).toBe(typoEmail);
    expect(updateUser).toHaveBeenCalledWith({ email: typoEmail, password: "secret1" });
    expect(linkIdentity).not.toHaveBeenCalled();
    expect(removeItem).toHaveBeenCalled();
  });

  it("typo / malformed: no client regex — still calls updateUser with trimmed input", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    updateUser.mockResolvedValue({
      data: { user: null },
      error: {
        message: "Unable to validate email address: invalid format",
        name: "AuthApiError",
        status: 400,
      },
    });

    const res = await upgradeAnonymousWithEmail({
      email: "  not-an-email  ",
      password: "secret1",
    });

    expect(updateUser).toHaveBeenCalledWith({ email: "not-an-email", password: "secret1" });
    expect(res.kind).toBe("provider_error");
    expect(res.previousAnonUserId).toBe("anon-uid-1");
    expect(removeItem).not.toHaveBeenCalled();
  });

  /**
   * Identity gap — existing email: GoTrue rejects; we surface identity_taken.
   * No merge into the other account; anon session (and Day 1) stay on anon-uid-1.
   */
  it("existing email: returns identity_taken, does not merge, keeps anon uid", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    updateUser.mockResolvedValue({
      data: { user: null },
      error: {
        message: "A user with this email address has already been registered",
        name: "AuthApiError",
        status: 422,
      },
    });

    const res = await upgradeAnonymousWithEmail({
      email: "taken@example.com",
      password: "secret1",
    });

    expect(res.kind).toBe("identity_taken");
    expect(res.message).toMatch(/already registered/i);
    expect(res.message).toMatch(/cannot be merged/i);
    expect(res.user).toBeNull();
    expect(res.previousAnonUserId).toBe("anon-uid-1");
    expect(updateUser).toHaveBeenCalledWith({
      email: "taken@example.com",
      password: "secret1",
    });
    expect(linkIdentity).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
  });
});
