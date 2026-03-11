export interface StarterTask {
  id: string;
  title: string;
  type: string;
  verification?: string;
  estimate?: string;
  journalPrompt?: string;
  journalTypes?: string[];
  captureMood?: boolean;
  captureEnergy?: boolean;
  captureBodyState?: boolean;
  wordLimitEnabled?: boolean;
  wordLimitWords?: number | null;
  timeEnforcementEnabled?: boolean;
  anchorTimeLocal?: string;
  windowStartOffsetMin?: number;
  windowEndOffsetMin?: number;
  hardWindowEnabled?: boolean;
  hardWindowStartOffsetMin?: number;
  hardWindowEndOffsetMin?: number;
}

export interface StarterChallenge {
  id: string;
  title: string;
  description: string;
  short_hook: string;
  about?: string;
  theme_color: string;
  difficulty: string;
  duration_type: string;
  duration_days: number;
  category: string;
  visibility: string;
  status: string;
  is_featured: boolean;
  is_daily: boolean;
  starts_at: string | null;
  ends_at: string | null;
  participants_count: number;
  active_today_count?: number;
  hard_pick_rate?: number;
  hard_finish_rate?: number;
  completion_rate?: number;
  rules?: string[];
  fail_condition?: string;
  challenge_tasks: StarterTask[];
  tasks: StarterTask[];
}

/**
 * Types only. Challenge data comes from API (getStarterPack, getFeatured, getById).
 * The STARTER_CHALLENGES array was removed; use scripts/seed-challenges.sql for DB data.
 */
