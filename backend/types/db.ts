/**
 * Minimal DB row types for backend routes. Use instead of (as any) for Supabase select results.
 */

export interface StreakRow {
  last_completed_date_key: string | null;
  active_streak_count: number | null;
  longest_streak_count: number | null;
  last_stands_available?: number | null;
  last_stands_used_total?: number | null;
}

export interface DaySecureRow {
  date_key: string;
  user_id?: string;
}

/** Minimal task row; API responses use mapped shape from backend/lib/challenge-tasks (ChallengeTaskApiShape). */
export interface ChallengeTaskRow {
  id: string;
  required: boolean;
}

export interface ActiveChallengeWithTasks {
  id: string;
  current_day: number | null;
  challenges?: { challenge_tasks?: ChallengeTaskRow[] } | null;
}

/** Challenge row with nested challenge_tasks (list/getFeatured). */
export interface ChallengeWithTasksRow {
  id: string;
  title?: string | null;
  visibility?: string | null;
  status?: string | null;
  is_featured?: boolean | null;
  participants_count?: number | null;
  created_at?: string | null;
  category?: string | null;
  challenge_tasks?: ChallengeTaskRow[] | null;
  [key: string]: unknown;
}

export interface ProfileRow {
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  total_days_secured?: number | null;
}

export interface LeaderboardProfileRow {
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

export interface LeaderboardStreakRow {
  user_id: string;
  active_streak_count?: number | null;
}

export interface RespectRow {
  id: string;
  actor_id: string;
  created_at: string;
}

export interface StoryWithViews {
  id: string;
  user_id: string;
  story_views?: { user_id: string }[] | null;
  [key: string]: unknown;
}

export interface PushTokenRow {
  token: string;
}

export interface NudgeRow {
  id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  created_at: string;
}

/** Supabase/PG error shape for code checks (e.g. 23505 unique violation). */
export interface PgError {
  code?: string;
  message?: string;
}

/** Profile row with optional expo_push_token (for push flows). */
export interface ProfileWithExpoRow extends ProfileRow {
  expo_push_token?: string | null;
}
