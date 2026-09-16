import { describe, expect, it } from "vitest";
import {
  RESEND_LOCK_MS,
  resendIsLocked,
  resendSecondsLeft,
} from "@/lib/use-resend-countdown";

describe("useResendCountdown", () => {
  const t0 = 1_000_000;

  it("starts at 60", () => {
    expect(resendSecondsLeft(t0, t0)).toBe(60);
    expect(RESEND_LOCK_MS).toBe(60_000);
  });

  it("ticks", () => {
    expect(resendSecondsLeft(t0, t0 + 1_000)).toBe(59);
    expect(resendSecondsLeft(t0, t0 + 30_000)).toBe(30);
  });

  it("re-enables at 0", () => {
    expect(resendSecondsLeft(t0, t0 + RESEND_LOCK_MS)).toBe(0);
    expect(resendIsLocked(0)).toBe(false);
    expect(resendIsLocked(1)).toBe(true);
  });

  it("restarts on resend", () => {
    const t1 = t0 + RESEND_LOCK_MS;
    expect(resendSecondsLeft(t1, t1)).toBe(60);
    expect(resendIsLocked(resendSecondsLeft(t1, t1))).toBe(true);
  });
});
