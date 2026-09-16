import { describe, expect, it } from "vitest";
import { loginCanSubmit } from "@/lib/login-can-submit";

describe("loginCanSubmit", () => {
  it("is false until both fields have a value", () => {
    expect(loginCanSubmit("", "")).toBe(false);
    expect(loginCanSubmit("  ", "secret")).toBe(false);
    expect(loginCanSubmit("a@b.c", "")).toBe(false);
  });

  it("is true when email (trimmed) and password are non-empty", () => {
    expect(loginCanSubmit("a@b.c", "x")).toBe(true);
    expect(loginCanSubmit("  a@b.c  ", "x")).toBe(true);
  });
});
