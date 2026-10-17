/**
 * Build 90 chunk 06: words people understand, plus the small blockers.
 * Pure helpers are called; screen wiring is asserted on the source, as the other
 * build90 test files do (no render tooling in this repo).
 */
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

// check-profile pulls in the Supabase client; its own test mocks it the same way.
vi.mock("@/lib/supabase", () => ({ supabase: { from: () => ({}) } }));
vi.mock("@/lib/sentry", () => ({ captureError: () => {} }));
vi.mock("@/lib/onboarding-completed-cache", () => ({ cacheOnboardingCompleted: async () => {} }));
import { firstNameFromAuth, greeting, greetingName, isMachineHandle } from "@/lib/greeting";
import { SECURED_MEANS } from "@/lib/secured-day";
import { joinModeLine, MODE_STANDARD_JOIN, MODE_STRICT_JOIN } from "@/lib/challenge-detail-mapping";
import { askFooterCaption, askHonestyLine, formatSecuredStateLine, SELF_REPORT_FIRST } from "@/lib/simple-log";
import { FREEZE_MEANS, freezeEarnedNote } from "@/lib/freeze-earn";
import { parseConceptSeen } from "@/lib/concept-seen";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import { FREEZE } from "@/lib/copy";
import { ADVANCE_LOCK_MS, nextStepAfterPrimary, pressIsEcho } from "@/lib/create-step-advance";
import { refreshVerdictAfter401 } from "@/lib/auth-expiry";
import { classifyProfileFetch, interpretProfileCheckResult, NO_ROW_CODE } from "@/lib/check-profile";
import { counterDisplayUnit, counterUnitFromTaskType, WATER_UNIT } from "@/lib/counter-log";
import { counterUnitPlural } from "@/lib/counter-ready-gates";

const src = (p: string) => readFileSync(p, "utf8");

describe("06.3 greeting never shows a machine name", () => {
  const at = new Date("2026-10-07T13:00:00.000Z"); // 09:00 New York

  it("display name first, then @username, then the first name", () => {
    expect(greetingName("Omar Ali", "omar")).toBe("Omar");
    expect(greetingName(null, "omar")).toBe("@omar");
    expect(greetingName(null, "", "Omar Ali")).toBe("Omar");
  });

  it("skips user_xxxxxxxx and falls through to the first name", () => {
    expect(isMachineHandle("user_a4cebe53")).toBe(true);
    expect(isMachineHandle("@user_a4cebe53")).toBe(true);
    expect(isMachineHandle("omar")).toBe(false);
    expect(greetingName(null, "user_a4cebe53", "Yaseen")).toBe("Yaseen");
    expect(greeting(at, null, "user_a4cebe53", "America/New_York", "Yaseen")).toBe("Good morning, Yaseen");
  });

  it("with nothing usable the greeting stands alone", () => {
    expect(greetingName(null, "user_a4cebe53")).toBeNull();
    expect(greeting(at, null, "user_a4cebe53", "America/New_York")).toBe("Good morning");
    expect(greeting(at, "", "", "America/New_York", null)).toBe("Good morning");
  });

  it("reads the first name from the auth metadata", () => {
    expect(firstNameFromAuth({ user_metadata: { full_name: "Yaseen Abdela" } })).toBe("Yaseen");
    expect(firstNameFromAuth({ user_metadata: { given_name: "Omar" } })).toBe("Omar");
    expect(firstNameFromAuth({ user_metadata: {} })).toBeNull();
    expect(firstNameFromAuth(null)).toBeNull();
  });

  it("Home passes the auth first name to the greeting", () => {
    const home = src("app/(tabs)/index.tsx");
    expect(home).toContain("firstNameFromAuth(user)");
  });
});

