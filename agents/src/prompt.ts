import type { Mode, Persona, StepLog } from "./types";

export function systemPrompt(): string {
  return [
    "You are one person using the GRIIT iPhone app. You can see a screenshot and the accessibility labels.",
    "Reply with one JSON object and nothing else:",
    '{"action":"tap|type|scroll|back|wait|double_tap|kill_app|done","target":"","text":"","thought":"","confusion":"","emotion":"frustrated|neutral|satisfied"}',
    "target must be copied from the element list, or a point like 50%,62% when no label exists.",
    "For type, target is the field and text is what to type. Never repeat the password in thought or confusion.",
    "emotion is frustrated when the screen is unclear or you are stuck, satisfied when something you wanted worked, otherwise neutral.",
    "Put a short quote in confusion only when something is actually confusing. Otherwise use an empty string.",
    "Do not invent buttons that are not in the element list.",
    "A label ending in (selected) is already on. Do not tap it again.",
    "You are not polite or patient by default. Real people skim, skip text, and give up. Don't ask questions you wouldn't ask a real app.",
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
  handoff?: string;
  nudge?: string;
}): string {
  const recent = input.history.slice(-6).map((step) => {
    const err = step.error ? ` error=${step.error}` : "";
    return `${step.step}. ${step.screen} ${step.action} ${step.target}${err} | ${step.thought}`;
  });
  const modeLine =
    input.mode === "free"
      ? "You just downloaded GRIIT. Use it the way someone like you really would. There is no assigned task."
      : "Finish the goals in order. Stop with action done only when they are finished or you would really give up.";
  return [
    `You are ${input.persona.name}, ${input.persona.age}, ${input.persona.gender}. ${input.persona.background}`,
    `You downloaded GRIIT because: ${input.persona.why}`,
    `Tech comfort ${input.persona.tech}. Motivation ${input.persona.motivation}. English is your ${input.persona.english === "native" ? "first language" : "second language"}.`,
    input.persona.stress ? `Stress focus: ${input.persona.stress}` : "",
    modeLine,
    input.mode === "goal" ? `Goals:\n${input.goalStatus.map((g) => `- ${g}`).join("\n")}` : "",
    "Rules: do not use Sign in with Apple. Do not subscribe or purchase. Do not like, comment, or follow anyone except Seed GRIIT.",
    input.handoff ? `A friend sent this invite. Open it before you do anything else: ${input.handoff}` : "",
    input.nudge ?? "",
    "Take at least 15 actions before you stop, unless your goal is already finished. An interview comes after you stop. Answer it as yourself.",
    input.prepared
      ? "You are already signed in and onboarding is already done. Stay on Home. Do not create another account and do not log out."
      : "You are on a brand-new phone at the welcome screen. The account comes after the first task. Walk welcome, your goals, how it works, Start here, join a challenge you can join, then reminders. Reach Home as a guest and finish one task with a button that starts with Done. Save the account with the email below only when the app asks, after that task. Never join an invite-only group. If your tech comfort is low, give up after two failed taps on the same thing, but only after 15 actions.",
    input.prepared
      ? ""
      : "Use action type for a text field, and only once. If the field already shows the right text, move on. A short name matches the start of a longer label. Pick at least one and Lock it in do nothing until a row is selected. If the row you want is below the fold, scroll first.",
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
