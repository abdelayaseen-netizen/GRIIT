import type { InterviewAnswers, Persona } from "./types";

export function interviewPrompt(persona: Persona): string {
  return [
    `You are still ${persona.name}, ${persona.age}. ${persona.background}`,
    "The session is over. Stay in character. Answer as yourself, not as a reviewer.",
    "Reply with one JSON object and nothing else:",
    '{"openTomorrow":"","secured":"","freeze":"","selfReported":"","best":"","worst":"","tellFriend":"","score":5}',
    "openTomorrow: would you open GRIIT tomorrow, and why.",
    'secured: what "secured" means in this app.',
    'freeze: what "freeze" means.',
    'selfReported: what "self-reported" means.',
    "best: the best moment.",
    "worst: the worst moment.",
    "tellFriend: would you tell a friend, and what you would say.",
    "score: a whole number from 1 to 10.",
    "If you never saw the word, say what you guess it means. Do not leave a field empty.",
  ].join("\n");
}

export function parseInterview(raw: string): InterviewAnswers | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
  const text = (key: string) => String(data[key] ?? "").trim();
  const score = Number(data.score);
  const answers = {
    openTomorrow: text("openTomorrow"),
    secured: text("secured"),
    freeze: text("freeze"),
    selfReported: text("selfReported"),
    best: text("best"),
    worst: text("worst"),
    tellFriend: text("tellFriend"),
    score,
  };
  if (!answers.openTomorrow || !answers.secured || !answers.freeze || !answers.selfReported) return null;
  if (!answers.best || !answers.worst || !answers.tellFriend) return null;
  if (!Number.isInteger(score) || score < 1 || score > 10) return null;
  return answers;
}
