import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AuthContext getSession", () => {
  it("captures getSession failures instead of swallowing them", () => {
    const src = readFileSync(resolve(__dirname, "./AuthContext.tsx"), "utf8");
    expect(src).toContain('captureError(err, "AuthContext.getSession")');
    expect(src).not.toContain("error swallowed");
  });
});
