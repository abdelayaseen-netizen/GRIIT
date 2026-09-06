import { describe, expect, it } from "vitest";
import {
  normalizeProfileUsername,
  usernameFieldState,
  usernameSaveBlocked,
} from "@/lib/profile-v2-username";

describe("normalizeProfileUsername", () => {
  it("lowercases, strips illegal chars, and caps at 20", () => {
    expect(normalizeProfileUsername("Yaseen OK!")).toBe("yaseen_ok");
    expect(normalizeProfileUsername("Abcdefghijklmnopqrstuvwxyz")).toBe("abcdefghijklmnopqrst");
  });
});

describe("usernameFieldState", () => {
  it("is idle when unchanged", () => {
    expect(
      usernameFieldState({ normalized: "bob", original: "bob", inFlight: false, taken: false })
    ).toBe("idle");
  });

  it("blocks short and taken names", () => {
    expect(
      usernameFieldState({ normalized: "ab", original: "bob", inFlight: false, taken: null })
    ).toBe("tooShort");
    expect(
      usernameFieldState({ normalized: "taken", original: "bob", inFlight: false, taken: true })
    ).toBe("taken");
    expect(
      usernameFieldState({ normalized: "free", original: "bob", inFlight: false, taken: false })
    ).toBe("available");
    expect(usernameSaveBlocked("taken")).toBe(true);
    expect(usernameSaveBlocked("available")).toBe(false);
  });
});
