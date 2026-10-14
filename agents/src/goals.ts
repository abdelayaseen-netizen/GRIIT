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

/** These three still walk real sign-up and onboarding. Everyone else logs in ready. */
export function needsFreshSignup(id: string): boolean {
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
