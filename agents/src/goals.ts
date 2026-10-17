import type { Persona } from "./types";

export type GoalCheck = "account" | "joined" | "posted" | "shared" | "created" | "observed";

export type GoalSpec = { id: string; text: string; check: GoalCheck };

export function inferCheck(text: string): GoalCheck {
  if (/^find\b|^read\b|^notice\b|^see\b|^look\b|^open the feed\b|^reach home and read\b|^get from\b|^stop before\b/i.test(text)) return "observed";
  if (/creating your account|create your account|finish creating/i.test(text)) return "account";
  if (/^join\b/i.test(text)) return "joined";
  if (/already did it|tap complete|complete it|finish one task/i.test(text)) return "posted";
  if (/custom challenge|add one task|add a task/i.test(text)) return "created";
  return "observed";
}

const FRESH_SIGNUP = new Set(["lowtech-01", "teen-01", "stress-01"]);

/**
 * A fresh persona starts on a wiped app at Welcome. Everyone else logs in ready, onto Home.
 * Build 90 10.3: the persona says so itself (`fresh: true`). On Oct 15 only the six chunk-8
 * first-timers set AGENTS_FRESH, so 31 of 38 sessions opened on Home with a prepared account.
 * The env switch and the three legacy ids still work for the older runners.
 */
export function needsFreshSignup(persona: { id: string; fresh?: boolean } | string): boolean {
  const id = typeof persona === "string" ? persona : persona.id;
  if (typeof persona !== "string" && typeof persona.fresh === "boolean") return persona.fresh;
  if (process.env.AGENTS_FRESH === "1") return true;
  return FRESH_SIGNUP.has(id);
}

export function specsFor(persona: Persona): GoalSpec[] {
  return persona.goals.map((text, index) => ({
    id: `${persona.id}-g${index + 1}`,
    text,
    check: inferCheck(text),
  }));
}
