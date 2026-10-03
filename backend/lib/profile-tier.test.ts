import { describe, expect, it } from "vitest";
import { profileTierForSecuredDays } from "./profile-tier";

describe("profileTierForSecuredDays", () => {
  it("matches the bands previously written by secure_day", () => {
    expect(profileTierForSecuredDays(0)).toBe("Starter");
    expect(profileTierForSecuredDays(6)).toBe("Starter");
    expect(profileTierForSecuredDays(7)).toBe("Builder");
    expect(profileTierForSecuredDays(29)).toBe("Builder");
    expect(profileTierForSecuredDays(30)).toBe("Relentless");
    expect(profileTierForSecuredDays(89)).toBe("Relentless");
    expect(profileTierForSecuredDays(90)).toBe("Elite");
  });
});
