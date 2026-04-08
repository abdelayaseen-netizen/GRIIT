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
  category?: "profanity" | "negative" | "inappropriate" | "dangerous";
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
