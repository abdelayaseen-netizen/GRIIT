import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  MARK_END_SEEN_FAILED,
  capCaption,
  combinedFooter,
  combinedTitle,
  dayStateForKey,
  endedChallengeFromUnseen,
  factLine,
  longestSecuredStreak,
  runMarkEndSeenOnDone,
  securedCount,
  shouldPresentEndScreen,
} from "./challenge-end";

describe("securedCount", () => {
  it("excludes frozen and Last Stand", () => {
    expect(
      securedCount(["camera", "self", "frozen", "last_stand", "missed"]),
    ).toBe(2);
  });
});

describe("factLine", () => {
  it("none missed", () => {
    expect(
      factLine({ status: "completed", days: ["camera", "camera", "self"] }),
    ).toBe("3 days, none missed. 2 camera proof, 1 self-reported.");
  });

  it("unsecured with held days", () => {
    expect(
      factLine({
        status: "completed",
        days: ["camera", "frozen", "last_stand", "missed"],
      }),
    ).toBe("3 days went unsecured. 2 of them were held, by a freeze and a Last Stand.");
  });

  it("failed copy", () => {
    expect(factLine({ status: "failed", days: ["camera", "missed"] })).toBe(
      "Hard mode has no freezes, so one unsecured day ends the run.",
    );
  });

  it("one-day camera", () => {
    expect(factLine({ status: "completed", days: ["camera"] })).toBe(
      "One day, secured. Camera proof.",
    );
  });
});

describe("combined copy", () => {
  it("n=2 title and footer", () => {
    expect(combinedTitle(2)).toBe("Two challenges ended.");
    expect(combinedFooter(2)).toBe(
      "Both are in Profile, Finished. Start either again from there.",
    );
  });

  it("n>=3 title and footer name the count", () => {
    expect(combinedTitle(3)).toBe("3 challenges ended.");
    expect(combinedFooter(3)).toBe(
      "All 3 are in Profile, Finished. Start any again from there.",
    );
  });
});

describe("capCaption", () => {
  it("states the free cap price", () => {
    expect(capCaption(3, 3)).toBe(
      "You are running 3 of 3. Starting this again means leaving one.",
    );
  });
});

describe("dayStateForKey", () => {
  const sets = {
    secured: new Set(["2026-09-01", "2026-09-02"]),
    frozen: new Set(["2026-09-03"]),
    lastStand: new Set(["2026-09-04"]),
    camera: new Set(["2026-09-01"]),
  };

  it("maps camera, self, frozen, last stand, missed", () => {
    expect(dayStateForKey("2026-09-01", sets)).toBe("camera");
    expect(dayStateForKey("2026-09-02", sets)).toBe("self");
    expect(dayStateForKey("2026-09-03", sets)).toBe("frozen");
    expect(dayStateForKey("2026-09-04", sets)).toBe("last_stand");
    expect(dayStateForKey("2026-09-05", sets)).toBe("missed");
  });
});

describe("endedChallengeFromUnseen", () => {
  it("builds a one-day completed sheet", () => {
    const c = endedChallengeFromUnseen(
      {
        id: "ac-1",
        challenge_id: "ch-1",
        status: "completed",
        start_at: "2026-09-19T08:00:00.000Z",
        ended_at: "2026-09-19T23:59:59.999Z",
        challenges: { title: "Quick Steps", duration_days: 1 },
      },
      {
        timeZone: "UTC",
        securedDateKeys: ["2026-09-19"],
        cameraDateKeys: ["2026-09-19"],
      },
    );
    expect(c.title).toBe("Quick Steps");
    expect(c.days).toEqual(["camera"]);
    expect(c.longest_streak).toBe(1);
    expect(securedCount(c.days)).toBe(1);
  });
});

describe("longestSecuredStreak", () => {
  it("breaks on unsecured days", () => {
    expect(longestSecuredStreak(["camera", "self", "missed", "camera"])).toBe(2);
  });
});

describe("shouldPresentEndScreen", () => {
  it("skips onboarding, auth, and the end route itself", () => {
    expect(shouldPresentEndScreen("/(tabs)")).toBe(true);
    expect(shouldPresentEndScreen("/onboarding")).toBe(false);
    expect(shouldPresentEndScreen("/auth/login")).toBe(false);
    expect(shouldPresentEndScreen("/challenge/end")).toBe(false);
  });
});

describe("runMarkEndSeenOnDone", () => {
  it("markEndSeen rejects → no navigation, error rendered", async () => {
    const goHome = vi.fn();
    const onFail = vi.fn();
    await runMarkEndSeenOnDone({
      enrollmentIds: ["ac-1"],
      markSeen: async () => {
        throw new Error("denied");
      },
      goHome,
      onFail,
    });
    expect(goHome).not.toHaveBeenCalled();
    expect(onFail).toHaveBeenCalledWith(MARK_END_SEEN_FAILED);
    expect(MARK_END_SEEN_FAILED).toBe("Couldn't save. Try again.");
    const ui = readFileSync(resolve(__dirname, "../components/challenge/ChallengeEnd.tsx"), "utf8");
    const end = readFileSync(resolve(__dirname, "../app/challenge/end.tsx"), "utf8");
    expect(ui).toContain("p.saveError");
    expect(ui).toContain("<Button label=\"Done\" onPress={p.onDone} />");
    expect(ui.indexOf("<Button label=\"Done\"")).toBeLessThan(ui.indexOf("p.saveError"));
    expect(end).toContain("saveError={saveError}");
    expect(end).toContain("setSaveError");
    expect(end).not.toContain("disabled");
  });

  it("resolves → navigates once", async () => {
    const goHome = vi.fn();
    const onFail = vi.fn();
    await runMarkEndSeenOnDone({
      enrollmentIds: ["ac-1"],
      markSeen: async () => undefined,
      goHome,
      onFail,
    });
    expect(goHome).toHaveBeenCalledTimes(1);
    expect(onFail).not.toHaveBeenCalled();
  });
});

describe("wiring", () => {
  it("marks seen only from Done, not Close", () => {
    const src = readFileSync(resolve(__dirname, "../app/challenge/end.tsx"), "utf8");
    expect(src).toContain("TRPC.challenges.markEndSeen");
    expect(src).toContain("onClose={goHome}");
    expect(src).toContain("onDone={() => void onDone()}");
    const doneFn = src.slice(src.indexOf("const onDone ="), src.indexOf("}, [challenges, goHome]"));
    expect(doneFn).toContain("markEndSeen");
    const closeFn = src.slice(src.indexOf("const goHome ="), src.indexOf("const onDone ="));
    expect(closeFn).not.toContain("markEndSeen");
  });

  it("foreground finalize lives on the AppState active handler", () => {
    const layout = readFileSync(resolve(__dirname, "../app/_layout.tsx"), "utf8");
    expect(layout).toContain("notifyAppBecameActive");
    expect(layout).toContain('if (state === "active") notifyAppBecameActive()');
    expect(layout).toContain("runFinalizeEndedOnForeground");
  });
});
