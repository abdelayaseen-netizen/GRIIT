export type StreakAtRiskData = {
  challenge_id: string;
  challenge_slug: string | null;
  challenge_name: string;
  streak_length: number;
  hours_remaining: number;
  proof_type: "photo" | "text" | "location";
};
