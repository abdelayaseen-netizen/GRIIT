import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const flow = readFileSync(resolve(root, "components/task-v2/useTaskFlowV2.ts"), "utf8");
const upload = readFileSync(resolve(root, "lib/uploadProofImage.ts"), "utf8");
const checkins = readFileSync(resolve(root, "backend/trpc/routes/checkins.ts"), "utf8");
const home = readFileSync(resolve(root, "components/home/HomeV3.tsx"), "utf8");

describe("build 90 speed wiring", () => {
  it("resizes then uploads the file, and uses the cached session", () => {
    expect(flow).toContain("shrinkProofForUpload");
    expect(flow).toContain("uploadProofImageFromFile");
    expect(flow).not.toContain("uploadProofImageFromBase64");
    expect(flow).not.toContain("readAsStringAsync");
    expect(upload).toContain("uploadProofImageFromFile");
    expect(upload).toContain("auth.getSession");
    expect(upload).not.toContain("auth.getUser");
  });

  it("logs every finish step", () => {
    expect(flow).toContain("photoReadMs");
    expect(flow).toContain("uploadMs");
    expect(flow).toContain("completeMs");
    expect(flow).toContain("secureMs");
    expect(flow).toContain("shareMs");
    expect(flow).toContain("homeRefetchMs");
  });

  it("secures and shares inside checkins.complete and keeps the old procedures", () => {
    const complete = checkins.slice(checkins.indexOf("complete:"), checkins.indexOf("startSession:"));
    expect(complete).toContain("bundleTaskFinish");
    expect(complete).toContain("applyShare");
    expect(checkins).toContain("secureDay: protectedProcedure");
    expect(checkins).toContain("shareProof: protectedProcedure");
  });

  it("marks the task done locally and shows the save retry on Home", () => {
    expect(flow).toContain("markOptimisticTaskDone");
    expect(flow).toContain("rollbackOptimisticTaskDone");
    expect(home).toContain("home-save-retry");
    expect(home).toContain("Couldn't save. Tap to try again.");
  });

  it("waits on Balanced location only when the task is location-gated", () => {
    expect(flow).toContain("finishWaitsOnLocation");
    expect(flow).toContain("Accuracy.Balanced");
    expect(flow).not.toContain("Accuracy.High");
    expect(flow).toContain("LOCATION_FIX_TIMEOUT_MS");
    expect(flow).toContain("submitInFlight.current = true");
    const photoFn = flow.slice(flow.indexOf("const submitPhoto"), flow.indexOf("const submitWithoutPhoto"));
    expect(photoFn.indexOf("submitInFlight.current = true")).toBeGreaterThan(-1);
    expect(photoFn.indexOf("submitInFlight.current = true")).toBeLessThan(photoFn.indexOf("await uploadPhoto"));
  });
});
