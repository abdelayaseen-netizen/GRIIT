import { describe, expect, it } from "vitest";
import {
  CONFIRM_EMAIL_NOTICE,
  EMAIL_TAKEN_NOTICE,
  GUEST_PROGRESS_STAYS,
  MALFORMED_EMAIL,
  emailFieldState,
  isCompleteEmail,
} from "@/lib/onboarding-v2-account-email";

describe("isCompleteEmail", () => {
  it("accepts a complete address and rejects malformed", () => {
    expect(isCompleteEmail("you@griit.app")).toBe(true);
    expect(isCompleteEmail("not-an-email")).toBe(false);
    expect(isCompleteEmail("you@x")).toBe(false);
    expect(isCompleteEmail("")).toBe(false);
  });
});

describe("emailFieldState", () => {
  it("marks malformed only after blur", () => {
    expect(emailFieldState("you@", false)).toBe("empty");
    expect(emailFieldState("you@", true)).toBe("malformed");
    expect(emailFieldState("you@griit.app", true)).toBe("ok");
  });
});

describe("identity copy", () => {
  it("keeps the brief strings", () => {
    expect(EMAIL_TAKEN_NOTICE).toBe(
      "That email already has a GRIIT account. Log in and today's progress comes with you."
    );
    expect(GUEST_PROGRESS_STAYS).toBe("Guest progress stays on this device.");
    expect(CONFIRM_EMAIL_NOTICE("a@b.co")).toBe("We'll confirm at a@b.co — correct?");
    expect(MALFORMED_EMAIL).toBe("That is not a complete email address.");
  });
});
