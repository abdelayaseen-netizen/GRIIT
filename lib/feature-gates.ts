/**
 * Free vs. Pro feature gating. Use with useProStatus() and checkGate().
 */
export const GATES = {
  MAX_FREE_ACTIVE_CHALLENGES: "MAX_FREE_ACTIVE_CHALLENGES",
  GPS_VERIFICATION: "GPS_VERIFICATION",
  LEADERBOARD_ACCESS: "LEADERBOARD_ACCESS",
  TEAMS_ACCESS: "TEAMS_ACCESS",
  HEART_RATE_VERIFICATION: "HEART_RATE_VERIFICATION",
} as const;

export const FREE_TIER = {
  MAX_FREE_ACTIVE_CHALLENGES: 1,
  GPS_VERIFICATION: false,
  LEADERBOARD_ACCESS: false,
  TEAMS_ACCESS: false,
  HEART_RATE_VERIFICATION: false,
} as const;

export const PRO_TIER = {
  MAX_FREE_ACTIVE_CHALLENGES: Infinity,
  GPS_VERIFICATION: true,
  LEADERBOARD_ACCESS: true,
  TEAMS_ACCESS: true,
  HEART_RATE_VERIFICATION: true,
} as const;

export type GateKey = keyof typeof GATES;

/**
 * Returns true if the feature is allowed for the given Pro status.
 */
export function checkGate(gate: GateKey, isPro: boolean): boolean {
  if (isPro) {
    if (gate === "MAX_FREE_ACTIVE_CHALLENGES") return true;
    return PRO_TIER[gate as keyof typeof PRO_TIER] === true;
  }
  if (gate === "MAX_FREE_ACTIVE_CHALLENGES") {
    return true; // Limit is enforced by count, not this boolean
  }
  switch (gate) {
    case "GPS_VERIFICATION":
      return FREE_TIER.GPS_VERIFICATION;
    case "LEADERBOARD_ACCESS":
      return FREE_TIER.LEADERBOARD_ACCESS;
    case "TEAMS_ACCESS":
      return FREE_TIER.TEAMS_ACCESS;
    case "HEART_RATE_VERIFICATION":
      return FREE_TIER.HEART_RATE_VERIFICATION;
    default:
      return false;
  }
}

/**
 * Human-readable reason for showing the paywall when a gate blocks the user.
 */
export function getPaywallTrigger(gate: GateKey): string {
  switch (gate) {
    case "MAX_FREE_ACTIVE_CHALLENGES":
      return "Multiple active challenges are a Pro feature.";
    case "GPS_VERIFICATION":
      return "GPS verification is a Pro feature.";
    case "LEADERBOARD_ACCESS":
      return "Leaderboards are a Pro feature.";
    case "TEAMS_ACCESS":
      return "Teams are a Pro feature.";
    case "HEART_RATE_VERIFICATION":
      return "Heart rate verification is a Pro feature.";
    default:
      return "This feature is available with Pro.";
  }
}
