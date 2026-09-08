import { describe, expect, it } from "vitest";
import {
  failedUploadCopy,
  failureErrorCode,
  failureScreenCopy,
  verificationLine,
} from "@/lib/task-completion-copy";

describe("verificationLine", () => {
  it("matches README §6 verbatim", () => {
    expect(verificationLine({ kind: "photo", timeLabel: "9:17 PM" })).toBe(
      "Captured live in the app · 9:17 PM"
    );
    expect(verificationLine({ kind: "timer", durationLabel: "10:00", startedAtLabel: "6:02 PM" })).toBe(
      "Timer ran 10:00 · started 6:02 PM"
    );
    expect(
      verificationLine({ kind: "run", distanceLabel: "5.02 km", durationLabel: "27:41" })
    ).toBe("Photo captured live · 5.02 km and 27:41 self-entered");
    expect(verificationLine({ kind: "workout", durationLabel: "45 min" })).toBe(
      "Photo captured live · 45 min self-entered"
    );
    expect(verificationLine({ kind: "journal", words: 150 })).toBe("Word count met · 150 words");
    expect(verificationLine({ kind: "counter" })).toBe("Self-entered count · nothing was checked");
    expect(verificationLine({ kind: "checkin", gpsMeters: 24, accuracyM: 8 })).toBe(
      "GPS 24 m from the saved location · ±8 m accuracy"
    );
    expect(verificationLine({ kind: "manual" })).toBe("Nothing was checked. You said you did it.");
  });
});

describe("failedUploadCopy", () => {
  it("says retry secures today's date, not the capture date (Q11)", () => {
    expect(failedUploadCopy().retryNote).toBe("Retry will secure today's date, not the capture date.");
  });
});

describe("failureScreenCopy", () => {
  it("BAD_REQUEST shows the server message, Go back, and never mentions a saved photo", () => {
    const copy = failureScreenCopy({
      errorCode: "BAD_REQUEST",
      message: "This task requires a photo. Please take a photo to verify completion.",
      hasLocalPhoto: false,
    });
    expect(copy.kind).toBe("validation");
    expect(copy.body).toBe("This task requires a photo. Please take a photo to verify completion.");
    expect(copy.primaryLabel).toBe("Go back");
    expect(copy.primaryAction).toBe("back");
    expect(copy.body.toLowerCase()).not.toMatch(/saved/);
    expect(copy.retryNote).toBeUndefined();
  });

  it("BAD_REQUEST with a local photo still does not claim the photo is saved", () => {
    const copy = failureScreenCopy({
      errorCode: "BAD_REQUEST",
      message: "Hard mode: this task can only be completed between 06:00 and 08:00.",
      hasLocalPhoto: true,
    });
    expect(copy.primaryAction).toBe("back");
    expect(copy.body.toLowerCase()).not.toMatch(/saved on this device/);
  });

  it("network failure with a local photo uses the upload copy and Retry now", () => {
    const upload = failedUploadCopy();
    const copy = failureScreenCopy({
      errorCode: undefined,
      message: "Network request failed",
      hasLocalPhoto: true,
    });
    expect(copy.kind).toBe("upload");
    expect(copy.headline).toBe(upload.headline);
    expect(copy.body).toBe(upload.body);
    expect(copy.primaryLabel).toBe("Retry now");
    expect(copy.primaryAction).toBe("retry");
  });

  it("network failure without a local photo does not claim a saved photo", () => {
    const copy = failureScreenCopy({
      errorCode: "TIMEOUT",
      message: "Couldn't save. Try again.",
      hasLocalPhoto: false,
    });
    expect(copy.kind).toBe("upload");
    expect(copy.primaryAction).toBe("retry");
    expect(copy.body.toLowerCase()).not.toMatch(/saved on this device/);
  });

  it("reads BAD_REQUEST from a thrown tRPC-shaped error", () => {
    const err = Object.assign(new Error("This task requires a photo."), {
      data: { code: "BAD_REQUEST" },
    });
    expect(failureErrorCode(err)).toBe("BAD_REQUEST");
  });
});
