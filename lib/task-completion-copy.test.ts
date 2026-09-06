import { describe, expect, it } from "vitest";
import { failedUploadCopy, verificationLine } from "@/lib/task-completion-copy";

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
