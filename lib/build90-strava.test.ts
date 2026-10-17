/**
 * Build 90 chunk 09: "Verify with Strava" on run tasks, "Verified by Strava" once in place of
 * "Self-reported", and the notification that opens the post-or-private choice.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FLAGS } from "@/lib/feature-flags";
import {
  ADD_TASK_DEFAULT,
  draftFromWizardTask,
  payloadFromDraft,
  previewFromDraft,
  stravaRuleFromDraft,
  type AddTaskDraft,
} from "@/lib/add-task-draft";
import { mapWizardTaskToCreateInput } from "@/lib/create-wizard-payload";
import { homeProofRow } from "@/lib/home-proof-card";
import {
  STRAVA_CHOICE_ROUTE,
  STRAVA_VERIFY_CAPTION,
  STRAVA_VERIFY_LABEL,
  STRAVA_VERIFY_SEGMENTS,
  VERIFIED_BY_STRAVA,
  stravaChoiceRoute,
  stravaLoggedNotification,
  stravaVerifiedBy,
  verifiedLine,
  showStravaVerifyOption,
} from "@/lib/strava-verify";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

const stravaRun: AddTaskDraft = {
  ...ADD_TASK_DEFAULT,
  name: "Morning run",
  type: "run",
  runDistance: "5",
  runUnit: "km",
  verify: "strava",
};

describe("09 flag", () => {
  it("STRAVA_AUTO_VERIFY is off by default", () => {
    expect(FLAGS.STRAVA_AUTO_VERIFY).toBe(false);
  });
  it("the option shows only with the flag on and Strava connected, on a run task", () => {
    expect(showStravaVerifyOption({ flag: true, connected: true, type: "run" })).toBe(true);
    expect(showStravaVerifyOption({ flag: false, connected: true, type: "run" })).toBe(false);
    expect(showStravaVerifyOption({ flag: true, connected: false, type: "run" })).toBe(false);
    expect(showStravaVerifyOption({ flag: true, connected: true, type: "check_off" })).toBe(false);
  });
});

describe("09.2 notification copy and route", () => {
  it("names the sport, the task and the day", () => {
    expect(stravaLoggedNotification({ taskName: "Morning run", day: 2, sport: "Run" })).toEqual({
      title: "Strava run logged.",
      body: "Morning run is done for Day 2.",
    });
    expect(stravaLoggedNotification({ taskName: "Commute", day: 1, sport: "Ride" }).title).toBe("Strava ride logged.");
    expect(stravaLoggedNotification({ taskName: "Laps", day: 3, sport: "Swim" }).title).toBe("Strava activity logged.");
  });
  it("no exclamation marks, sentence case", () => {
    const n = stravaLoggedNotification({ taskName: "Morning run", day: 2, sport: "Run" });
    expect(`${n.title} ${n.body}`).not.toContain("!");
  });
  it("the route opens the post-or-private choice with the event", () => {
    const href = stravaChoiceRoute({ eventId: "e1", taskName: "Morning run", day: 2, challengeName: "Run club", daySecured: true, streak: 3 });
    expect(href.startsWith(`${STRAVA_CHOICE_ROUTE}?`)).toBe(true);
    const q = new URLSearchParams(href.slice(href.indexOf("?") + 1));
    expect(q.get("eventId")).toBe("e1");
    expect(q.get("taskName")).toBe("Morning run");
    expect(q.get("day")).toBe("2");
    expect(q.get("challengeName")).toBe("Run club");
    expect(q.get("secured")).toBe("1");
    expect(q.get("streak")).toBe("3");
  });
  it("a tapped push with type strava_verified opens its route; a general in-app row with a route opens it", () => {
    const layout = read("app/_layout.tsx");
    expect(layout).toContain('data?.type === "strava_verified"');
    const tab = read("components/activity/NotificationsTab.tsx");
    expect(tab).toContain("notifRoute(item.metadata)");
  });
  it("the choice screen exists and uses the chunk 04 sheet, posting with an audience", () => {
    const screen = read("app/task/strava.tsx");
    expect(screen).toContain("PostChoiceSheet");
    expect(screen).toContain("TRPC.checkins.shareProof");
    expect(screen).toContain("TRPC.checkins.unshareProof");
    const checkins = read("backend/trpc/routes/checkins.ts");
    expect(checkins).toMatch(/shareProof: protectedProcedure\s*\.input\(\s*z\.object\(\{\s*eventId: z\.string\(\)\.uuid\(\),[\s\S]{0,400}?audience: z\.enum\(\["friends", "everyone"\]\)\.optional\(\)/);
    expect(checkins).toContain("metadata: { ...(ev.metadata ?? {}), audience: input.audience }");
  });
});

describe("09.3 task setting", () => {
  it("a run with Verify with Strava stores the method and a rule from the distance", () => {
    expect(stravaRuleFromDraft(stravaRun)).toEqual({ sport: "Run", min_distance_m: 5000 });
    const row = payloadFromDraft(stravaRun);
    expect(row.verificationMethod).toBe("strava_activity");
    expect(row.verificationRuleJson).toEqual({ sport: "Run", min_distance_m: 5000 });
  });
  it("miles convert, no distance means no minimum, a ride keeps its sport", () => {
    expect(stravaRuleFromDraft({ ...stravaRun, runDistance: "3", runUnit: "mi" })).toEqual({ sport: "Run", min_distance_m: 4828 });
    expect(stravaRuleFromDraft({ ...stravaRun, runDistance: "" })).toEqual({ sport: "Run" });
    expect(stravaRuleFromDraft({ ...stravaRun, stravaSport: "Ride" })).toEqual({ sport: "Ride", min_distance_m: 5000 });
  });
  it("self-reported, or any other task type, stores nothing", () => {
    expect(payloadFromDraft({ ...stravaRun, verify: "self" }).verificationMethod).toBeUndefined();
    expect(payloadFromDraft({ ...stravaRun, type: "check_off" }).verificationMethod).toBeUndefined();
    expect(payloadFromDraft(ADD_TASK_DEFAULT).verificationRuleJson).toBeUndefined();
  });
  it("the preview says Verified by Strava once, not Self-reported", () => {
    const caption = previewFromDraft(stravaRun).caption;
    expect(caption).toContain(VERIFIED_BY_STRAVA);
    expect(caption).not.toContain("Self-reported");
    expect(caption.split(VERIFIED_BY_STRAVA).length).toBe(2);
    expect(previewFromDraft({ ...stravaRun, verify: "self" }).caption).toContain("Self-reported");
  });
  it("editing a Strava task keeps the setting", () => {
    const row = payloadFromDraft(stravaRun);
    const back = draftFromWizardTask({
      name: row.name,
      type: row.type,
      config: row.config,
      gates: row.gates,
      targetValue: row.targetValue,
      unit: row.unit,
      verificationMethod: row.verificationMethod,
      verificationRuleJson: row.verificationRuleJson,
    });
    expect(back.verify).toBe("strava");
    expect(back.stravaSport).toBe("Run");
    expect(draftFromWizardTask({ name: "Run", type: "run" }).verify).toBe("self");
  });
  it("the wizard passes the method and rule to challenges.create", () => {
    const out = mapWizardTaskToCreateInput(
      { name: "Morning run", type: "run", verificationMethod: "strava_activity", verificationRuleJson: { sport: "Run", min_distance_m: 5000 } },
      { requirePhoto: false, allowPhoto: true },
    );
    expect(out.verificationMethod).toBe("strava_activity");
    expect(out.verificationRuleJson).toEqual({ sport: "Run", min_distance_m: 5000 });
    const plain = mapWizardTaskToCreateInput({ name: "Read", type: "counter" }, { requirePhoto: false, allowPhoto: true });
    expect(plain.verificationMethod).toBeUndefined();
  });
  it("the sheet offers the choice only when connected and the flag is on", () => {
    const sheet = read("components/create/AddTaskSheet.tsx");
    expect(sheet).toContain("showStravaVerifyOption(");
    expect(sheet).toContain("TRPC.integrations.getStravaConnection");
    expect(STRAVA_VERIFY_LABEL).toBe("How it's verified");
    expect(STRAVA_VERIFY_SEGMENTS).toEqual(["Self-reported", "Verify with Strava"]);
    expect(STRAVA_VERIFY_CAPTION.strava).not.toContain("!");
  });
});

describe("09.3 Verified by Strava in place of Self-reported", () => {
  const base = {
    id: "t1",
    name: "Morning run",
    challengeName: "Run club",
    currentDay: 2,
    done: true,
    challengeSecuredToday: false,
    type: "run",
  };
  it("the Home row says Verified by Strava for a Strava completion and Self-reported otherwise", () => {
    expect(homeProofRow({ ...base, verifiedBy: "strava" }, 0).caption).toBe(VERIFIED_BY_STRAVA);
    expect(homeProofRow(base, 0).caption).toBe("Self-reported");
    expect(homeProofRow({ ...base, done: false, verifiedBy: "strava" }, 0).caption).not.toBe(VERIFIED_BY_STRAVA);
  });
  it("a check-in's proof_source names the verifier", () => {
    expect(stravaVerifiedBy({ proof_source: "strava" })).toBe("strava");
    expect(stravaVerifiedBy({ proof_source: "camera" })).toBeNull();
    expect(stravaVerifiedBy({})).toBeNull();
    expect(stravaVerifiedBy(null)).toBeNull();
  });
  it("the feed text card line", () => {
    expect(verifiedLine("strava")).toBe(VERIFIED_BY_STRAVA);
    expect(verifiedLine(null)).toBeNull();
  });
  it("Home reads proof_source from the bootstrap, the feed carries verifiedBy", () => {
    expect(read("backend/trpc/routes/checkins.ts")).toContain("verification_status, proof_source");
    expect(read("app/(tabs)/index.tsx")).toContain("stravaVerifiedBy(");
    expect(read("backend/trpc/routes/feed.ts")).toContain("verifiedBy:");
    expect(read("backend/lib/feed-activity-hydrate.ts")).toContain("verifiedBy:");
    expect(read("components/feed/feedTypes.ts")).toContain("verifiedBy?:");
    const card = read("components/feed/FeedPostV3.tsx");
    expect(card).toContain("verifiedLine(post.verifiedBy");
  });
});
