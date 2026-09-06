import { describe, expect, it } from "vitest";
import {
  PROFILE_BIO_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_USERNAME_MAX,
  profileUpdateInputSchema,
} from "@/lib/profile-update-schema";

describe("profileUpdateInputSchema caps", () => {
  it("accepts identity fields at the client maxima", () => {
    const parsed = profileUpdateInputSchema.parse({
      username: "a".repeat(PROFILE_USERNAME_MAX),
      display_name: "n".repeat(PROFILE_DISPLAY_NAME_MAX),
      bio: "b".repeat(PROFILE_BIO_MAX),
    });
    expect(parsed.username).toHaveLength(20);
    expect(parsed.display_name).toHaveLength(30);
    expect(parsed.bio).toHaveLength(150);
  });

  it("rejects username, display name, and bio over the client caps", () => {
    expect(profileUpdateInputSchema.safeParse({ username: "ab" }).success).toBe(false);
    expect(
      profileUpdateInputSchema.safeParse({ username: "a".repeat(PROFILE_USERNAME_MAX + 1) }).success
    ).toBe(false);
    expect(
      profileUpdateInputSchema.safeParse({
        display_name: "n".repeat(PROFILE_DISPLAY_NAME_MAX + 1),
      }).success
    ).toBe(false);
    expect(profileUpdateInputSchema.safeParse({ bio: "b".repeat(PROFILE_BIO_MAX + 1) }).success).toBe(
      false
    );
  });
});
