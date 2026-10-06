import { describe, expect, it } from "vitest";
import { aboutVersionLine } from "./about-line";

describe("aboutVersionLine", () => {
  it("prints version, build, and a short commit", () => {
    expect(
      aboutVersionLine({ version: "1.0.0", build: "76", commit: "abcdef1234567" }),
    ).toBe("Version 1.0.0 (build 76) · commit abcdef1");
  });

  it("omits a missing build or commit", () => {
    expect(aboutVersionLine({ version: "1.0.0", build: "", commit: null })).toBe("Version 1.0.0");
  });
});
