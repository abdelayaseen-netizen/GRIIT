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
  });
});

describe("upgradeAnonymousWithApple", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getItem.mockResolvedValue("anon-uid-1");
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
  });
});
