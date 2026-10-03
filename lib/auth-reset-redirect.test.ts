import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
describe("password reset redirect", () => {
  it("forgot-password and SignInScreen send griit://auth/reset-password", () => {
    const forgot = readFileSync(resolve(__dirname, "../app/auth/forgot-password.tsx"), "utf8");
    const signIn = readFileSync(
      resolve(__dirname, "../components/onboarding/v2/screens/SignInScreen.tsx"),
      "utf8"
    );
    const helper = readFileSync(resolve(__dirname, "./auth-reset.ts"), "utf8");
    expect(forgot).toContain("AUTH_RESET_REDIRECT");
    expect(signIn).toContain("AUTH_RESET_REDIRECT");
    expect(helper).toContain('export const AUTH_RESET_REDIRECT = "griit://auth/reset-password"');
  });
});
