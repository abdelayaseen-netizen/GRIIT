import { describe, it, expect } from "vitest";
import {
  buildRunVerification,
  formatLoggedWindowLabel,
  formatRunEntryLabel,
  formatRunKm,
} from "./run-verification";

describe("formatRunKm", () => {
  it("formats integers and decimals", () => {
    expect(formatRunKm(5)).toBe("5");
    expect(formatRunKm(5.2)).toBe("5.2");
    expect(formatRunKm(5.25)).toBe("5.25");
  });
});

describe("formatLoggedWindowLabel", () => {
  it("formats inside / outside copy", () => {
    expect(formatLoggedWindowLabel("07:12", true)).toBe(
      "Logged 07:12 — inside the window"
    );
    expect(formatLoggedWindowLabel("09:00", false)).toBe(
      "Logged 09:00 — outside the window"
    );
  });
});

describe("formatRunEntryLabel", () => {
  it("uses Entered by hand for hand mode", () => {
    expect(formatRunEntryLabel("hand", 5.2, 32)).toBe(
      "Entered by hand · 5.2 km in 32 min"
    );
  });

  it("uses Timed in-app for timer mode — never Entered by hand", () => {
    expect(formatRunEntryLabel("timer", 5.2, 32)).toBe(
      "Timed in-app · 5.2 km in 32 min"
    );
    expect(formatRunEntryLabel("timer", 5.2, 32)).not.toContain(
      "Entered by hand"
    );
  });
});

describe("buildRunVerification", () => {
  it("includes window + hand entry + in-app photo when proven", () => {
    const verification = buildRunVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "07:12" },
      runLog: { distance_km: 5.2, duration_min: 32, entry_mode: "hand" },
      photoPresent: true,
      proofPayload: {
        capturedAt: "2026-07-28T11:12:00.000Z",
        captured_in_app: true,
      },
    });
    expect(verification.rows).toEqual([
      {
        key: "time_window",
        label: "Logged 07:12 — inside the window",
        verified: true,
        role: "check",
      },
      {
        key: "run_entry",
        label: "Entered by hand · 5.2 km in 32 min",
        verified: true,
        role: "record",
      },
      {
        key: "camera_in_app",
        label: "Marked as captured in-app",
        verified: true,
        role: "record",
      },
    ]);
  });

  it("uses Timed in-app row for timer entry_mode", () => {
    const verification = buildRunVerification({
      window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
      runLog: { distance_km: 3, duration_min: 20, entry_mode: "timer" },
      photoPresent: false,
      proofPayload: null,
    });
    expect(verification.rows).toEqual([
      {
        key: "run_entry",
        label: "Timed in-app · 3 km in 20 min",
        verified: true,
        role: "record",
      },
    ]);
  });

  it("omits photo row when no photo / captured_in_app absent", () => {
    const verification = buildRunVerification({
      window: { hasWindow: true, passed: true, checkedAtHHMM: "07:12" },
      runLog: { distance_km: 5.2, duration_min: 32, entry_mode: "hand" },
      photoPresent: false,
      proofPayload: null,
    });
    expect(verification.rows.map((r) => r.key)).toEqual([
      "time_window",
      "run_entry",
    ]);
  });

  it("marks time row failed when outside the window", () => {
    const verification = buildRunVerification({
      window: { hasWindow: true, passed: false, checkedAtHHMM: "09:15" },
      runLog: { distance_km: 5.2, duration_min: 32, entry_mode: "hand" },
      photoPresent: false,
    });
    expect(verification.rows[0]).toEqual({
      key: "time_window",
      label: "Logged 09:15 — outside the window",
      verified: false,
      role: "check",
    });
  });
});

/**
 * bd95024 narrowed isRunProof (dropped duration_min/entry_mode alone).
 * Lock: every run client input that step 16/17 ships still classifies as run
 * under both predicates, and the shaper rows stay byte-identical.
 */
