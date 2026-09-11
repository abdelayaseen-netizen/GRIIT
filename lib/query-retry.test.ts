import { describe, expect, it } from "vitest";
import { shouldRetryQuery, trpcErrorCode } from "@/lib/query-retry";

describe("shouldRetryQuery", () => {
  it("does not retry NOT_FOUND, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST", () => {
    expect(shouldRetryQuery(0, { data: { code: "NOT_FOUND" } })).toBe(false);
    expect(shouldRetryQuery(0, { code: "UNAUTHORIZED" })).toBe(false);
    expect(shouldRetryQuery(0, new Error("tRPC query failed: profiles.get (404)"))).toBe(false);
    expect(shouldRetryQuery(0, new Error("tRPC query failed: profiles.getFollowCounts (400)"))).toBe(
      false
    );
    expect(shouldRetryQuery(0, new Error("tRPC query failed: x (403)"))).toBe(false);
    expect(shouldRetryQuery(0, new Error("tRPC query failed: x (401)"))).toBe(false);
  });

  it("retries other errors up to 2 times", () => {
    const err = new Error("tRPC query failed: profiles.get (500)");
    expect(shouldRetryQuery(0, err)).toBe(true);
    expect(shouldRetryQuery(1, err)).toBe(true);
    expect(shouldRetryQuery(2, err)).toBe(false);
  });
});

describe("trpcErrorCode", () => {
  it("reads code from data.code or HTTP status in the message", () => {
    expect(trpcErrorCode({ data: { code: "NOT_FOUND" } })).toBe("NOT_FOUND");
    expect(trpcErrorCode(new Error("tRPC query failed: profiles.get (404)"))).toBe("NOT_FOUND");
  });
});
