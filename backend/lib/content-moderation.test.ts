import { describe, expect, it } from "vitest";
import {
  BLOCKED_TEXT,
  blockedPlainText,
  moderateChallengeQuality,
  moderateContent,
  normalizeForMatch,
} from "./content-moderation";
import { blockedFieldFromMessage, blockedTextFor } from "../../lib/blocked-text";

const TITLE = "Morning run club";

// Build 90 07.2: each of these is a way testers dodged the list. Every one must block.
const DODGES = [
  "sh1t",
  "SH1T happens",
  "f u c k",
  "f.u.c.k",
  "f-u-c-k this",
  "f_u_c_k",
  "fúck",
  "fück",
  "shït",
  "fu\u200Bck",
  "fu\u200Dck",
  "shi\uFEFFt",
  "fuuuck",
  "shiiiit",
  "fuuuuuuck",
  "a$$",
  "a55",
  "@ss",
  "b1tch",
  "b1tch please",
  "d1ck",
  "c0ck",
  "pu55y",
  "pussy",
  "5hit",
  "s h i t",
  "b.i.t.c.h",
  "F U C K",
  "fuck_you",
  "you.fuck",
  "FUCK",
  "Fuck.",
  "fuck!",
  "(fuck)",
  "d@mn",
  "wh0re",
  "5lut",
  "tw4t",
  "n1gger",
  "r3tard",
  "c u n t",
  "c.u.n.t",
  "shit, really",
  "fuck- off",
  "cu\u00ADnt",
  "what the f.u.c.k",
  "sh1t_user",
  "s_h_i_t",
  "s.h.i.t",
] as const;

// Chunk 08: a blocked word glued to another word.
const GLUED = [
  "fuckyou",
  "youfuck",
  "fuckoff",
  "motherfucker",
  "fuckyou123",
  "bullshit",
  "shithead",
  "shitty",
  "horseshit",
  "retarded",
  "bitches",
  "bitchy",
  "cunts",
  "sluts",
  "twats",
  "whores",
  "bastards",
  "FuckYou",
  "fuck_you_all",
  "fuckyou!!!",
  "fúckyou",
] as const;

// Whole-word matching: these contain a blocked word as a substring and must pass.
const CLEAN = [
  "fire retardant",
  "niggardly",
  "shitake",
  "class",
  "classic",
  "assess",
  "assessment",
  "Scunthorpe",
  "cocktail",
  "cockpit",
  "peacock",
  "hancock",
  "shuttlecock",
  "pass",
  "bass",
  "glass",
  "grass",
  "massage",
  "assistant",
  "assassin",
  "compass",
  "embarrass",
  "harass",
  "shiitake",
  "Matsushita",
  "Dickens",
  "Dickinson",
  "Essex",
  "Sussex",
  "therapist",
  "arsenal",
  "analysis",
  "cucumber",
  "basement",
  "canvass",
  "cassette",
  "lassie",
  "cla55",
  "fa5t",
  "b4ss",
  "gl4ss",
  "a55ist",
  "sh0p",
  "l3g day",
  "7000 steps",
  "100 pushups a day",
  "yaseen_01",
  "run_4_life",
  "a b c",
  "I am a runner",
  "Read 20 pages",
  "Morning run club",
  "Drink 8 cups of water",
  "Gym before work 😂",
  "café run",
  "Zoë's plan",
  "niggle",
  "hello",
  "assume",
  "bassoon",
] as const;

describe("normalizeForMatch (07.2)", () => {
  it("lowercases, strips accents and zero-width characters", () => {
    expect(normalizeForMatch("FÚck")).toBe("fuck");
    expect(normalizeForMatch("fu\u200Bck")).toBe("fuck");
    expect(normalizeForMatch("Zoë")).toBe("zoe");
  });
  it("maps leetspeak", () => {
    expect(normalizeForMatch("sh1t")).toBe("shit");
    expect(normalizeForMatch("a$$")).toBe("ass");
    expect(normalizeForMatch("@55")).toBe("ass");
    expect(normalizeForMatch("c0ck")).toBe("cock");
    expect(normalizeForMatch("tw4t")).toBe("twat");
    expect(normalizeForMatch("r3tard")).toBe("retard");
  });
  it("collapses 3+ repeated letters but keeps doubles", () => {
    expect(normalizeForMatch("shiiiit")).toBe("shit");
    expect(normalizeForMatch("fuuuuuck")).toBe("fuck");
    expect(normalizeForMatch("ass")).toBe("ass");
    expect(normalizeForMatch("class")).toBe("class");
  });
  it("joins single letters separated by spaces or punctuation", () => {
    expect(normalizeForMatch("f u c k")).toBe("fuck");
    expect(normalizeForMatch("f.u.c.k")).toBe("fuck");
    expect(normalizeForMatch("s-h-i-t")).toBe("shit");
    expect(normalizeForMatch("s_h_i_t")).toBe("shit");
    expect(normalizeForMatch("f u u u c k")).toBe("fuck");
  });
  it("treats punctuation and underscores between words as word breaks", () => {
    expect(normalizeForMatch("fuck_you")).toBe("fuck you");
    expect(normalizeForMatch("you.fuck")).toBe("you fuck");
    expect(normalizeForMatch("(fuck)")).toBe("fuck");
  });
});

