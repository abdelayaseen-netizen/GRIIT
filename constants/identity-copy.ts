export type IdentityTier =  | "day_zero"
  | "starting"
  | "becoming"
  | "establishing"
  | "identity"
  | "consolidated"
  | "core";

export type StreakRiskCopy = { title: string; body: string };

export function getStreakAtRiskCopy(streakCount: number): StreakRiskCopy {
  const streak = Math.max(0, Math.floor(streakCount));
  if (streak === 0) {
    return {
      title: "First day. Don't break it before it starts.",
      body: "30 seconds is enough. Mark today and begin.",
    };
  }
  if (streak < 7) {
    return {
      title: `${streak} days. Don't lose it tonight.`,
      body: "You're closer to a habit than you think. Mark today before midnight.",
    };
  }
  if (streak < 30) {
    return {
      title: `${streak}-day streak at risk.`,
      body: "You earned this. Don't give it back. Even a minimum day keeps it alive.",
    };
  }
  return {
    title: `${streak} days. This is who you are now.`,
    body: "Don't let one night undo it. Mark today before midnight.",
  };
}
