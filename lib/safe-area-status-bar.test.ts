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

  it("covers the status bar with solid canvas so FinishMoment and Home cannot scroll under it", () => {
    const backing = readFileSync(
      resolve(__dirname, "../components/ds/StatusBarBacking.tsx"),
      "utf8",
    );
    const finish = readFileSync(
      resolve(__dirname, "../components/task-v2/FinishMomentV3.tsx"),
      "utf8",
    );
    const home = readFileSync(resolve(__dirname, "../components/home/HomeV3.tsx"), "utf8");
    const tab = readFileSync(resolve(__dirname, "../app/(tabs)/index.tsx"), "utf8");
    expect(backing).toContain("height: insets.top");
    expect(backing).toContain("DS_V3.color.canvas");
    expect(backing).toContain('position: "absolute"');
    expect(finish).toContain("StatusBarBacking");
    expect(finish).toContain("paddingTop: insets.top");
    expect(home).toContain("paddingTop: insets.top");
    expect(tab).toContain("StatusBarBacking");
    expect(tab).toContain('edges={["left", "right"]}');
  });

  it("uses light status bar on dark chrome and dark on the light edit sheet", () => {
    const root = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    expect(root).toContain('barStyle="light-content"');
    expect(root).not.toContain('barStyle="dark-content"');
    const edit = readFileSync(resolve(__dirname, "../app/edit-profile.tsx"), "utf8");
    expect(edit).toContain('barStyle="light-content"');
    const camera = readFileSync(
      resolve(__dirname, "../components/task-v2/TaskCapture.tsx"),
      "utf8",
    );
    expect(camera).toContain('barStyle="light-content"');
  });
});