describe("06.5 the Password label focuses its field", () => {
  it("TextField's label taps into the input", () => {
    const tf = src("components/ds/TextField.tsx");
    expect(tf).toMatch(/onPress=\{editable \? \(\) => inputRef\.current\?\.focus\(\)/);
    expect(tf).toContain("useImperativeHandle(ref");
  });
});

describe("06.1 / 06.2 Day secured", () => {
  const screen = src("components/task-v2/SecuredDayScreen.tsx");

  it("says what secured means under the title", () => {
    expect(SECURED_MEANS).toBe("Every task today is done. Your streak goes up by one.");
    expect(screen).toContain("{SECURED_MEANS}");
  });

  it("renders Self-reported once: the caption, not the card row tag", () => {
    expect(screen).not.toContain("<Text style={styles.selfTag}>{SECURED_SELF}</Text>");
    expect(screen).not.toMatch(/selfTag: \{/);
  });

  it("the footer no longer slides up over the last row", () => {
    expect(screen).not.toContain("{ bottom: DS_V3.space.gutter }");
    expect(screen).toContain("paddingBottom: DS_V3.space.section");
  });
});

describe("ConfirmDialog scrim", () => {
  it("dims the screen at 60% instead of painting it over", () => {
    const dlg = src("components/shared/ConfirmDialog.tsx");
    expect(dlg).toMatch(/scrim: \{\s*\.\.\.StyleSheet\.absoluteFillObject,\s*backgroundColor: DS_V3\.color\.canvas,\s*opacity: 0\.6/);
    expect(dlg).not.toMatch(/wrap: \{[^}]*backgroundColor/);
  });
});

describe("06.1 definitions where the thing happens", () => {
  it("the Join sheet explains Strict and Standard in one line", () => {
    expect(joinModeLine("HARD")).toBe("Miss a day and the streak resets.");
    expect(joinModeLine("hard")).toBe(MODE_STRICT_JOIN);
    expect(joinModeLine("standard")).toBe("A freeze can cover a missed day.");
    expect(joinModeLine(null)).toBe(MODE_STANDARD_JOIN);
    expect(src("components/discover/ChallengePreviewSheet.tsx")).toContain('testID="join-mode-line"');
  });

  it("the first self-reported task says what that means, later ones say Self-reported", () => {
    expect(SELF_REPORT_FIRST).toBe("You're telling us you did it. No photo needed.");
    expect(askHonestyLine(true)).toBe(SELF_REPORT_FIRST);
    expect(askHonestyLine(false)).toBe("Self-reported.");
    expect(askHonestyLine(null)).toBe("Self-reported.");
  });

  it("the first freeze earned says what a freeze does", () => {
    const earned = { freezeGranted: true, freezesHeld: 1 };
    expect(freezeEarnedNote(earned, true)).toContain(FREEZE_MEANS);
    expect(freezeEarnedNote(earned, false)).not.toContain(FREEZE_MEANS);
    expect(FREEZE_MEANS).toBe("It covers one missed day so your streak holds.");
    expect(src("app/task/secured.tsx")).toContain('useFirstConcept("freeze"');
  });

  it("concept flags parse defensively and mark once", () => {
    expect([...parseConceptSeen(null)]).toEqual([]);
    expect([...parseConceptSeen("garbage")]).toEqual([]);
    expect(parseConceptSeen('["freeze",1]').has("freeze")).toBe(true);
  });
});

describe("06.2 Self-reported at most once per screen", () => {
  it("the ask screen drops the footer caption when it repeats the honesty line", () => {
    expect(askFooterCaption("Self-reported.")).toBeNull();
    expect(askFooterCaption("  ")).toBeNull();
    expect(askFooterCaption("Posts to friends")).toBe("Posts to friends");
    const ask = src("components/task-v2/steps/AskStep.tsx");
    expect(ask).toContain("askFooterCaption(");
    expect(ask).toContain('testID="ask-honesty"');
  });

  it("the secured state line no longer repeats Self reported", () => {
    expect(formatSecuredStateLine(3, false)).toBe("Day 3.");
    expect(formatSecuredStateLine(3, true)).toBe("Day 3. Camera proof.");
  });
});

describe("06.4 feed hint clears the tab bar", () => {
  it("content pad covers pill + dock + a gutter", () => {
    expect(tabBarContentPad(34)).toBe(64 + 34 + 16);
    expect(tabBarContentPad(0)).toBe(96);
  });
});

describe("06.6 guest Save your streak sheet", () => {
  const home = src("app/(tabs)/index.tsx");
  const sheet = src("components/home/SaveStreakSheet.tsx");

  it("only shows while Home is the focused screen and the stored Later is known", () => {
    expect(home).toMatch(/visible=\{homeFocused && saveDismissed != null && shouldShowSaveStreak\(/);
    expect(home).toContain("setHomeFocused(true);");
  });

  it("sits under the status bar and always offers Later", () => {
    expect(sheet).toContain("paddingTop: insets.top");
    expect(sheet).toContain("alwaysOfferSkip");
    expect(src("components/onboarding/v2/screens/AccountScreen.tsx")).toMatch(
      /FLAGS\.STARTER_TASK_ENABLED && !alwaysOfferSkip \? null : <TextLink label=\{ACCOUNT_SKIP\}/,
    );
  });
});

describe("06.7 freeze feedback", () => {
  it("the result says what happened and how many are left", () => {
    expect(FREEZE.result(4, 1)).toBe("Freeze used. Yesterday is held and your streak is 4. 1 freeze left.");
    expect(FREEZE.result(4, 2)).toBe("Freeze used. Yesterday is held and your streak is 4. 2 freezes left.");
  });
});

describe("06.8 create step 1", () => {
  it("one Continue press moves one step, from the previous state", () => {
    const can = { step1: () => true, step2: () => true };
    expect(nextStepAfterPrimary({ step: 1 as const }, can)).toBe(2);
    expect(nextStepAfterPrimary({ step: 2 as const }, can)).toBe(3);
    expect(nextStepAfterPrimary({ step: 1 as const }, { step1: () => false, step2: () => true })).toBe(1);
  });

  it("the echo of a double tap is dropped", () => {
    expect(pressIsEcho(1000, 1200)).toBe(true);
    expect(pressIsEcho(1000, 1000 + ADVANCE_LOCK_MS)).toBe(false);
    const wizard = src("components/create/CreateWizardV2.tsx");
    expect(wizard).toContain("if (pressIsEcho(lastAdvanceAt.current, now)) return;");
    expect(wizard).toContain("nextStepAfterPrimary(p, { step1: canAdvanceStep1, step2: canAdvanceStep2 })");
  });

  it("focusing the title keeps the title on screen", () => {
    const wizard = src("components/create/CreateWizardV2.tsx");
    expect(wizard).toContain("y: Math.max(0, titleY.current - 8)");
    expect(wizard).not.toContain("categoryY.current - 8");
  });
});

describe("06.9 the login survives a reopen", () => {
  it("a 401 refreshes once and only an auth rejection signs out", () => {
    expect(refreshVerdictAfter401({ session: { ok: true }, error: null })).toBe("keep");
    expect(refreshVerdictAfter401({ session: null, error: { name: "AuthRetryableFetchError", status: 0 } })).toBe("keep");
    expect(refreshVerdictAfter401({ session: null, error: { name: "AuthApiError", status: 503 } })).toBe("keep");
    expect(refreshVerdictAfter401({ session: null, error: { name: "AuthApiError", status: 400 } })).toBe("sign_out");
    expect(refreshVerdictAfter401({ session: null, error: { name: "AuthSessionMissingError" } })).toBe("sign_out");
    expect(refreshVerdictAfter401({ session: null, error: null })).toBe("sign_out");
    expect(src("lib/trpc.ts")).toContain("await handleUnauthorized();");
  });

  it("a failed profile read is unknown, not a missing profile", () => {
    expect(classifyProfileFetch({ data: null, error: { code: "PGRST301" } })).toEqual({ timedOut: true });
    expect(classifyProfileFetch({ data: null, error: { code: NO_ROW_CODE } })).toBeNull();
    const row = { user_id: "u", username: "omar", onboarding_completed: true };
    expect(classifyProfileFetch({ data: row, error: null })).toBe(row);
    expect(interpretProfileCheckResult({ timedOut: true }).onboardingCompleted).toBeNull();
  });
});

describe("water is cups on both sides", () => {
  it("client defaults", () => {
    expect(WATER_UNIT).toBe("cups");
    expect(counterUnitFromTaskType("water")).toBe("cups");
    expect(counterUnitPlural("water")).toBe("cups");
    expect(counterDisplayUnit("water", { unit: "glasses" })).toBe("glasses");
    expect(counterDisplayUnit("water", {})).toBe("cups");
  });

  it("the server reads the task unit first and falls back to cups", () => {
    const server = src("backend/trpc/routes/checkins.ts");
    expect(server).toMatch(/typeof cfg\.unit === "string" && cfg\.unit\.trim\(\)\s*\? cfg\.unit\.trim\(\)/);
    expect(server).not.toMatch(/taskType === "water"\s*\? "cups"\s*: taskType === "reading"\s*\? "pages"\s*: typeof cfg\.unit_label/);
  });
});

describe("task steps: one top inset", () => {
  it("the route owns the safe area; steps no longer add insets.top", () => {
    for (const f of [
      "components/task-v2/steps/WriteStep.tsx",
      "components/task-v2/steps/CaptureStep.tsx",
      "components/task-v2/steps/RunningStep.tsx",
      "components/task-v2/steps/LogStep.tsx",
      "components/task-v2/steps/CountStep.tsx",
      "components/task-v2/steps/TimerEntryStep.tsx",
      "components/task-v2/FinishMomentV3.tsx",
    ]) {
      expect(src(f), f).not.toContain("paddingTop: insets.top");
    }
    expect(src("app/task/complete.tsx")).toContain("<Screen>");
  });
});
