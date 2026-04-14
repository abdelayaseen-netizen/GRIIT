/**
 * Basic content moderation for user-generated challenge titles and descriptions.
 * Uses a keyword blocklist + pattern matching. Runs server-side on create.
 */

const PROFANITY_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "dick",
  "cock",
  "pussy",
  "cunt",
  "bastard",
  "whore",
  "slut",
  "fag",
  "nigger",
  "nigga",
  "retard",
  "twat",
];

// Low-effort/junk content. Catches the "Poop"-class submissions that
// aren't profanity but aren't real challenges either.
const LOW_EFFORT_WORDS = [
  "poop",
  "fart",
  "pee",
  "piss",
  "boob",
  "boobs",
  "tit",
  "tits",
  "balls",
  "butt",
  "asdf",
  "asdfasdf",
  "qwerty",
  "test123",
  "lorem",
  "ipsum",
];

const MIN_TITLE_LENGTH = 4;
const MAX_TITLE_LENGTH = 80;
const MIN_DESCRIPTION_LENGTH = 20;

const NEGATIVE_PATTERNS = [
  "hater",
  "hate on",
  "bully",
  "harass",
  "stalk",
  "hurt someone",
  "punch",
  "fight someone",
  "steal",
  "vandal",
  "destroy",
  "sabotage",
];

const INAPPROPRIATE_PATTERNS = [
  "nude",
  "naked",
  "strip",
  "undress",
  "topless",
  "shirtless photo",
  "body pic",
  "onlyfans",
  "sexy",
  "sexual",
  "nsfw",
  "drugs",
  "weed",
  "smoke weed",
  "get high",
  "get drunk",
  "alcohol challenge",
  "drinking game",
];

const DANGEROUS_PATTERNS = [
  "starve",
  "don't eat",
  "skip meals",
  "purge",
  "laxative",
  "cut yourself",
  "self harm",
  "self-harm",
  "suicide",
  "hurt yourself",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type ModerationResult = {
  allowed: boolean;
  reason?: string;
  category?: "profanity" | "negative" | "inappropriate" | "dangerous" | "low_effort" | "low_quality";
};

export function moderateContent(title: string, description?: string): ModerationResult {
  const combined = normalize(`${title} ${description ?? ""}`);

  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(combined)) {
      return {
        allowed: false,
        reason: "Challenge contains inappropriate language. Please keep it clean.",
        category: "profanity",
      };
    }
  }

  for (const word of LOW_EFFORT_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(combined)) {
      return {
        allowed: false,
        reason: "Please use a more meaningful title and description for your challenge.",
        category: "low_effort",
      };
    }
  }

  for (const pattern of NEGATIVE_PATTERNS) {
    if (combined.includes(normalize(pattern))) {
      return {
        allowed: false,
        reason: "Challenges should be positive and constructive. Please rephrase.",
        category: "negative",
      };
    }
  }

  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (combined.includes(normalize(pattern))) {
      return {
        allowed: false,
        reason: "This type of challenge is not allowed on GRIIT.",
        category: "inappropriate",
      };
    }
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (combined.includes(normalize(pattern))) {
      return {
        allowed: false,
        reason: "This challenge could encourage harmful behavior and is not allowed.",
        category: "dangerous",
      };
    }
  }

  return { allowed: true };
}

export function moderateTaskTitle(title: string): ModerationResult {
  return moderateContent(title);
}

/**
 * Quality heuristics: minimum lengths and structural requirements.
 * Call this BEFORE moderateContent in challenges-create. Returns the
 * first failure. Catches "Poop"-style submissions before they reach
 * the keyword-based content moderation.
 */
export function moderateChallengeQuality(input: {
  title: string;
  description: string | null | undefined;
  taskCount: number;
}): ModerationResult {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";

  if (title.length < MIN_TITLE_LENGTH) {
    return {
      allowed: false,
      reason: `Your challenge title is too short. Use at least ${MIN_TITLE_LENGTH} characters so people understand what it is.`,
      category: "low_quality",
    };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      allowed: false,
      reason: `Your challenge title is too long. Keep it under ${MAX_TITLE_LENGTH} characters.`,
      category: "low_quality",
    };
  }
  if (description.length === 0) {
    return {
      allowed: false,
      reason: "Your challenge needs a description so people know what they're committing to.",
      category: "low_quality",
    };
  }
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    return {
      allowed: false,
      reason: `Your description is too short. Use at least ${MIN_DESCRIPTION_LENGTH} characters to explain what the challenge is about.`,
      category: "low_quality",
    };
  }
  if (input.taskCount < 1) {
    return {
      allowed: false,
      reason: "Your challenge needs at least one daily task.",
      category: "low_quality",
    };
  }

  return { allowed: true };
}
