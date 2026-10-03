import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const setSession = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => exchangeCodeForSession(...args),
      setSession: (...args: unknown[]) => setSession(...args),
    },
  },
}));

import {
  AUTH_RESET_REDIRECT,
  RESET_LINK_EXPIRED,
  establishResetSession,
  parseResetRedirectUrl,
} from "@/lib/auth-reset";

describe("parseResetRedirectUrl", () => {
  it("reads PKCE code from the app redirect", () => {
    expect(parseResetRedirectUrl(`${AUTH_RESET_REDIRECT}?code=abc123`)).toEqual({
      kind: "code",
      code: "abc123",
    });
  });

  it("reads implicit tokens from the hash", () => {
    expect(
      parseResetRedirectUrl(
        `${AUTH_RESET_REDIRECT}#access_token=aaa&refresh_token=bbb&type=recovery`
      )
    ).toEqual({
      kind: "tokens",
      accessToken: "aaa",
      refreshToken: "bbb",
    });
  });

  it("treats expired / denied links as expired", () => {
    expect(
      parseResetRedirectUrl(
        `${AUTH_RESET_REDIRECT}?error=access_denied&error_code=otp_expired&error_description=Expired`
      )
    ).toEqual({ kind: "expired", message: RESET_LINK_EXPIRED });
  });

  it("returns missing when there is no token", () => {
    expect(parseResetRedirectUrl(AUTH_RESET_REDIRECT)).toEqual({ kind: "missing" });
    expect(parseResetRedirectUrl(null)).toEqual({ kind: "missing" });
  });
});

describe("establishResetSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges a code", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    await expect(establishResetSession({ kind: "code", code: "abc" })).resolves.toEqual({
      ok: true,
    });
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("sets a session from tokens", async () => {
    setSession.mockResolvedValue({ error: null });
    await expect(
      establishResetSession({
        kind: "tokens",
        accessToken: "a",
        refreshToken: "b",
      })
    ).resolves.toEqual({ ok: true });
    expect(setSession).toHaveBeenCalledWith({ access_token: "a", refresh_token: "b" });
  });

  it("maps expired exchange errors", async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: { message: "otp_expired" },
    });
    await expect(establishResetSession({ kind: "code", code: "old" })).resolves.toEqual({
      ok: false,
      expired: true,
      message: RESET_LINK_EXPIRED,
    });
  });
});
