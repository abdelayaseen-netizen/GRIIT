import { describe, expect, it } from "vitest";
import { sessionMatchesAgent } from "./account";

describe("sessionMatchesAgent", () => {
  it("accepts a prepared agent only when the device email matches", () => {
    expect(sessionMatchesAgent({ fresh: false, expectedEmail: "A@griit.health", onDevice: { email: "a@griit.health", anonymous: false } })).toBe("match");
    expect(sessionMatchesAgent({ fresh: false, expectedEmail: "a@griit.health", onDevice: { email: "other@griit.health", anonymous: false } })).toBe("wrong_account");
    expect(sessionMatchesAgent({ fresh: false, expectedEmail: "a@griit.health", onDevice: null })).toBe("missing");
  });

  it("requires a fresh signup to be signed out before step 1", () => {
    expect(sessionMatchesAgent({ fresh: true, expectedEmail: "teen@griit.health", onDevice: null })).toBe("signed_out");
    expect(sessionMatchesAgent({ fresh: true, expectedEmail: "teen@griit.health", onDevice: { email: "", anonymous: true } })).toBe("signed_out");
    expect(sessionMatchesAgent({ fresh: true, expectedEmail: "teen@griit.health", onDevice: { email: "gym@griit.health", anonymous: false } })).toBe("wrong_account");
  });
});