describe("blockedPlainText dodges (07.2)", () => {
  it(`has at least 30 dodges and 30 clean words`, () => {
    expect(DODGES.length).toBeGreaterThanOrEqual(30);
    expect(CLEAN.length).toBeGreaterThanOrEqual(30);
  });
  for (const text of DODGES) {
    it(`blocks ${JSON.stringify(text)}`, () => {
      expect(blockedPlainText(text)).toBe(BLOCKED_TEXT);
      expect(moderateContent(text).allowed).toBe(false);
    });
  }
  for (const text of CLEAN) {
    it(`allows ${JSON.stringify(text)}`, () => {
      expect(blockedPlainText(text)).toBeNull();
    });
  }
});

describe("blockedPlainText glued words (08)", () => {
  for (const text of GLUED) {
    it(`blocks ${JSON.stringify(text)}`, () => {
      expect(blockedPlainText(text)).toBe(BLOCKED_TEXT);
    });
  }
  it("keeps the short words whole-word only", () => {
    for (const text of ["classy", "cockatoo", "damnation", "assess", "Dickens", "cocktail"]) {
      // Not caught: ass / cock / damn / dick sit inside too many ordinary words.
      expect(blockedPlainText(text)).toBeNull();
    }
  });
});

// 08 follow-up: the compounds of those short words, by exact list.
const GLUED_COMPOUNDS = ["dumbass", "jackass", "dickhead", "asshole", "dumbfuck", "motherfucker", "bullshit"];

describe("blockedPlainText glued compounds, exact list (08 follow-up)", () => {
  for (const text of GLUED_COMPOUNDS) {
    it(`blocks ${JSON.stringify(text)}`, () => {
      expect(blockedPlainText(text)).toBe(BLOCKED_TEXT);
      expect(blockedPlainText(`you ${text.toUpperCase()}`)).toBe(BLOCKED_TEXT);
      expect(blockedPlainText(`${text}es!!`, "comment")).toBe(blockedTextFor("comment"));
    });
  }
  it("the plural and the dodged spelling are caught too", () => {
    expect(blockedPlainText("dumbasses")).toBe(BLOCKED_TEXT);
    expect(blockedPlainText("a55hole")).toBe(BLOCKED_TEXT);
    expect(blockedPlainText("d.i.c.k.h.e.a.d")).toBe(BLOCKED_TEXT);
  });
  it("keeps class, cockatoo, damnation and assess clean", () => {
    for (const text of ["class", "cockatoo", "damnation", "assess", "Class assessment", "a cockatoo in the classroom"]) {
      expect(blockedPlainText(text)).toBeNull();
    }
  });
});

describe("blockedPlainText field messages (07.1)", () => {
  it("names the field when one is given", () => {
    expect(blockedPlainText("sh1t", "username")).toBe("Those words aren't allowed in a username. Try different ones.");
    expect(blockedPlainText("sh1t", "comment")).toBe(blockedTextFor("comment"));
    expect(blockedFieldFromMessage(blockedPlainText("sh1t", "bio"))).toBe("bio");
  });
  it("keeps the generic message without a field", () => {
    expect(blockedPlainText("sh1t")).toBe(BLOCKED_TEXT);
    expect(blockedFieldFromMessage(BLOCKED_TEXT)).toBeNull();
  });
  it("returns null for clean text in any field", () => {
    expect(blockedPlainText("Morning run club", "challenge title")).toBeNull();
    expect(blockedPlainText("", "bio")).toBeNull();
  });
  it("every field message ends with a full stop and has no exclamation mark", () => {
    for (const field of ["username", "display name", "bio", "challenge title", "task title", "caption", "comment"] as const) {
      const msg = blockedTextFor(field);
      expect(msg.endsWith(".")).toBe(true);
      expect(msg).not.toContain("!");
      expect(blockedFieldFromMessage(msg)).toBe(field);
    }
  });
});

describe("moderateChallengeQuality", () => {
  it("allows missing, null, and empty description (title checks still apply)", () => {
    for (const description of [undefined, null, ""] as const) {
      expect(
        moderateChallengeQuality({ title: TITLE, description, taskCount: 1 }),
      ).toEqual({ allowed: true });
    }
  });

  it("rejects whitespace-only description as empty", () => {
    const result = moderateChallengeQuality({
      title: TITLE,
      description: "   ",
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.category).toBe("low_quality");
    expect(result.reason).toMatch(/needs a description/i);
  });

  it("rejects a non-empty description shorter than MIN_DESCRIPTION_LENGTH", () => {
    const result = moderateChallengeQuality({
      title: TITLE,
      description: "Too short",
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.category).toBe("low_quality");
    expect(result.reason).toMatch(/at least 20 characters/i);
  });

  it("allows a description that meets MIN_DESCRIPTION_LENGTH", () => {
    expect(
      moderateChallengeQuality({
        title: TITLE,
        description: "A daily habit challenge with enough detail.",
        taskCount: 1,
      }),
    ).toEqual({ allowed: true });
  });

  it("still rejects a short title when description is omitted", () => {
    const result = moderateChallengeQuality({
      title: "Hi",
      description: "",
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/title is too short/i);
  });

  it("still rejects a too-long title when description is omitted", () => {
    const result = moderateChallengeQuality({
      title: "T".repeat(81),
      description: undefined,
      taskCount: 1,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/title is too long/i);
  });

  it("still requires at least one task", () => {
    const result = moderateChallengeQuality({
      title: TITLE,
      description: "",
      taskCount: 0,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/at least one daily task/i);
  });
});
