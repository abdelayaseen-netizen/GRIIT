export type IdentityTier =
  | "day_zero"
  | "starting"
  | "becoming"
  | "establishing"
  | "identity"
  | "consolidated"
  | "core";

export function getIdentityTier(streakCount: number): IdentityTier {
  const streak = Math.max(0, Math.floor(streakCount));
  if (streak === 0) return "day_zero";
  if (streak <= 2) return "starting";
  if (streak <= 6) return "becoming";
  if (streak <= 13) return "establishing";
  if (streak <= 29) return "identity";
  if (streak <= 59) return "consolidated";
  return "core";
}

export function getIdentityLine(streakCount: number): string {
  const tier = getIdentityTier(streakCount);
  switch (tier) {
    case "day_zero":
      return "Day one. Discipline starts here.";
    case "starting":
      return "You showed up today. That's how it begins.";
    case "becoming":
      return "You're becoming someone who shows up.";
    case "establishing":
      return "You're becoming the kind of person who keeps promises.";
    case "identity":
      return "You ARE someone who keeps promises.";
    case "consolidated":
      return "Discipline isn't your goal anymore - it's your default.";
    case "core":
    default:
      return "This is who you are now.";
  }
}

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
