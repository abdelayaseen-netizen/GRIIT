import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cameraPermissionGate } from "./camera-permission-gate";

describe("cameraPermissionGate", () => {
  it("undetermined → request, then granted → camera", () => {
    expect(
      cameraPermissionGate({ granted: false, canAskAgain: true, status: "undetermined" }),
    ).toBe("request");
    expect(
      cameraPermissionGate({ granted: true, canAskAgain: true, status: "granted" }),
    ).toBe("camera");
  });

  it("undetermined → denied with canAskAgain still asks, not Settings", () => {
    const afterDeny = cameraPermissionGate({
      granted: false,
      canAskAgain: true,
      status: "denied",
    });
    expect(afterDeny).toBe("request");
    expect(afterDeny).not.toBe("settings");
  });

  it("denied and canAskAgain is false → Settings", () => {
    expect(
      cameraPermissionGate({ granted: false, canAskAgain: false, status: "denied" }),
    ).toBe("settings");
  });

  it("TaskCapture requests on undetermined and opens Settings only for the settings gate", () => {
    const src = readFileSync(resolve(__dirname, "../components/task-v2/TaskCapture.tsx"), "utf8");
    expect(src).toContain("cameraPermissionGate");
    expect(src).toContain("requestPermission()");
    expect(src).toContain('gate === "settings"');
    expect(src).toContain("Open Settings");
  });
});
