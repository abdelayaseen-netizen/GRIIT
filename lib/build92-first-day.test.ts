/**
 * Build 92 chunk 09: goals, Start here, closed windows, the account screen and guest save.
 * Fixed clock for windows: 9:41 in New York (Fajr's window is 5:00–6:30).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FIRST_DAY_GOALS,
  FREEZE_LINE,
  GOALS_COPY,
  JOINED_TOAST,
  START_HERE_COPY,
  goalHint,
  orderStartHere,
  pickGoal,
} from "@/lib/first-day";
import { day1TomorrowLabel, windowClosedToday } from "@/lib/time-enforcement";
import { windowClosedAtLine } from "@/lib/task-ui";
import {
  ACCOUNT_COPY,
  otpErrorCopy,
  resendLabel,
  sendEmailCode,
  verifyEmailCode,
  type OtpAuth,
} from "@/lib/email-otp";

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const TZ = "America/New_York";
const AT_941 = new Date("2026-10-19T13:41:00.000Z");
const FAJR = {
  id: "fajr",
  title: "Fajr Before Sunrise",
  tasks: [{ title: "Pray Fajr", gate_time_mode: "between", gate_time_start: "05:00", gate_time_end: "06:30" }],
};
const EARLY = {
  id: "early",
  title: "Early Riser 7",
  tasks: [{ title: "Up and out", gate_time_mode: "by", gate_time_start: "06:30" }],
};
const GYM = { id: "gym", title: "Show Up 7", tasks: [{ title: "Get to the gym" }] };

describe("09.1 goals", () => {
  it("seven cards in the copy-table order, Faith and prayer second", () => {
    expect(FIRST_DAY_GOALS.map((g) => g.label)).toEqual([
      "Fitness and gym",
      "Faith and prayer",
      "Running",
      "Reading",
      "Health",
      "Discipline",
      "Mind",
    ]);
    expect(new Set(FIRST_DAY_GOALS.map((g) => g.id)).size).toBe(7);
    expect(GOALS_COPY).toEqual({
      title: "What are you building?",
      subtitle: "Pick up to 3. We'll suggest challenges that match.",
      cta: "Continue",
    });
    expect(goalHint(0)).toBe("Pick at least one");
    expect(goalHint(2)).toBe("2 of 3 picked");
  });

  it("a 4th pick swaps out the oldest; a second tap unpicks", () => {
    expect(pickGoal(["a", "b", "c"], "d")).toEqual({ next: ["b", "c", "d"], swappedOut: "a" });
    expect(pickGoal(["a", "b"], "c")).toEqual({ next: ["a", "b", "c"], swappedOut: null });
    expect(pickGoal(["a", "b"], "a")).toEqual({ next: ["b"], swappedOut: null });
    expect(pickGoal(["a"], "a")).toEqual({ next: [], swappedOut: null });
  });

  it("the goals screen lays out 2 columns of 56 pt cards with a check when picked", () => {
    const src = read("components/onboarding/v2/screens/GoalsScreen.tsx");
    expect(src).toContain("FIRST_DAY_GOALS");
    expect(src).toContain("minHeight: 56");
    expect(src).toContain('width: "48%"');
    expect(src).toContain("<Check");
    expect(src).not.toContain("paddingBottom: 280");
  });
});

describe("09.3 closed windows at 9:41", () => {
  it("a closed window with no known time never reads \"closed at .\"", () => {
    expect(windowClosedAtLine("")).toBe("Window closed. Today is not secured.");
    expect(windowClosedAtLine("6:30 am")).toBe("Window closed at 6:30 am. Today is not secured.");
  });

  it("knows Fajr and Early Riser have closed, the gym task has not", () => {
    expect(windowClosedToday(FAJR.tasks, AT_941, TZ)).toBe(true);
    expect(windowClosedToday(EARLY.tasks, AT_941, TZ)).toBe(true);
    expect(windowClosedToday(GYM.tasks, AT_941, TZ)).toBe(false);
  });

  it("labels Day 1 with the window's opening time", () => {
    expect(day1TomorrowLabel(FAJR.tasks, AT_941, TZ)).toBe("Day 1 is tomorrow at 5:00 am");
    expect(day1TomorrowLabel(EARLY.tasks, AT_941, TZ)).toBe("Day 1 is tomorrow at 6:30 am");
    expect(day1TomorrowLabel(GYM.tasks, AT_941, TZ)).toBeNull();
    expect(day1TomorrowLabel(FAJR.tasks, new Date("2026-10-19T08:30:00.000Z"), TZ)).toBeNull();
  });

  it("Fajr is never the first Start here card", () => {
    const out = orderStartHere([FAJR, GYM, EARLY], AT_941, TZ);
    expect(out.map((c) => c.challenge.id)).toEqual(["gym", "fajr", "early"]);
    expect(out[0]!.startsTomorrow).toBeNull();
    expect(out[1]!.startsTomorrow).toBe("Day 1 is tomorrow at 5:00 am");
  });

  it("a closed-window card is first only when nothing else matches", () => {
    const out = orderStartHere([FAJR], AT_941, TZ);
    expect(out[0]!.challenge.id).toBe("fajr");
    expect(out[0]!.startsTomorrow).toBe("Day 1 is tomorrow at 5:00 am");
  });

  it("the starter pack returns the task window columns", () => {
    const src = read("backend/trpc/routes/challenges-discover.ts");
    const pack = src.slice(src.indexOf("getStarterPack:"));
    expect(pack.slice(0, 900)).toContain("gate_time_mode, gate_time_start, gate_time_end");
  });

  it("the challenge page join button carries the tomorrow label", () => {
    const src = read("components/challenge/ChallengeDetailV3.tsx");
    expect(src).toContain("day1TomorrowAt");
    expect(src).toContain("`Join · ${p.day1TomorrowAt}`");
  });
});

describe("09.2 Start here", () => {
  it("the joined toast draws above a native-modal first step (photo optional sheet)", () => {
    const screen = readFileSync(join(process.cwd(), "app/task/complete.tsx"), "utf8");
    expect(screen).toContain("<FullWindowOverlay>{toast}</FullWindowOverlay>");
  });

  it("copy is the copy table", () => {
    expect(START_HERE_COPY).toEqual({
      title: "Start here",
      subtitle: "Join one to start today. You can add more later.",
      join: "Join",
      joining: "Joining",
      browse: "Browse all challenges",
      browseAll: "Browse all",
      empty: expect.any(Function),
    });
    expect(START_HERE_COPY.empty("Faith and prayer")).toBe("Nothing open right now for Faith and prayer.");
    expect(FREEZE_LINE).toBe(
      "Miss a day? A freeze covers it so your streak doesn’t break. You earn one every 7 days in a row.",
    );
    expect(JOINED_TOAST).toBe("You’re in. Day 1 is today.");
  });

  it("every card has its own Join; no radio buttons; the freeze line once", () => {
    const src = read("components/onboarding/v2/screens/FirstChallengeScreen.tsx");
    expect(src).not.toContain('accessibilityRole="radio"');
    expect(src).not.toContain("radioOff");
    expect(src).toContain("START_HERE_COPY.join");
    expect(src.split("{FREEZE_LINE}").length - 1).toBe(1);
    expect(src).not.toContain("modeLine(");
  });

  it("one tap joins and opens the first task with the toast", () => {
    const flow = read("components/onboarding/v2/OnboardingFlowV2.tsx");
    expect(flow).toContain("onJoined");
    expect(flow).toContain("exitOnboardingV2(");
    const href = read("lib/open-first-task.ts");
    expect(href).toContain("&joined=1");
    const task = read("app/task/complete.tsx");
    expect(task).toContain("JOINED_TOAST");
  });
});

function stubAuth(opts: { userId: string; error?: { message: string; code?: string } | null }) {
  const calls: { fn: string; args: unknown }[] = [];
  const auth: OtpAuth = {
    async updateUser(args) {
      calls.push({ fn: "updateUser", args });
      return { data: { user: { id: opts.userId, email: null, new_email: args.email } }, error: null };
    },
    async signInWithOtp(args) {
      calls.push({ fn: "signInWithOtp", args });
      return { data: {}, error: null };
    },
    async verifyOtp(args) {
      calls.push({ fn: "verifyOtp", args });
      if (opts.error) return { data: { user: null, session: null }, error: opts.error };
      return {
        data: { user: { id: opts.userId, email: args.email }, session: { access_token: "t" } },
        error: null,
      };
    },
  };
  return { auth, calls };
}

describe("09.4 account by email code (stubbed Supabase auth)", () => {
  it("copy is the copy table", () => {
    expect(ACCOUNT_COPY.title).toBe("Save your streak");
    expect(ACCOUNT_COPY.subtitle).toBe("So your challenge and Day 1 are kept if you change phones.");
    expect(ACCOUNT_COPY.apple).toBe("Continue with Apple");
    expect(ACCOUNT_COPY.or).toBe("or");
    expect(ACCOUNT_COPY.email).toBe("Email");
    expect(ACCOUNT_COPY.sendCode).toBe("Send code");
    expect(ACCOUNT_COPY.sent("a@b.co")).toBe("We sent a 6-digit code to a@b.co");
    expect(ACCOUNT_COPY.different).toBe("Use a different email");
    expect(ACCOUNT_COPY.notNow).toBe("Not now");
    expect(resendLabel(59)).toBe("Resend in 0:59");
    expect(resendLabel(75)).toBe("Resend in 1:15");
  });

  it("a signed-out person gets a sign-in code and verifies with type email", async () => {
    const { auth, calls } = stubAuth({ userId: "u-new" });
    expect(await sendEmailCode(auth, { email: " A@B.co ", guest: false })).toEqual({ ok: true });
    expect(calls[0]).toEqual({ fn: "signInWithOtp", args: { email: "a@b.co", options: { shouldCreateUser: true } } });
    const out = await verifyEmailCode(auth, { email: "a@b.co", code: "123456", guest: false });
    expect(out).toEqual({ ok: true, userId: "u-new" });
    expect(calls[1]).toEqual({ fn: "verifyOtp", args: { email: "a@b.co", token: "123456", type: "email" } });
  });

  it("wrong and expired codes say why", async () => {
    expect(otpErrorCopy({ message: "Token has expired or is invalid", code: "otp_expired" })).toBe(
      "That code expired. Send a new one.",
    );
    expect(otpErrorCopy({ message: "Invalid token", code: "invalid_otp" })).toBe(
      "That code didn't match. Check the latest email.",
    );
    const { auth } = stubAuth({ userId: "u", error: { message: "Token has expired or is invalid", code: "otp_expired" } });
    expect(await verifyEmailCode(auth, { email: "a@b.co", code: "000000", guest: false })).toEqual({
      ok: false,
      message: "That code expired. Send a new one.",
    });
    expect(await verifyEmailCode(auth, { email: "a@b.co", code: "12", guest: false })).toEqual({
      ok: false,
      message: "That code didn't match. Check the latest email.",
    });
  });

  it("the account screen: Apple first, code field oneTimeCode, no password field", () => {
    const src = read("components/onboarding/v2/screens/AccountCodeForm.tsx");
    expect(src).toContain('textContentType="oneTimeCode"');
    expect(src).toContain('autoComplete="one-time-code"');
    expect(src).toContain("maxLength={6}");
    expect(src).not.toContain("secureTextEntry");
    expect(src.indexOf("ACCOUNT_COPY.apple")).toBeLessThan(src.indexOf("ACCOUNT_COPY.sendCode"));
    expect(src).toContain("ACCOUNT_COPY.notNow");
  });
});

describe("09.5 guest save", () => {
  it("a guest's code upgrades the same user, so the streak carries over", async () => {
    const { auth, calls } = stubAuth({ userId: "guest-1" });
    expect(await sendEmailCode(auth, { email: "g@b.co", guest: true })).toEqual({ ok: true });
    expect(calls[0]).toEqual({ fn: "updateUser", args: { email: "g@b.co" } });
    const out = await verifyEmailCode(auth, { email: "g@b.co", code: "654321", guest: true });
    expect(out).toEqual({ ok: true, userId: "guest-1" });
    expect(calls[1]).toEqual({ fn: "verifyOtp", args: { email: "g@b.co", token: "654321", type: "email_change" } });
    expect(calls.some((c) => c.fn === "signInWithOtp")).toBe(false);
  });

  it("Not now is always offered and keeps the guest", () => {
    const src = read("components/onboarding/v2/screens/AccountScreen.tsx");
    expect(src).not.toContain("FLAGS.STARTER_TASK_ENABLED && !alwaysOfferSkip");
    expect(src).toContain("AccountCodeForm");
  });
});
