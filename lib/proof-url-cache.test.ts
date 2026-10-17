import { afterEach, describe, expect, it } from "vitest";
import { cachedProofUrl, clearProofUrlCache, proofPrefetchUrls } from "@/lib/proof-url-cache";

describe("proof url cache", () => {
  afterEach(() => clearProofUrlCache());

  it("keeps the first signed url until shortly before it expires", () => {
    const now = 1_000_000;
    expect(cachedProofUrl("a", "https://cdn/one", now)).toBe("https://cdn/one");
    expect(cachedProofUrl("a", "https://cdn/two", now + 60_000)).toBe("https://cdn/one");
    expect(cachedProofUrl("a", "https://cdn/two", now + 3500 * 1000)).toBe("https://cdn/two");
  });

  it("prefetches the first 12 http urls", () => {
    const urls = Array.from({ length: 14 }, (_, i) => `https://cdn/${i}.jpg`);
    expect(proofPrefetchUrls(["", "file://local", ...urls])).toHaveLength(12);
    expect(proofPrefetchUrls(urls)[0]).toBe("https://cdn/0.jpg");
  });
});
