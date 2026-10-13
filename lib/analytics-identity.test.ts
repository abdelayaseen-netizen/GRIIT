import { describe, expect, it } from "vitest";
import { accountSaveDistinctId } from "@/lib/analytics-identity";

describe("accountSaveDistinctId", () => {
  it("keeps the guest distinct id when the auth user changes", () => {
    expect(accountSaveDistinctId({ guestDistinctId: "guest-1", nextUserId: "real-1" })).toEqual({
      distinctId: "guest-1",
      aliasUserId: "real-1",
    });
  });

  it("does not alias when the saved account is the same user", () => {
    expect(accountSaveDistinctId({ guestDistinctId: "guest-1", nextUserId: "guest-1" })).toEqual({
      distinctId: "guest-1",
      aliasUserId: null,
    });
  });
});
