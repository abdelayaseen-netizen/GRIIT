import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("capture shutter", () => {
  it("uses a textPrimary ring and fill, scrim pills, and the library caption", () => {
    const src = readFileSync(
      resolve(__dirname, "../components/task-v2/TaskCapture.tsx"),
      "utf8",
    );
    expect(src).toContain("Taken in the app. The library is not an option.");
    expect(src).toContain("const SHUTTER = 78");
    expect(src).toContain("DS_V3.color.textPrimary");
    expect(src).toContain("rgba(15,15,15,0.55)");
    expect(src).not.toContain("Shutter fill is surface");
    expect(src).not.toContain("backgroundColor: DS_V3.color.surface");
  });
});
