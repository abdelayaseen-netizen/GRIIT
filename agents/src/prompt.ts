import type { Mode, Persona, StepLog } from "./types";

/** Build 90 10.3: nobody may stop before this many actions. Oct 15: 11 of 38 sessions ended early. */
export const MIN_STEPS = 15;

export function systemPrompt(): string {
  return [
    "You are one person using the GRIIT iPhone app. You can see a screenshot and the accessibility labels.",
    "Reply with one JSON object and nothing else:",
    '{"screen":"","action":"tap|type|scroll|back|wait|double_tap|kill_app|done","target":"","text":"","thought":"","confusion":"","emotion":"frustrated|neutral|satisfied"}',
    "screen is the name of the screen you are on: the title at the top when there is one, otherwise two or three of your own words (Welcome, Pick goals, Post or keep private, Day secured).",
    "target must be copied from the element list, or a point like 50%,62% when no label exists.",
    "For type, target is the field and text is what to type. Never repeat the password in thought or confusion.",
    "emotion is frustrated when the screen is unclear or you are stuck, satisfied when something you wanted worked, otherwise neutral.",
    "Put a short quote in confusion only when something is actually confusing. Otherwise use an empty string.",
    "Do not invent buttons that are not in the element list.",
    "A label ending in (selected) is already on. Do not tap it again.",
    `You are not polite or patient by default. Real people skim, skip text, and give up. Still, this is a test session: use at least ${MIN_STEPS} actions before action done. If you would have quit earlier, say so in thought and keep exploring.`,
  ].join("\n");
}

export function userPrompt(input: {
  persona: Persona;
  mode: Mode;
  creds: { email: string; password: string; username: string };
  lines: string[];
  history: StepLog[];
  goalStatus: string[];
  prepared: boolean;
  /** Build 90 10.4 chunk 5: an existing account on a signed-out phone. */
  signedOut?: boolean;
  /** Build 90 10.3: one-line harness note for this step (the screen repeated, taps owed before stopping). */
  note?: string;
}): string {
  const recent = input.history.slice(-6).map((step) => {
    const err = step.error ? ` error=${step.error}` : "";
    return `${step.step}. ${step.screenName || step.screen} ${step.action} ${step.target}${err} | ${step.thought}`;
  });
  const modeLine =
    input.mode === "free"
      ? "You just downloaded GRIIT. Use it the way someone like you really would. There is no assigned task."
      : "Finish the goals in order. Stop with action done only when they are finished or you would really give up.";
  const used = input.history.filter((step) => step.action !== "abort").length;
  const owed = Math.max(0, MIN_STEPS - used);
  return [
    `You are ${input.persona.name}, ${input.persona.age}, ${input.persona.gender}. ${input.persona.background}`,
    `You downloaded GRIIT because: ${input.persona.why}`,
    `Tech comfort ${input.persona.tech}. Motivation ${input.persona.motivation}. English is your ${input.persona.english === "native" ? "first language" : "second language"}.`,
    input.persona.stress ? `Stress focus: ${input.persona.stress}` : "",
    modeLine,
    input.mode === "goal" ? `Goals:\n${input.goalStatus.map((g) => `- ${g}`).join("\n")}` : "",
    "Rules: do not use Sign in with Apple. Do not subscribe or purchase. Do not like, comment, or follow anyone except Seed GRIIT and other test accounts named in your goals.",
    input.prepared
      ? "You are already signed in and onboarding is already done. Stay on Home. Do not create another account and do not log out."
      : input.signedOut
        ? "You already have a GRIIT account (the email and password below) but this phone is signed out and shows the welcome screen. Tap I already have an account and log in with that email and password. Do not create a new account."
        : "You are on a brand-new phone at the welcome screen. The account comes after the first task. Walk welcome, your goals, how it works, Start here, join a challenge you can join, then reminders. Reach Home as a guest and finish one task with a button that starts with Done. Save the account with the email below only when the app asks, after that task. Never join an invite-only group unless a goal gives you its link.",
    input.prepared
      ? ""
      : "Use action type for a text field, and only once. If the field already shows the right text, move on. A short name matches the start of a longer label. Pick at least one and Lock it in do nothing until a row is selected. If the row you want is below the fold, scroll first.",
    owed > 0 ? `You have used ${used} of the ${MIN_STEPS} actions you owe before you may stop. action done will be refused until then.` : "",
    input.note ? `Note from the test: ${input.note}` : "",
    "When the account screen asks, type this email, username, and password exactly. Display name is your name.",
    `Email: ${input.creds.email}`,
    `Username: ${input.creds.username}`,
    `Password: ${input.creds.password}`,
    recent.length ? `Recent steps:\n${recent.join("\n")}` : "This is the first screen.",
    `Elements:\n${input.lines.join("\n") || "(no labels)"}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Build 90 10.4 chunk 6: the exit interview every persona answers once the session ends. */
export function interviewPrompt(persona: Persona, history: StepLog[]): string {
  const seen = [...new Set(history.map((step) => step.screenName || step.screen))].slice(0, 20).join(", ");
  return [
    `You are ${persona.name}, ${persona.age}. ${persona.background} You just spent a session in the GRIIT iPhone app. Screens you saw: ${seen || "none"}.`,
    "Answer from what the app showed you, not from guessing. If the app never explained a word, say so.",
    "Reply with one JSON object and nothing else:",
    '{"secured":"","freeze":"","self_reported":"","tomorrow":""}',
    "secured: in one sentence, what does \"Day secured\" mean in this app?",
    "freeze: in one sentence, what is a freeze in this app?",
    "self_reported: in one sentence, what does \"Self-reported\" mean on a task?",
    "tomorrow: a number from 1 to 10 for whether you would open this app tomorrow, then one short reason.",
  ].join("\n");
}
