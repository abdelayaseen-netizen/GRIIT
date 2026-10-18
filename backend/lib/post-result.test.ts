import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { postBadgeFrom, postResultFacts, postResultFromMetadata, postResultFromStrava } from "./post-result";
import { SELF_LIKE_MESSAGE, selfLikeRejected } from "./feed-like";

const root = resolve(fileURLToPath(import.meta.url), "../../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("build 92 04.1 · result facts written with the post", () => {
  it("a run keeps km, minutes and the task's unit", () => {
    expect(postResultFacts({ taskType: "run", run: { distance_km: 4.828, duration_min: 27.5 }, configUnit: "miles" })).toEqual({
      kind: "run",
      distance_km: 4.828,
      duration_min: 27.5,
      distance_unit: "mi",
    });
    expect(postResultFacts({ taskType: "run", run: { distance_km: 5, duration_min: 30 }, configUnit: undefined })?.distance_unit).toBe("km");
  });
  it("workout, counter, timer, journal", () => {
    expect(postResultFacts({ taskType: "workout", workout: { kind: "Lift", duration_min: 45 } })).toEqual({ kind: "workout", workout_kind: "Lift", duration_min: 45 });
    expect(postResultFacts({ taskType: "reading", counter: { count: 12, unit_plural: "pages" } })).toEqual({ kind: "counter", count: 12, unit: "pages" });
    expect(postResultFacts({ taskType: "timer", timerMinutes: 20 })).toEqual({ kind: "timer", duration_min: 20 });
    expect(postResultFacts({ taskType: "journal" })).toEqual({ kind: "journal" });
    expect(postResultFacts({ taskType: "manual" })).toBeNull();
  });
  it("a Strava activity: metres and seconds become km and minutes", () => {
    expect(postResultFromStrava({ distance: 5000, moving_time: 1500, type: "Run" }, "km")).toEqual({
      kind: "run",
      distance_km: 5,
      duration_min: 25,
      distance_unit: "km",
    });
    expect(postResultFromStrava({ moving_time: 2700, sport_type: "WeightTraining" }, null)).toEqual({ kind: "workout", workout_kind: "WeightTraining", duration_min: 45 });
  });
  it("metadata without a result (build 91 posts) reads as null", () => {
    expect(postResultFromMetadata({})).toBeNull();
    expect(postResultFromMetadata({ result: { kind: "nope" } })).toBeNull();
    expect(postResultFromMetadata({ result: { kind: "timer", duration_min: 10 } })).toEqual({ kind: "timer", duration_min: 10 });
  });
  it("complete and the Strava webhook write the result; hydrate and getPost return result + badge", () => {
    const checkins = read("backend/trpc/routes/checkins.ts");
    expect(checkins).toContain("result: postResultFacts(");
    const webhook = read("backend/lib/strava-webhook.ts");
    expect(webhook).toContain("result: postResultFromStrava(");
    const hydrate = read("backend/lib/feed-activity-hydrate.ts");
    expect(hydrate).toContain("result: postResultFromMetadata(md)");
    expect(hydrate).toContain("badge: postBadgeFrom(md)");
    const feed = read("backend/trpc/routes/feed.ts");
    expect(feed).toContain("result: postResultFromMetadata(md)");
    expect(feed).toContain("badge: postBadgeFrom(md)");
  });
});

describe("build 92 04.2 · one badge", () => {
  it("Strava, camera, else self-reported", () => {
    expect(postBadgeFrom({ verification_method: "strava_activity" })).toBe("Verified by Strava");
    expect(postBadgeFrom({ verification_method: "photo", photo_url: "x" })).toBe("Verified");
    expect(postBadgeFrom({ proof_photo_url: "https://cdn/p.jpg" })).toBe("Verified");
    expect(postBadgeFrom({ verification_method: "self_reported" })).toBe("Self-reported");
    expect(postBadgeFrom({})).toBe("Self-reported");
  });
});

describe("build 92 04.5 · a self-like is rejected by the server", () => {
  it("owner === viewer is refused, anyone else is not", () => {
    expect(selfLikeRejected("u1", "u1")).toBe(true);
    expect(selfLikeRejected("u2", "u1")).toBe(false);
    expect(selfLikeRejected(null, "u1")).toBe(false);
  });
  it("feed.react looks the owner up before toggling and throws FORBIDDEN", () => {
    const feed = read("backend/trpc/routes/feed.ts");
    const react = feed.slice(feed.indexOf("react: protectedProcedure"), feed.indexOf("react: protectedProcedure") + 2200);
    const guard = react.indexOf("selfLikeRejected(");
    const toggle = react.indexOf('.from("feed_reactions")');
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(toggle);
    expect(react).toContain('code: "FORBIDDEN", message: SELF_LIKE_MESSAGE');
    expect(SELF_LIKE_MESSAGE).toBe("You can't like your own post.");
  });
});
