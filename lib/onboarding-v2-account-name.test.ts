import { describe, expect, it } from "vitest";
import {
  ACCOUNT_NAME_BIO_MAX,
  accountNameBioForPersist,
  accountNameContinueDecision,
  accountNameSkipDecision,
  classifyAccountAuth,
  nextAfterAccountAuth,
  prefillAccountUsername,
  shouldShowAccountNameStep,
} from "@/lib/onboarding-v2-account-name";

describe("new email account → name step", () => {
  it("anon→email upgrade always opens the name step", () => {
    const kind = classifyAccountAuth({ path: "anon_upgrade_email" });
    expect(kind).toBe("new_account");
    expect(shouldShowAccountNameStep(kind)).toBe(true);
    expect(nextAfterAccountAuth(kind)).toBe("account_name");
  });

  it("cold email signUp always opens the name step", () => {
    const kind = classifyAccountAuth({ path: "signup_email" });
    expect(kind).toBe("new_account");
    expect(nextAfterAccountAuth(kind)).toBe("account_name");
  });
});

describe("new Apple account → name step", () => {
  it("anon→Apple upgrade always opens the name step", () => {
    const kind = classifyAccountAuth({ path: "anon_upgrade_apple" });
    expect(kind).toBe("new_account");
    expect(shouldShowAccountNameStep(kind)).toBe(true);
    expect(nextAfterAccountAuth(kind)).toBe("account_name");
  });

  it("first Apple id_token session opens the name step", () => {
    const created = "2026-09-04T20:00:00.000Z";
    const kind = classifyAccountAuth({
      path: "apple_id_token",
      createdAt: created,
      lastSignInAt: created,
      nowMs: Date.parse("2026-09-04T20:00:10.000Z"),
    });
    expect(kind).toBe("new_account");
    expect(nextAfterAccountAuth(kind)).toBe("account_name");
  });
});

describe("existing account sign-in → no name step", () => {
  it("already-registered email sign-in skips the name step", () => {
    const kind = classifyAccountAuth({ path: "signin_email" });
    expect(kind).toBe("existing_account");
    expect(shouldShowAccountNameStep(kind)).toBe(false);
    expect(nextAfterAccountAuth(kind)).toBe("invite");
  });

  it("returning Apple id_token session skips the name step", () => {
    const kind = classifyAccountAuth({
      path: "apple_id_token",
      createdAt: "2026-01-01T00:00:00.000Z",
      lastSignInAt: "2026-09-04T20:00:00.000Z",
      nowMs: Date.parse("2026-09-04T20:00:00.000Z"),
    });
    expect(kind).toBe("existing_account");
    expect(nextAfterAccountAuth(kind)).toBe("invite");
  });
});

describe("account name persist helpers", () => {
  it("skip persists nothing", () => {
    expect(accountNameSkipDecision()).toEqual({ persist: false });
  });

  it("continue persists trimmed display name and normalized username", () => {
    expect(
      accountNameContinueDecision({ displayName: "  Yaseen  ", username: "Yaseen_OK" })
    ).toEqual({ persist: true, displayName: "Yaseen", username: "yaseen_ok" });
  });

  it("continue rejects a short username", () => {
    const result = accountNameContinueDecision({ displayName: "Yaseen", username: "ab" });
    expect(result.persist).toBe(false);
    expect("error" in result && result.error).toMatch(/3/i);
  });

  it("prefills username from email when profile handle is a placeholder", () => {
    expect(
      prefillAccountUsername({ email: "yaseen@example.com", profileUsername: "user_3d42b39e" })
    ).toBe("yaseen");
  });

  it("bio persist trims, caps at 150, and skips empty", () => {
    expect(accountNameBioForPersist("  stay hard  ")).toBe("stay hard");
    expect(accountNameBioForPersist("   ")).toBeUndefined();
    expect(accountNameBioForPersist("x".repeat(200))).toHaveLength(ACCOUNT_NAME_BIO_MAX);
  });
});
