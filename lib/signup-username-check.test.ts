import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("signup username check failure", () => {
  it("shows a retry instead of silently disabling Create Account", () => {
    const src = readFileSync(resolve(__dirname, "../app/auth/signup.tsx"), "utf8");
    expect(src).toContain("Couldn't check that username. Try again.");
    expect(src).toContain('setUsernameStatus("error")');
    expect(src).not.toMatch(/catch \(err\) \{\s*captureError\(err, "SignupUsernameCheck"\);\s*setUsernameStatus\("idle"\)/);
  });
});
