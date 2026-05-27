import { describe, it, expect } from "vitest";
// Helper lives in `./feedCaption` (JSX-free) and is re-exported by FeedPostCard.tsx.
// We import from the source module directly so vitest doesn't have to transform JSX.
import { isFakeCaption } from "./feedCaption";

describe("isFakeCaption", () => {
  it("returns true for null / empty / whitespace", () => {
    expect(isFakeCaption(null, "X")).toBe(true);
    expect(isFakeCaption("", "X")).toBe(true);
    expect(isFakeCaption("   ", "X")).toBe(true);
  });
  it("returns true when caption matches task name (case-insensitive)", () => {
    expect(isFakeCaption("Drink Water Today", "Drink Water Today")).toBe(true);
    expect(isFakeCaption("DRINK WATER TODAY", "drink water today")).toBe(true);
  });
  it("returns true for known generic backend strings", () => {
    expect(isFakeCaption("Drink water and post a photo", "X")).toBe(true);
    expect(isFakeCaption("post a photo", "X")).toBe(true);
    expect(isFakeCaption("log today", "X")).toBe(true);
  });
  it("returns false for real user captions", () => {
    expect(isFakeCaption("3rd day in a row, almost skipped", "Workout")).toBe(false);
    expect(isFakeCaption("hard but did it", "Read")).toBe(false);
  });
});
