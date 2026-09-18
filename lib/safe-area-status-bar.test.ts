import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("safe area and status bar", () => {
  it("keeps Capture Cancel and titles below the top inset", () => {
    const capture = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/CaptureStep.tsx"),
      "utf8",
    );
    expect(capture).toContain("useSafeAreaInsets");
    expect(capture).toContain("paddingTop: insets.top");
  });

  it("uses light status bar on dark chrome and dark on the light edit sheet", () => {
    const root = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    expect(root).toContain('barStyle="light-content"');
    expect(root).not.toContain('barStyle="dark-content"');
    const edit = readFileSync(resolve(__dirname, "../app/edit-profile.tsx"), "utf8");
    expect(edit).toContain('barStyle="dark-content"');
    const camera = readFileSync(
      resolve(__dirname, "../components/task-v2/TaskCapture.tsx"),
      "utf8",
    );
    expect(camera).toContain('barStyle="light-content"');
  });
});
