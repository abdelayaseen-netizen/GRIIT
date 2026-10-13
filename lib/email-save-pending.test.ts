import { describe, expect, it } from "vitest";
import { CHECK_EMAIL_TO_SAVE, emailSaveStillPending } from "@/lib/email-save-pending";

describe("emailSaveStillPending", () => {
  it("stays a guest until the email is confirmed", () => {
    expect(emailSaveStillPending({ is_anonymous: true, email_confirmed_at: null })).toBe(true);
    expect(emailSaveStillPending({ is_anonymous: false, email_confirmed_at: null })).toBe(true);
    expect(emailSaveStillPending({ is_anonymous: false, email_confirmed_at: "2026-10-12T00:00:00Z" })).toBe(
      false,
    );
    expect(CHECK_EMAIL_TO_SAVE).toBe("Check your email to save your streak");
  });
});
