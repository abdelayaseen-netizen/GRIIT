import { describe, expect, it } from "vitest";
import { displayNameFromAccount } from "@/lib/account-display-name";

describe("displayNameFromAccount", () => {
  it("uses the Apple name when Apple returned one", () => {
    expect(
      displayNameFromAccount({ appleName: "  Ada   Lovelace ", email: "ada@example.com" })
    ).toBe("Ada Lovelace");
  });

  it("uses the email prefix when Apple did not return a name", () => {
    expect(displayNameFromAccount({ appleName: "  ", email: "ada.lovelace@example.com" })).toBe(
      "ada.lovelace"
    );
    expect(displayNameFromAccount({ email: "ada@example.com" })).toBe("ada");
  });

  it("returns nothing when neither source has a name", () => {
    expect(displayNameFromAccount({})).toBeNull();
    expect(displayNameFromAccount({ email: "@example.com" })).toBeNull();
  });
});
