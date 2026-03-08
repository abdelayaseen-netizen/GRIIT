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

/** Participation type: solo (default), duo, team daily discipline, or shared goal. */
export type ParticipationType = "solo" | "duo" | "team" | "shared_goal";

/** Run status for team/shared_goal only. Solo ignores this. */
export type RunStatus = "waiting" | "active" | "completed" | "failed";

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
  participation_type?: ParticipationType | null;
  team_size?: number | null;
  shared_goal_target?: number | null;
  shared_goal_unit?: string | null;
  deadline_type?: string | null;
  deadline_date?: string | null;
  started_at?: string | null;
  run_status?: RunStatus | null;
  [key: string]: unknown;
}

/** challenge_members: who is in a challenge (run). */
export interface ChallengeMemberRow {
  id: string;
  challenge_id: string;
  user_id: string;
  role: "creator" | "member";
  status: "active" | "quit" | "failed";
  joined_at: string;
}

/** shared_goal_logs: one contribution toward shared goal. Total = SUM(amount). */
export interface SharedGoalLogRow {
  id: string;
  challenge_id: string;
  user_id: string;
  amount: number;
  unit: string;
  logged_at: string;
  note?: string | null;
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
