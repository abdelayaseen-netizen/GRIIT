import { describe, expect, it } from "vitest";
import { AUTH_ERROR_GENERIC, mapAuthError } from "@/lib/auth-helpers";

describe("mapAuthError", () => {
  it("maps known provider strings and never returns the raw message", () => {
    expect(mapAuthError({ message: "Invalid login credentials" })).toBe(
      "Invalid email or password. Please try again."
    );
    expect(mapAuthError({ message: "Email not confirmed" })).toMatch(/confirm your email/i);
    expect(mapAuthError({ message: "Identity is already linked to another user" })).toMatch(
      /already linked/i
    );
    expect(mapAuthError({ message: "AuthRetryableFetchError: Failed to fetch" })).toMatch(/network/i);
    expect(mapAuthError({ message: "User already registered" })).toMatch(/already exists/i);
  });

  it("does not leak unknown provider copy", () => {
    const raw = "error=unauthorized_client&error_code=bad_oauth_state";
    expect(mapAuthError({ message: raw })).toBe(AUTH_ERROR_GENERIC);
    expect(mapAuthError({ message: raw })).not.toBe(raw);
  });
});
