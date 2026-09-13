import { describe, expect, it } from "vitest";
import { DS_COLORS_V2 } from "@/lib/design-system";
import { homeProofFilled, homeSecuredToday } from "@/lib/home-secured-visuals";

describe("homeProofFilled", () => {
  it("given secured-today true, CTA, circle, and today square are filled", () => {
    const v = homeProofFilled(true);
    expect(v.posted).toBe(true);
    expect(v.circleFill).toBe(DS_COLORS_V2.brand.primary);
    expect(v.todaySquareFilled).toBe(true);
  });

  it("given secured-today false, none are filled", () => {
    const v = homeProofFilled(false);
    expect(v.posted).toBe(false);
    expect(v.todaySquareFilled).toBe(false);
  });
});

describe("homeSecuredToday", () => {
  it("checkins posted today count as secured when date keys lag", () => {
    expect(homeSecuredToday({ dateKeysSaySecured: false, postedFromCheckins: true })).toBe(true);
  });
});
