import { describe, expect, it, vi } from "vitest";
import { bundleTaskFinish } from "./finish-bundle";

const securePayload = {
  success: true,
  secured: true,
  alreadySecured: false,
  newStreakCount: 3,
  challenge_done: false,
  remaining_challenges: 0,
  freezeGranted: false,
  freezesHeld: 0,
  freezeCap: 2,
  freezeAtCap: false,
};

describe("bundleTaskFinish", () => {
  it("one call completes the task and secures the day", async () => {
    const secure = vi.fn().mockResolvedValue(securePayload);
    const share = vi.fn().mockResolvedValue(undefined);
    const result = await bundleTaskFinish({
      requiredRemaining: 0,
      applyShare: true,
      eventId: "22222222-2222-4222-8222-222222222222",
      secure,
      share,
    });
    expect(secure).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith("22222222-2222-4222-8222-222222222222");
    expect(result.daySecureAttempted).toBe(true);
    expect(result.daySecure).toEqual(securePayload);
    expect(result.shared).toBe(true);
  });

  it("does not secure when required tasks remain, and does not share without a choice", async () => {
    const secure = vi.fn();
    const share = vi.fn();
    const result = await bundleTaskFinish({
      requiredRemaining: 2,
      applyShare: false,
      eventId: "22222222-2222-4222-8222-222222222222",
      secure,
      share,
    });
    expect(secure).not.toHaveBeenCalled();
    expect(share).not.toHaveBeenCalled();
    expect(result.daySecure).toBeNull();
    expect(result.daySecureAttempted).toBe(false);
    expect(result.shared).toBe(false);
  });

  it("keeps the task save when secure or share throws", async () => {
    const result = await bundleTaskFinish({
      requiredRemaining: 0,
      applyShare: true,
      eventId: "22222222-2222-4222-8222-222222222222",
      secure: () => Promise.reject(new Error("NOT_ALL_REQUIRED")),
      share: () => Promise.reject(new Error("share failed")),
    });
    expect(result.daySecureAttempted).toBe(true);
    expect(result.daySecure).toBeNull();
    expect(result.shared).toBe(false);
  });
});
