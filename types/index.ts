
/** Task shape returned by API (challenge_tasks mapped from DB). Use for typing challenge detail, timer, index. */
export interface ChallengeTaskFromApi {
  id: string;
  title?: string | null;
  type: string;
  required: boolean;
  duration_minutes?: number | null;
  min_words?: number | null;
  require_photo_proof?: boolean;
  strict_timer_mode?: boolean;
  order_index?: number | null;
  verification_method?: string | null;
  verification_rule_json?: { sport?: string; min_distance_m?: number; min_moving_time_s?: number } | null;
  [key: string]: unknown;
}

export type JournalCategory = "self_reflection" | "emotions" | "mental_clarity" | "physical_state" | "gratitude" | "wins_losses" | "discipline_check" | "free_write";



export type WordLimitMode = "PRESET" | "CUSTOM";

export type ScheduleType = "NONE" | "DAILY" | "CUSTOM_DATES";

export type WindowMode = "NONE" | "WINDOW" | "HARD_DEADLINE";

export type TimezoneMode = "USER_LOCAL" | "CHALLENGE_TIMEZONE";

export interface TimeEnforcementConfig {
  timeEnforcementEnabled: boolean;
  scheduleType: ScheduleType;
  anchorTimeLocal: string | null;
  durationMinutes: number | null;
  windowMode: WindowMode;
  windowStartOffsetMin: number | null;
  windowEndOffsetMin: number | null;
  hardWindowStartOffsetMin: number | null;
  hardWindowEndOffsetMin: number | null;
  timezoneMode: TimezoneMode;
  challengeTimezone: string | null;
}

export type ChallengeType = "standard" | "one_day" | "solo" | "team" | "both";
type GoalMode = "individual" | "shared";
type TeamStatus = "active" | "completed" | "abandoned";
type TeamMemberRole = "creator" | "member";

export type ReplayPolicy = "live_only" | "allow_replay";







/** Row shape from checkins.getTodayCheckinsForUser (today's check-ins across all active challenges). */
export interface TodayCheckinForUser {
  active_challenge_id: string;
  task_id: string;
  status: string;
  date_key?: string;
  id?: string;
  value?: number | null;
  note_text?: string | null;
  proof_url?: string | null;
  completion_image_url?: string | null;
  proof_source?: string | null;
  external_activity_id?: string | null;
  verification_status?: string | null;
  created_at?: string;
}

export type ChallengeVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";


export interface AllowedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export type RunMode = "outdoor_gps" | "treadmill_proof";

/** Challenge detail as returned by challenges.getById (with optional team/shared goal fields). */
export interface ChallengeDetailFromApi {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  duration_type?: string;
  duration_days?: number;
  visibility?: string;
  status?: string;
  difficulty?: string;
  participation_type?: string;
  run_status?: "waiting" | "active" | "completed" | "failed";
  team_size?: number;
  shared_goal_target?: number | null;
  shared_goal_unit?: string | null;
  deadline_type?: string | null;
  deadline_date?: string | null;
  ends_at?: string | null;
  is_daily?: boolean;
  live_date?: string | null;
  tasks?: ChallengeTaskFromApi[];
  teamMembers?: TeamMemberForListApi[];
  sharedGoalTotal?: number | null;
  short_hook?: string | null;
  about?: string | null;
  rules?: unknown[];
  fail_condition?: string | null;
  participants_count?: number;
  active_today_count?: number;
  hard_pick_rate?: number | null;
  hard_finish_rate?: number | null;
  completion_rate?: number | null;
  is_featured?: boolean | null;
  created_by?: string | null;
}

interface TeamMemberForListApi {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  profiles?: { display_name?: string | null; username?: string | null; avatar_url?: string | null } | null;
  secured_today?: boolean;
  tasks_completed?: number;
  tasks_total?: number;
}

/** Active challenge as returned by activeChallenges.getMine (with current_day_index, challenge_id). */
export interface ActiveChallengeFromApi {
  id: string;
  challenge_id: string;
  current_day_index?: number;
  current_day?: number;
  challenges?: Record<string, unknown>;
}

interface Team {
  id: string;
  name: string;
  challenge_id: string;
  creator_id: string;
  team_code: string;
  max_members: number;
  goal_mode: GoalMode;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  joined_at: string;
  display_name?: string;
  avatar_url?: string;
}

// keep: planned for Q4 2026 team challenges
// keep: planned for Q4 2026 team challenges
export interface TeamWithMembers extends Team {
  members: TeamMember[];
  member_count: number;
}

/** Stats as returned by stats.getForHome (tier, nextTierName, pointsToNextTier, etc.). */
export interface StatsFromApi {
  tier?: string | null;
  nextTierName?: string | null;
  pointsToNextTier?: number | null;
  totalDaysSecured?: number | null;
  preferredSecureTime?: string | null;
  lastStandsAvailable?: number | null;
  lastStandRequiresPremium?: boolean;
  lastCompletedDateKey?: string | null;
  longestStreak?: number;
  /** Null when no streaks row was readable (distinct from a real zero). */
  activeStreak?: number | null;
  completedChallenges?: number;
  activeChallenges?: number;
}

/** Profile as returned by profiles.get (subscription_status, subscription_expiry, tier, etc.). */
export interface ProfileFromApi {
  subscription_status?: string | null;
  subscription_expiry?: string | null;
  tier?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  username?: string | null;
  profile_visibility?: string | null;
  created_at?: string | null;
  bio?: string | null;
  /** IANA timezone for calendar date_key (matches backend). */
  timezone?: string | null;
  /** When present, used by streak freeze UI (optional DB column). */
  streak_freezes_remaining?: number | null;
}

/** Check-in row from getTodayCheckins (task_id, status, etc.). */
export interface CheckinFromApi {
  task_id: string;
  status: string;
  id?: string;
  value?: number | null;
  note_text?: string | null;
  proof_url?: string | null;
  proof_source?: string | null;
}
