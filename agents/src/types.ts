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
  /** Build 90 10.3: a fresh persona starts on a wiped app at Welcome. Everyone else logs in onto Home. */
  fresh?: boolean;
  /** Build 90 10.3: which overnight chunk this session belongs to ("2-first-day"). */
  chunk?: string;
  /** Build 90 10.4 chunk 5 login: a prepared account, but the app is wiped and opens at Welcome, so the person must log in. */
  startSignedOut?: boolean;
};

export type Decision = {
  action: string;
  target: string;
  text?: string;
  thought: string;
  confusion?: string;
  emotion: Emotion;
  /** Build 90 10.3: the screen as the agent names it. Used when the classifier's title is wrong. */
  screen?: string;
};

export type StepLog = {
  step: number;
  timestamp: string;
  /** Classifier bucket (home, task, discover, other…). */
  screen: string;
  route: string;
  /** Build 90 10.3: the real screen name. The agent's description when the classifier says other or unknown. */
  screenName: string;
  chunk: string;
  action: string;
  target: string;
  text?: string;
  thought: string;
  confusion: string;
  emotion: Emotion;
  latencyMs: number;
  error: string;
  shot: string;
  /** Build 90 10.3: ms from tapping Done until the post-or-private sheet or a done marker was on screen. */
  doneToSheetMs?: number;
  /** Build 90 10.3: ms from tapping Done until the task showed as done (N of M done, Day secured). */
  doneToVisibleMs?: number;
};

export type DoneTiming = {
  step: number;
  taskLabel: string;
  tappedAt: string;
  /** Done tap → post-or-private sheet on screen. Pure UI time. */
  toSheetMs: number | null;
  /** Sheet choice tap (or the Done tap when there was no sheet) → "N of M done" / "Day secured" on screen. */
  toVisibleMs: number | null;
  marker: string;
  /** The sheet button that was tapped (Keep it private, Post to friends), or "" when none. */
  choice: string;
};

export type Interview = {
  secured: string;
  freeze: string;
  selfReported: string;
  tomorrow: string;
  securedRight: boolean;
  freezeRight: boolean;
  selfReportedRight: boolean;
  asked: boolean;
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
  chunk: string;
  /** Build 90 10.3: the first screen the person saw ("welcome", "home", …) and whether a fresh persona got Welcome. */
  startedOn: string;
  freshStartOk: boolean | null;
  /** Build 90 10.3: how many taps were refused because the 15-tap minimum had not been met. */
  earlyStopsRefused: number;
  doneTimings: DoneTiming[];
  interview: Interview | null;
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
