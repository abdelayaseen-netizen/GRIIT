import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { evaluateTaskLocation } from "./checkin-complete-gates";

/** Target used across location-gate cases (origin + ~111 m per 0.001° lat). */
const TARGET = {
  require_location: true as const,
  location_latitude: 37.7749,
  location_longitude: -122.4194,
  location_radius_meters: 200,
  location_name: "Gym",
};

describe("evaluateTaskLocation — checkin location target gate", () => {
  it("checkin with no configured target: no location required (completes)", () => {
    const result = evaluateTaskLocation(
      { require_location: false },
      { require_location: false },
      {}
    );
    expect(result.locationDistanceM).toBeUndefined();
    expect(result.hardModeLocationGate).toBe(false);
  });

  it("checkin with configured target, coords inside radius: completes", () => {
    // ~11 m north of target — inside 200 m
    const result = evaluateTaskLocation(TARGET, { require_location: true }, {
      location_latitude: 37.7750,
      location_longitude: -122.4194,
    });
    expect(result.locationDistanceM).toBeTypeOf("number");
    expect(result.locationDistanceM!).toBeLessThanOrEqual(200);
    expect(result.hardModeLocationGate).toBe(false);
  });

  it("checkin with configured target, coords absent: rejected server-side", () => {
    expect(() =>
      evaluateTaskLocation(TARGET, { require_location: true }, {})
    ).toThrow(TRPCError);
    try {
      evaluateTaskLocation(TARGET, { require_location: true }, {});
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as TRPCError).message).toMatch(/requires location verification/i);
    }
  });

  it("checkin with configured target, coords outside radius: rejected", () => {
    // ~1.1 km north — outside 200 m
    expect(() =>
      evaluateTaskLocation(TARGET, { require_location: true }, {
        location_latitude: 37.7850,
        location_longitude: -122.4194,
      })
    ).toThrow(TRPCError);
    try {
      evaluateTaskLocation(
        TARGET,
        { require_location: true },
        {
          location_latitude: 37.7850,
          location_longitude: -122.4194,
        }
      );
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as TRPCError).message).toMatch(/within 200m/i);
    }
  });
});
