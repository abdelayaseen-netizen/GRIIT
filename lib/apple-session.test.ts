import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const linkIdentity = vi.fn();
const signInWithIdToken = vi.fn();
const getItem = vi.fn(async (): Promise<string | null> => "anon-uid-1");
const setItem = vi.fn(async (_key: string, _value: string) => undefined);
const removeItem = vi.fn(async (_key: string) => undefined);

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: () => getItem(),
    setItem: (key: string, value: string) => setItem(key, value),
    removeItem: (key: string) => removeItem(key),
  },
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSession(...args),
      linkIdentity: (...args: unknown[]) => linkIdentity(...args),
      signInWithIdToken: (...args: unknown[]) => signInWithIdToken(...args),
    },
  },
}));

vi.mock("@/lib/sentry", () => ({ captureError: vi.fn() }));
vi.mock("@/lib/write-device-timezone", () => ({
  writeDeviceTimezone: vi.fn(async () => "America/New_York"),
}));
vi.mock("@/lib/trpc", () => ({
  trpcMutate: vi.fn(async () => ({ created: false })),
}));

import { SIGNED_IN_EXISTING_ACCOUNT, signInApplePreferringLink } from "@/lib/apple-session";

const anonUser = {
  id: "anon-uid-1",
  is_anonymous: true,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "",
};

const linkedUser = { ...anonUser, is_anonymous: false };
const existingUser = { ...anonUser, id: "real-uid", is_anonymous: false };

describe("signInApplePreferringLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getItem.mockResolvedValue("anon-uid-1");
  });

  it("guest + new Apple ID: linkIdentity keeps Day 1 uid", async () => {
    getSession.mockResolvedValue({
      data: { session: { user: anonUser, access_token: "t" } },
      error: null,
    });
    linkIdentity.mockResolvedValue({
      data: { user: linkedUser, session: { user: linkedUser, access_token: "t2" } },
      error: null,
    });

    const res = await signInApplePreferringLink({ identityToken: "tok" });

    expect(res.kind).toBe("linked");
    expect(res.user?.id).toBe("anon-uid-1");
    expect(linkIdentity).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "apple", token: "tok" })
    );
    expect(signInWithIdToken).not.toHaveBeenCalled();
  });

  it("guest + Apple already taken: signInWithIdToken and say existing account", async () => {
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
    signInWithIdToken.mockResolvedValue({
      data: { user: existingUser, session: { user: existingUser, access_token: "t3" } },
      error: null,
    });

    const res = await signInApplePreferringLink({ identityToken: "tok" });

    expect(res.kind).toBe("signed_in_existing");
    expect(res.user?.id).toBe("real-uid");
    expect(res.message).toBe(SIGNED_IN_EXISTING_ACCOUNT);
    expect(signInWithIdToken).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "apple", token: "tok" })
    );
  });
});
