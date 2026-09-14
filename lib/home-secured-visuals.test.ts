import { describe, expect, it } from "vitest";
import { DS_COLORS_V2, DS_V3 } from "@/lib/design-system";
import { homeProofFilled, homeSecuredToday } from "@/lib/home-secured-visuals";

const TODAY = "2026-09-13";

describe("homeSecuredToday + homeProofFilled", () => {
  it("checkin exists but securedDateKeys lacks today → all three unfilled", () => {
    const checkinExists = true;
    const secured = homeSecuredToday(["2026-09-12"], TODAY);
    expect(checkinExists).toBe(true);
    expect(secured).toBe(false);
    const v = homeProofFilled(secured);
    expect(v.posted).toBe(false);
    expect(v.circleFill).toBe(DS_V3.color.border);
    expect(v.todaySquareFilled).toBe(false);
  });

  it("securedDateKeys has today → all three filled", () => {
    const v = homeProofFilled(homeSecuredToday([TODAY], TODAY));
    expect(v.posted).toBe(true);
    expect(v.circleFill).toBe(DS_COLORS_V2.brand.primary);
    expect(v.todaySquareFilled).toBe(true);
  });
});
