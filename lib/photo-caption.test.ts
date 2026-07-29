import { describe, it, expect } from "vitest";
import {
  PHOTO_CAPTION_MAX,
  clampPhotoCaption,
  formatPhotoCaptionCounter,
} from "./photo-caption";

describe("clampPhotoCaption", () => {
  it("hard-caps at 120 — never returns 121 chars", () => {
    const long = "a".repeat(200);
    const out = clampPhotoCaption(long);
    expect(out.length).toBe(PHOTO_CAPTION_MAX);
    expect(out.length).toBe(120);
  });

  it("passes through short strings", () => {
    expect(clampPhotoCaption("hello")).toBe("hello");
  });
});

describe("formatPhotoCaptionCounter", () => {
  it("formats n / 120", () => {
    expect(formatPhotoCaptionCounter(34)).toBe("34 / 120");
    expect(formatPhotoCaptionCounter(0)).toBe("0 / 120");
    expect(formatPhotoCaptionCounter(120)).toBe("120 / 120");
  });

  it("never displays above 120", () => {
    expect(formatPhotoCaptionCounter(121)).toBe("120 / 120");
  });
});
