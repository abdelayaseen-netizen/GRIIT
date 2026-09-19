import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ControlPill on step screens", () => {
  it("Timer, Counter, Session and Failed use ds/ControlPill in a centred row", () => {
    const running = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/RunningStep.tsx"),
      "utf8",
    );
    const count = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/CountStep.tsx"),
      "utf8",
    );
    const session = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/SessionStep.tsx"),
      "utf8",
    );
    const failed = readFileSync(
      resolve(__dirname, "../components/task-v2/steps/FailedStep.tsx"),
      "utf8",
    );
    const pill = readFileSync(resolve(__dirname, "../components/ds/ControlPill.tsx"), "utf8");
    expect(pill).toContain("minHeight: DS_V3.size.tap");
    expect(pill).toContain("android_ripple={null}");
    expect(running).toContain('from "@/components/ds/ControlPill"');
    expect(running).toContain('icon="pause"');
    expect(running).not.toContain('variant="tertiary"');
    expect(count).toContain('icon="minus"');
    expect(count).toContain('icon="keyboard"');
    expect(session).not.toContain("styles.shareText");
    expect(session).toContain('label={STOP}');
    expect(failed).not.toContain("styles.shareText");
    expect(failed).toContain('label="Keep it for later"');
  });
});
