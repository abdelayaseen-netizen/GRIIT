export type Tech = "low" | "med" | "high";
export type Phone = "small" | "large";
export type TextSize = "default" | "large" | "largest";
export type Motivation = "curious" | "committed" | "skeptical";
export type English = "native" | "second";
export type Emotion = "frustrated" | "neutral" | "satisfied";
export type Mode = "goal" | "free";

export type Persona = {
  id: string;
  name: string;
  age: number;
  gender: string;
  group: string;
  background: string;
  why: string;
  goals: string[];
  tech: Tech;
  patience: number;
  phone: Phone;
  textSize: TextSize;
  motivation: Motivation;
  english: English;
  links?: string[];
  stress?: string;
};

export type Decision = {
  action: string;
  target: string;
  text?: string;
  thought: string;
  confusion?: string;
  emotion: Emotion;
};

export type StepLog = {
  step: number;
  timestamp: string;
  screen: string;
  route: string;
  action: string;
  target: string;
  text?: string;
  thought: string;
  confusion: string;
  emotion: Emotion;
  latencyMs: number;
  error: string;
  shot: string;
};

export type GoalResult = {
  id: string;
  text: string;
  kind: "db" | "observed";
  pass: boolean;
  detail: string;
};

export type AgentResult = {
  personaId: string;
  group: string;
  mode: Mode;
  startedAt: string;
  endedAt: string;
  steps: number;
  durationSec: number;
  goals: GoalResult[];
  giveUp: string;
  crashes: string[];
  errors: string[];
  deadEnds: string[];
  wrongNumbers: string[];
  funnel: string;
  stages: string[];
  device: string;
  textSizeApplied: string;
  userId: string;
  isTest: boolean | null;
  cleanup: string;
};
