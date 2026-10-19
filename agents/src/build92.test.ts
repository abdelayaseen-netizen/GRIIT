import { describe, expect, it } from "vitest";
import { loadConfig, modelFor, priceOf } from "./config";
import { dollars, projectRun } from "./cost";
import { actionYaml, bareLaunchYaml, typePlan } from "./device";
import { endPoint, resolveTarget, screenSize } from "./match";
import type { El } from "./screen";
import { countStuck, endTag, isRepeatOfDeadTarget, nextTapRepeat, stuckNote, STUCK_LIMIT } from "./stuck";

describe("12.1 models and cost come from config", () => {
  it("Sonnet 5.5 by default, Opus 5.5 for the first-day group, $60 cap", () => {
    const config = loadConfig({});
    expect(config.models).toEqual({ default: "claude-sonnet-5-5", firstDay: "claude-opus-5-5" });
    expect(config.capUsd).toBe(60);
    expect(modelFor({ group: "first-day" }, config)).toBe("claude-opus-5-5");
    expect(modelFor({ group: "day2" }, config)).toBe("claude-sonnet-5-5");
    expect(modelFor({ group: "first-day", model: "claude-haiku-4-5-20251001" }, config)).toBe("claude-haiku-4-5-20251001");
  });

  it("the environment overrides the file", () => {
    const config = loadConfig({ AGENT_MODEL: "m-a", AGENT_FIRST_DAY_MODEL: "m-b", AGENT_CAP_USD: "5" });
    expect(config.models).toEqual({ default: "m-a", firstDay: "m-b" });
    expect(config.capUsd).toBe(5);
    expect(loadConfig({ AGENT_CAP_USD: "nope" }).capUsd).toBe(60);
  });

  it("prices: Sonnet 5.5 $2/$10, Opus 5.5 $4/$20; an unknown model costs the dearest price", () => {
    expect(dollars("claude-sonnet-5-5", 1_000_000, 100_000)).toBeCloseTo(3);
    expect(dollars("claude-opus-5-5", 1_000_000, 100_000)).toBeCloseTo(6);
    const config = loadConfig({});
    expect(priceOf("claude-unknown", config).outPerM).toBe(Math.max(...Object.values(config.prices).map((p) => p.outPerM)));
  });

  it("projects a full run from measured spend per step, scaling an unmeasured model by list price", () => {
    const out = projectRun({
      measured: [{ model: "claude-sonnet-5-5", usd: 1, steps: 100 }],
      planned: [
        { model: "claude-sonnet-5-5", sessions: 10, stepsEach: 40 },
        { model: "claude-opus-5-5", sessions: 5, stepsEach: 40 },
      ],
    });
    expect(out.total).toBeCloseTo(4 + 4);
    expect(out.lines[1]).toContain("scaled");
  });
});

describe("12.2 be a person", () => {
  const tap = (target: string, sigBefore: string) => ({ action: "tap", target, sigBefore });

  it("counts taps on one target that left the screen the same, and resets on a change", () => {
    let r = nextTapRepeat(null, tap("Join", "A"), "A");
    expect(r).toEqual({ target: "Join", count: 1 });
    r = nextTapRepeat(r, tap("join", "A"), "A");
    expect(r?.count).toBe(2);
    expect(nextTapRepeat(r, tap("Join", "A"), "B")).toBeNull();
    expect(nextTapRepeat(r, tap("Back", "A"), "A")).toEqual({ target: "Back", count: 1 });
    expect(nextTapRepeat(r, { action: "scroll", target: "down", sigBefore: "A" }, "A")).toBeNull();
  });

  it("after 2 dead taps the same target is refused, anything else is allowed", () => {
    const r = { target: "Join", count: 2 };
    expect(isRepeatOfDeadTarget(r, { action: "tap", target: "Join " })).toBe(true);
    expect(isRepeatOfDeadTarget(r, { action: "scroll", target: "down" })).toBe(false);
    expect(isRepeatOfDeadTarget(r, { action: "tap", target: "Back" })).toBe(false);
    expect(isRepeatOfDeadTarget({ target: "Join", count: 1 }, { action: "tap", target: "Join" })).toBe(false);
  });

  it("records the persona's own stuck note, or the harness's when it was forced and wrote none", () => {
    expect(stuckNote("Stuck: the button does nothing", null)).toBe("stuck: the button does nothing");
    expect(stuckNote("I'll scroll", { target: "Join", count: 2 })).toBe('stuck: tapped "Join" 2 times with no change');
    expect(stuckNote("I'll scroll", null)).toBe("");
  });

  it("stops at 3 stuck notes on one screen, counted per screen", () => {
    const counts = new Map<string, number>();
    countStuck(counts, "Home", "stuck: a");
    countStuck(counts, "Profile", "stuck: b");
    countStuck(counts, "Home", "");
    expect(countStuck(counts, "Home", "stuck: c")).toBe(2);
    expect(countStuck(counts, "Home", "stuck: d")).toBe(STUCK_LIMIT);
  });
});

