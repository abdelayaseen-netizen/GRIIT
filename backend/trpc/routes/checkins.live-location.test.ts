import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { haversineDistance } from "../../lib/geo";
import {
  decideLiveLocationGate,
  DEFAULT_LOCATION_RADIUS_METERS,
  NOT_AT_LOCATION,
} from "./checkins";

const TARGET = { lat: 40.7484, lng: -73.9857 };
const NOW = Date.parse("2026-10-03T15:00:00.000Z");

function eastOf(meters: number): { lat: number; lng: number } {
  const cos = Math.cos((TARGET.lat * Math.PI) / 180);
  const dLng = meters / (111_320 * cos);
  return { lat: TARGET.lat, lng: TARGET.lng + dLng };
}

function fixAt(meters: number, extra?: { accuracyM?: number; capturedAt?: string }) {
  const point = eastOf(meters);
  return {
    lat: point.lat,
    lng: point.lng,
    accuracyM: extra?.accuracyM ?? 12,
    capturedAt: extra?.capturedAt ?? new Date(NOW).toISOString(),
  };
}

describe("decideLiveLocationGate", () => {
  it("passes inside the task radius", () => {
    const live = fixAt(50);
    const distance = haversineDistance(TARGET.lat, TARGET.lng, live.lat, live.lng);
    expect(distance).toBeLessThan(DEFAULT_LOCATION_RADIUS_METERS);
    const decision = decideLiveLocationGate({
      required: true,
      live,
      targetLat: TARGET.lat,
      targetLng: TARGET.lng,
      radiusMeters: DEFAULT_LOCATION_RADIUS_METERS,
      nowMs: NOW,
    });
    expect(decision.kind).toBe("passed");
    if (decision.kind === "passed") expect(decision.distanceM).toBeCloseTo(distance, 5);
  });

  it("rejects outside the radius", () => {
    const decision = decideLiveLocationGate({
      required: true,
      live: fixAt(DEFAULT_LOCATION_RADIUS_METERS + 40),
      targetLat: TARGET.lat,
      targetLng: TARGET.lng,
      radiusMeters: 200,
      nowMs: NOW,
    });
    expect(decision).toEqual({ kind: "rejected" });
    expect(NOT_AT_LOCATION).toBe("Not at the location.");
  });

  it("uses 200 m when location_radius_meters is null", () => {
    const inside = decideLiveLocationGate({
      required: true,
      live: fixAt(180),
      targetLat: TARGET.lat,
      targetLng: TARGET.lng,
      radiusMeters: null,
      nowMs: NOW,
    });
    const outside = decideLiveLocationGate({
      required: true,
      live: fixAt(240),
      targetLat: TARGET.lat,
      targetLng: TARGET.lng,
      radiusMeters: undefined,
      nowMs: NOW,
    });
    expect(inside.kind).toBe("passed");
    expect(outside.kind).toBe("rejected");
    expect(DEFAULT_LOCATION_RADIUS_METERS).toBe(200);
  });

  it("rejects accuracy worse than 100 m", () => {
    expect(
      decideLiveLocationGate({
        required: true,
        live: fixAt(10, { accuracyM: 100 }),
        targetLat: TARGET.lat,
        targetLng: TARGET.lng,
        radiusMeters: 200,
        nowMs: NOW,
      }).kind
    ).toBe("passed");
    expect(
      decideLiveLocationGate({
        required: true,
        live: fixAt(10, { accuracyM: 101 }),
        targetLat: TARGET.lat,
        targetLng: TARGET.lng,
        radiusMeters: 200,
        nowMs: NOW,
      }).kind
    ).toBe("rejected");
  });

  it("rejects a fix older than 60 seconds", () => {
    expect(
      decideLiveLocationGate({
        required: true,
        live: fixAt(10, { capturedAt: new Date(NOW - 60_000).toISOString() }),
        targetLat: TARGET.lat,
        targetLng: TARGET.lng,
        radiusMeters: 200,
        nowMs: NOW,
      }).kind
    ).toBe("passed");
    expect(
      decideLiveLocationGate({
        required: true,
        live: fixAt(10, { capturedAt: new Date(NOW - 60_001).toISOString() }),
        targetLat: TARGET.lat,
        targetLng: TARGET.lng,
        radiusMeters: 200,
        nowMs: NOW,
      }).kind
    ).toBe("rejected");
  });

  it("accepts a missing fix without a location claim", () => {
    expect(
      decideLiveLocationGate({
        required: true,
        live: undefined,
        targetLat: TARGET.lat,
        targetLng: TARGET.lng,
        radiusMeters: 200,
        nowMs: NOW,
      })
    ).toEqual({ kind: "legacy_unclaimed" });
  });
});

describe("live location wiring", () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const checkins = readFileSync(path.join(here, "checkins.ts"), "utf8");
  const client = readFileSync(path.join(here, "../../../components/task-v2/useTaskFlowV2.ts"), "utf8");

  it("records the gate only when the live fix passes", () => {
    expect(checkins).toContain('code: "FORBIDDEN", message: NOT_AT_LOCATION');
    expect(checkins).toContain("[checkins.complete] liveLocation absent; location gate not recorded");
    expect(checkins).toContain("location_verified: locationGatePassed");
    expect(checkins).not.toContain(
      "location_verified: !!(input.location_latitude != null && input.location_longitude != null && requireLocation)",
    );
  });

  it("does not send the task coordinates as the user position", () => {
    expect(client).toContain("body.liveLocation");
    expect(client).not.toContain("location_latitude: config.location_latitude");
    expect(client).not.toContain("location_longitude: config.location_longitude");
  });
});