describe("bd95024 run-path lock (run client inputs)", () => {
  type RunClientInput = {
    taskType: string;
    distance_km?: number;
    duration_min?: number;
    entry_mode?: "hand" | "timer";
    value?: number;
  };

  /** Step 16/17 discrimination (pre-bd95024). */
  function isRunProofLegacy(input: RunClientInput): boolean {
    return (
      input.taskType === "run" ||
      input.distance_km != null ||
      input.duration_min != null ||
      input.entry_mode != null
    );
  }

  /** Current discrimination (bd95024). */
  function isRunProofCurrent(input: RunClientInput): boolean {
    return input.taskType === "run" || input.distance_km != null;
  }

  function runLogFactsFrom(input: RunClientInput) {
    const sharedDurationMin =
      input.duration_min ??
      (typeof input.value === "number" ? input.value : undefined);
    const isRun = isRunProofCurrent(input);
    return isRun &&
      typeof input.distance_km === "number" &&
      typeof sharedDurationMin === "number" &&
      (input.entry_mode === "hand" || input.entry_mode === "timer")
      ? {
          distance_km: input.distance_km,
          duration_min: sharedDurationMin,
          entry_mode: input.entry_mode,
        }
      : null;
  }

  const RUN_CLIENT_INPUTS: RunClientInput[] = [
    {
      taskType: "run",
      distance_km: 5.2,
      duration_min: 32,
      entry_mode: "hand",
    },
    {
      taskType: "run",
      distance_km: 3,
      duration_min: 20,
      entry_mode: "timer",
    },
    {
      taskType: "run",
      distance_km: 5.2,
      entry_mode: "hand",
      value: 32,
    },
    {
      taskType: "run",
      distance_km: 4.5,
      duration_min: 28,
      entry_mode: "timer",
      value: 28,
    },
  ];

  it("legacy and current isRunProof agree (and are true) for every run client input", () => {
    for (const input of RUN_CLIENT_INPUTS) {
      expect(isRunProofLegacy(input)).toBe(true);
      expect(isRunProofCurrent(input)).toBe(true);
      expect(isRunProofCurrent(input)).toBe(isRunProofLegacy(input));
    }
  });

  it("shaper output is byte-identical for every run verifying shape (step 16 goldens)", () => {
    const cases = [
      {
        opts: {
          window: { hasWindow: true, passed: true, checkedAtHHMM: "07:12" },
          runLog: runLogFactsFrom({
            taskType: "run",
            distance_km: 5.2,
            duration_min: 32,
            entry_mode: "hand" as const,
          }),
          photoPresent: true,
          proofPayload: {
            capturedAt: "2026-07-28T11:12:00.000Z",
            captured_in_app: true,
          },
        },
        rows: [
          {
            key: "time_window",
            label: "Logged 07:12 — inside the window",
            verified: true,
            role: "check",
          },
          {
            key: "run_entry",
            label: "Entered by hand · 5.2 km in 32 min",
            verified: true,
            role: "record",
          },
          {
            key: "camera_in_app",
            label: "Marked as captured in-app",
            verified: true,
            role: "record",
          },
        ],
      },
      {
        opts: {
          window: { hasWindow: false, passed: true, checkedAtHHMM: "12:00" },
          runLog: runLogFactsFrom({
            taskType: "run",
            distance_km: 3,
            duration_min: 20,
            entry_mode: "timer" as const,
          }),
          photoPresent: false,
          proofPayload: null,
        },
        rows: [
          {
            key: "run_entry",
            label: "Timed in-app · 3 km in 20 min",
            verified: true,
            role: "record",
          },
        ],
      },
      {
        opts: {
          window: { hasWindow: true, passed: true, checkedAtHHMM: "07:12" },
          runLog: runLogFactsFrom({
            taskType: "run",
            distance_km: 5.2,
            duration_min: 32,
            entry_mode: "hand" as const,
          }),
          photoPresent: false,
          proofPayload: null,
        },
        rows: [
          {
            key: "time_window",
            label: "Logged 07:12 — inside the window",
            verified: true,
            role: "check",
          },
          {
            key: "run_entry",
            label: "Entered by hand · 5.2 km in 32 min",
            verified: true,
            role: "record",
          },
        ],
      },
      {
        opts: {
          window: { hasWindow: true, passed: false, checkedAtHHMM: "09:15" },
          runLog: runLogFactsFrom({
            taskType: "run",
            distance_km: 5.2,
            duration_min: 32,
            entry_mode: "hand" as const,
          }),
          photoPresent: false,
          proofPayload: null,
        },
        rows: [
          {
            key: "time_window",
            label: "Logged 09:15 — outside the window",
            verified: false,
            role: "check",
          },
          {
            key: "run_entry",
            label: "Entered by hand · 5.2 km in 32 min",
            verified: true,
            role: "record",
          },
        ],
      },
    ] as const;

    for (const c of cases) {
      expect(c.opts.runLog).not.toBeNull();
      expect(buildRunVerification(c.opts).rows).toEqual(c.rows);
    }
  });
});