describe("12.3 typing into a multiline field", () => {
  it("appends when the new text continues what is there, replaces everything otherwise", () => {
    expect(typePlan("", "Hello")).toEqual({ erase: 50, input: "Hello" });
    expect(typePlan("First line.", "First line. Second line.")).toEqual({ erase: 0, input: " Second line." });
    const long = "x".repeat(400);
    expect(typePlan(long, "New")).toEqual({ erase: 410, input: "New" });
  });

  it("the Maestro YAML appends without erasing and keeps newlines", () => {
    const yaml = actionYaml("type", "Journal", "Day one.\nDay two.", "50%,40%", "Day one.");
    expect(yaml).not.toContain("eraseText");
    expect(yaml).toContain('inputText: "\\nDay two."');
    const replace = actionYaml("type", "Journal", "Other", "50%,40%", "x".repeat(80));
    expect(replace).toContain("charactersToErase: 90");
  });

  it("the bare launch has the permissions and none of the optional dev-menu taps", () => {
    const bare = bareLaunchYaml("allow");
    expect(bare).toContain("stopApp: true");
    expect(bare).toContain("camera: allow");
    expect(bare).not.toContain("tapOn");
  });

  it("the end point sits inside the field's bottom-right corner", () => {
    expect(endPoint("[0,100][400,300]", { w: 400, h: 800 })).toBe("98%,36%");
  });
});

describe("12.5 every session end is tagged", () => {
  const base = { giveUp: "", crashes: [] as string[], wrongNumbers: [] as string[] };
  it("app bug, agent stuck, harness stop or finished", () => {
    expect(endTag({ ...base, crashes: ["The app was not in the foreground."] })).toBe("app bug");
    expect(endTag({ ...base, wrongNumbers: ["Screen said Day 3 of 7"] })).toBe("app bug");
    expect(endTag({ ...base, giveUp: "Stopped: 3 stuck notes on Home." })).toBe("agent stuck");
    expect(endTag({ ...base, giveUp: "Gave up. home repeated 3 times." })).toBe("agent stuck");
    expect(endTag({ ...base, giveUp: "Stopped because measured API spend hit the $60 cap." })).toBe("harness stop");
    expect(endTag({ ...base, giveUp: "Agent stopped on their own." })).toBe("finished");
    expect(endTag(base)).toBe("finished");
  });
});


describe("12.2 tap points on every simulator size", () => {
  const el = (bounds: string, text = ""): El => ({ text, a11y: text, id: "", value: "", bounds });

  it("reads the 16 Pro Max (440×956) and the SE (375×667) windows, not the iPhone 16 fallback", () => {
    expect(screenSize([el("[0,0][440,956]")])).toEqual({ w: 440, h: 956 });
    expect(screenSize([el("[0,0][375,667]")])).toEqual({ w: 375, h: 667 });
    expect(screenSize([el("[0,0][393,852]")])).toEqual({ w: 393, h: 852 });
  });

  it("the Profile tab on the Pro Max is tapped on the tab, not clamped to the corner", () => {
    const hit = resolveTarget("Profile", [el("[0,0][440,956]"), el("[358,906][440,956]", "Profile")]);
    expect(hit?.point).toBe("91%,97%");
  });
});
