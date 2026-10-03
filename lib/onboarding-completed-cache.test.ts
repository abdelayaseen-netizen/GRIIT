import { beforeEach, describe, expect, it, vi } from "vitest";

const getItem = vi.fn(async (): Promise<string | null> => null);
const setItem = vi.fn(async (_key: string, _value: string) => undefined);

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: () => getItem(),
    setItem: (...args: [string, string]) => setItem(...args),
  },
}));

import {
  cacheOnboardingCompleted,
  readOnboardingCompletedCache,
} from "@/lib/onboarding-completed-cache";

describe("readOnboardingCompletedCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is true only for the literal cache flag", async () => {
    getItem.mockResolvedValue("true");
    expect(await readOnboardingCompletedCache()).toBe(true);
    getItem.mockResolvedValue(null);
    expect(await readOnboardingCompletedCache()).toBe(false);
    getItem.mockResolvedValue("false");
    expect(await readOnboardingCompletedCache()).toBe(false);
  });

  it("write is fire-and-forget cache", async () => {
    await cacheOnboardingCompleted();
    expect(setItem).toHaveBeenCalled();
  });
});
