import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Welcome back dark conversion", () => {
  it("drops the cream theme import from the live sign-in files", () => {
    const files = [
      "../components/onboarding/v2/screens/SignInScreen.tsx",
      "../components/onboarding/v2/screens/AccountScreen.tsx",
      "../app/auth/forgot-password.tsx",
    ];
    for (const rel of files) {
      const src = readFileSync(resolve(__dirname, rel), "utf8");
      expect(src).not.toContain("OBV2_COLOR");
      expect(src).not.toContain('from "../theme"');
      expect(src).not.toContain("from '../theme'");
      expect(src).toContain("DS_V3");
    }
  });
});
