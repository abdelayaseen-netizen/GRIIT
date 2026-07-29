import { describe, it, expect } from "vitest";
import { photoProofPayloadSchema } from "./proof-payload";

describe("photoProofPayloadSchema", () => {
  it("accepts a valid camera capture payload", () => {
    const parsed = photoProofPayloadSchema.parse({
      capturedAt: "2026-07-28T11:42:00.000Z",
      captured_in_app: true,
    });
    expect(parsed).toEqual({
      capturedAt: "2026-07-28T11:42:00.000Z",
      captured_in_app: true,
    });
  });

  it("rejects missing captured_in_app", () => {
    const result = photoProofPayloadSchema.safeParse({
      capturedAt: "2026-07-28T11:42:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-datetime capturedAt", () => {
    const result = photoProofPayloadSchema.safeParse({
      capturedAt: "07:42",
      captured_in_app: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra keys (.strict — open records accumulate garbage)", () => {
    const result = photoProofPayloadSchema.safeParse({
      capturedAt: "2026-07-28T11:42:00.000Z",
      captured_in_app: true,
      strava_id: "should-not-pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean captured_in_app", () => {
    const result = photoProofPayloadSchema.safeParse({
      capturedAt: "2026-07-28T11:42:00.000Z",
      captured_in_app: "true",
    });
    expect(result.success).toBe(false);
  });
});
