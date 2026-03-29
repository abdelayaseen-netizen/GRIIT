export type TaskType = "run" | "journal" | "timer" | "photo" | "checklist" | "custom" | "checkin";

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

export type MoodLevel = "very_bad" | "bad" | "neutral" | "good" | "very_good";

export type BodyState = "fresh" | "ok" | "sore" | "exhausted";

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

export interface JournalConfig {
  journalType: JournalCategory[];
  journalPrompt: string;
  allowFreeWrite: boolean;
  captureMood: boolean;
  captureEnergy: boolean;
  captureBodyState: boolean;
  wordLimitEnabled: boolean;
  wordLimitMode: WordLimitMode;
  wordLimitWords: number | null;
}

export interface JournalEntry {
  entryText: string;
  mood?: MoodLevel;
  energy?: number;
  bodyState?: BodyState;
  createdAt: string;
}

export type ChallengeType = "standard" | "one_day" | "solo" | "team" | "both";
export type GoalMode = "individual" | "shared";
export type TeamStatus = "active" | "completed" | "abandoned";
export type TeamMemberRole = "creator" | "member";
export type InviteType = "code" | "link" | "in_app";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type ReplayPolicy = "live_only" | "allow_replay";

export type CompletionType = "completed_live" | "completed_replay";

export type VerificationType = "gps" | "timer" | "in_app_entry" | "photo" | "manual" | "manual_with_proof" | "geo_time_checkin";

export type ChallengeCategory = "fitness" | "mind" | "faith" | "discipline" | "mental" | "other";

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "extreme";

export type ChallengeMode = "normal" | "hard";

export type TaskStatus = "locked" | "pending" | "submitted" | "verified" | "rejected" | "missed";

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

export type ChallengeStatus = "active" | "failed" | "completed";

export type CommunityEventType = "joined_challenge" | "secured_day" | "milestone" | "streak" | "challenge_joined";

export interface User {
  id: string;
  username: string;
  avatar: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
  streakCount: number;
  joinedChallenges: string[];
}

export interface ChallengePolicy {
  mode: ChallengeMode;
  cutoffTimeLocal: string;
  allowPause: boolean;
  maxMissesAllowed: number;
  missedDayAction: "streak_reset_only" | "challenge_failed";
  showFailureToPublic: boolean;
  showFailureToAccountabilityCircle: boolean;
}

export interface AllowedLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface LocationPolicy {
  enabled: boolean;
  allowedLocations: AllowedLocation[];
  requireLocationAtStart: boolean;
  requireLocationAtFinish: boolean;
  requireContinuousPresence: boolean;
  maxOutsideRadiusSeconds?: number;
}

export interface TimeWindowPolicy {
  enabled: boolean;
  startTimeLocal: string;
  startWindowMinutes: number;
  endWindowMinutes?: number;
  mustStartWithinWindow: boolean;
  mustFinishWithinWindow: boolean;
  requireExactStart: boolean;
  allowGraceSeconds: number;
}

export interface SessionPolicy {
  enabled: boolean;
  minSessionSeconds: number;
  lockScreenDuringSession: boolean;
  allowBackgroundSeconds: number;
}

export interface TaskRules {
  minDistanceMiles?: number;
  minDurationSeconds?: number;
  allowTreadmill?: boolean;
  requireGpsRoute?: boolean;
  minWords?: number;
  minTypingSeconds?: number;
  allowPaste?: boolean;
  allowBackground?: boolean;
  maxBackgroundSeconds?: number;
  requireCameraCapture?: boolean;
  requireSameDay?: boolean;
  requireTimestampOverlay?: boolean;
  locationPolicy?: LocationPolicy;
  timeWindowPolicy?: TimeWindowPolicy;
  sessionPolicy?: SessionPolicy;
}

export interface TaskTemplate {
  id: string;
  challengeId: string;
  title: string;
  type: TaskType;
  verificationType: VerificationType;
  required: boolean;
  rules: TaskRules;
  requirementText?: string;
  journalConfig?: JournalConfig;
  timeEnforcement?: TimeEnforcementConfig;
}

export interface ReplayRules {
  allowReplay: boolean;
  requireSameRules: boolean;
  allowDifferentDayCompletion: boolean;
  maxReplaysPerUser?: number;
  showAsReplayLabel: boolean;
}

export interface DailyChallengeConfig {
  liveDate: string;
  liveWindowStart?: string;
  liveWindowEnd?: string;
  replayPolicy: ReplayPolicy;
  replayRules?: ReplayRules;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  shortHook?: string;
  coverImageUrl?: string;
  themeColor?: string;
  challengeType: ChallengeType;
  durationDays: number;
  categories: ChallengeCategory[];
  difficulty: ChallengeDifficulty;
  createdBy: "system" | "user";
  creatorId?: string;
  isPublic: boolean;
  visibility: ChallengeVisibility;
  policy: ChallengePolicy;
  tasks: TaskTemplate[];
  participantsCount: number;
  activeTodayCount?: number;
  completionRateStandard?: number;
  completionRateHard?: number;
  hardPickRate?: number;
  dailyConfig?: DailyChallengeConfig;
  hasStrictVerification?: boolean;
  joinVelocity?: number;
  creatorReputation?: number;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  startDate: string;
  status: ChallengeStatus;
  currentDayIndex: number;
  streakCount: number;
  lastSecuredDate: string | null;
  createdAt: string;
  completionType?: CompletionType;
  isReplayAttempt?: boolean;
}

export interface ReplayInstance {
  id: string;
  originalChallengeId: string;
  userId: string;
  attemptDate: string;
  verificationRulesSnapshot: TaskRules;
  status: "in_progress" | "completed" | "failed";
  completedAt?: string;
}

export interface DailyRun {
  id: string;
  userChallengeId: string;
  dateLocal: string;
  isDaySecured: boolean;
  securedAt: string | null;
  todayStartedAt: string | null;
  createdAt: string;
}

export type RunMode = "outdoor_gps" | "treadmill_proof";

export interface GeoTimeCheckinVerificationData {
  type: "geo_time_checkin";
  locationMatched?: {
    locationId: string;
    name: string;
    radiusMeters: number;
  };
  start?: {
    startedAtLocal: string;
    lat: number;
    lng: number;
    accuracyMeters: number;
    insideGeofence: boolean;
    timeWindowOpen: boolean;
  };
  end?: {
    endedAtLocal: string;
    lat: number;
    lng: number;
    accuracyMeters: number;
    insideGeofence: boolean;
  };
  session?: {
    elapsedSeconds: number;
    backgroundSeconds: number;
    continuousPresenceEnabled: boolean;
    outsideRadiusSeconds: number;
  };
  antiCheat?: {
    mockLocationDetected: boolean;
    accuracyTooLow: boolean;
  };
}

export interface VerificationData {
  gpsPoints?: { lat: number; lng: number }[];
  distanceMiles?: number;
  durationSeconds?: number;
  startedAt?: string;
  endedAt?: string;
  text?: string;
  wordCount?: number;
  typingSeconds?: number;
  pasteDetected?: boolean;
  submittedAt?: string;
  backgroundSeconds?: number;
  photoUrl?: string;
  capturedAt?: string;
  uploadedAt?: string;
  photoDateLocal?: string;
  runMode?: RunMode;
  timerActiveSeconds?: number;
  timerBackgroundViolation?: boolean;
  proofUrl?: string;
  proofType?: "photo" | "video";
  proofSource?: "camera" | "gallery";
  proofCapturedAt?: string;
  proofDateLocal?: string;
  distanceMilesShown?: number;
  durationShown?: string;
  geoTimeCheckin?: GeoTimeCheckinVerificationData;
}

export interface TaskState {
  id: string;
  dailyRunId: string;
  taskTemplateId: string;
  status: TaskStatus;
  verificationData: VerificationData | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  failureReason: string | null;
}

export interface CommunityEvent {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  type: CommunityEventType;
  metadata: {
    challengeId?: string;
    challengeName?: string;
    day?: number;
    streak?: number;
  };
  createdAt: string;
}

export interface Medal {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  type: "respect" | "follow" | "streak_milestone" | "day_secured" | "challenge_joined" | "encourage";
  actorId: string;
  actorUsername: string;
  actorAvatar: string;
  targetId?: string;
  metadata?: {
    challengeName?: string;
    day?: number;
    streak?: number;
  };
  createdAt: string;
  read: boolean;
}

export interface SuggestedUser {
  id: string;
  username: string;
  avatarUrl: string;
  contextLine: string;
  streak?: number;
  isFollowing: boolean;
  dayNumber?: number;
  riskLevel?: "safe" | "warning" | "danger";
}

export interface ProofSummary {
  runMiles?: number;
  journalWords?: number;
  journalMinutes?: number;
  gpsVerified?: boolean;
  typingVerified?: boolean;
  photoVerified?: boolean;
  timerMinutes?: number;
}

export interface HomeFeedItem {
  id: string;
  type: "day_secured" | "streak_milestone" | "challenge_joined" | "encouragement_insert";
  userId?: string;
  username?: string;
  avatarUrl?: string;
  challengeName?: string;
  day?: number;
  dayNumber?: number;
  streak?: number;
  message?: string;
  createdAt: string;
  respected?: boolean;
  respectCount?: number;
  proofSummary?: ProofSummary;
  lockedIn?: boolean;
  withYou?: boolean;
}

export interface Highlight {
  id: string;
  message: string;
  type: "respect" | "streak" | "milestone" | "followers";
}

export interface Post {
  id: string;
  userId: string;
  challengeId: string;
  dayNumber: number;
  text: string;
  createdAt: string;
  respectCount: number;
  discussCount: number;
  respectedBy: string[];
  user?: User;
  challenge?: Challenge;
}

export interface Notification {
  id: string;
  userId: string;
  type: "respect" | "follow" | "completion" | "encourage";
  fromUserId: string;
  postId?: string;
  text: string;
  createdAt: string;
  read: boolean;
  fromUser?: User;
}

export type ChatMessageType = "text" | "proof" | "checkin" | "system";

export interface ChallengeRoom {
  challengeId: string;
  roomId: string;
  name: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  challengeId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  type: ChatMessageType;
  text?: string;
  mediaUrl?: string;
  taskId?: string;
  dayIndex?: number;
  createdAt: string;
  reactions: Record<string, number>;
  replyToMessageId?: string;
  isDeleted: boolean;
}

export interface MemberPresence {
  userId: string;
  roomId: string;
  lastSeenAt: string;
  isTyping: boolean;
}

export interface ChatRoomSettings {
  muteRoom: boolean;
  mentionsOnly: boolean;
}

/** Placeholder for backend: when subscription is integrated, profile can include these. */
export type PremiumStatus = "free" | "premium" | "trial";
export interface ProfilePremiumFields {
  premiumStatus?: PremiumStatus;
  premiumExpiresAt?: string | null; // ISO date
  premiumPlatform?: "ios" | "android" | "web" | null; // where they subscribed
}

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
}

export interface TeamMemberForListApi {
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

export interface Team {
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

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  joined_at: string;
  display_name?: string;
  avatar_url?: string;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  invited_by: string;
  invited_user_id?: string;
  invite_type: InviteType;
  status: InviteStatus;
  created_at: string;
  expires_at: string;
}

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
  activeStreak?: number;
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

/** Leaderboard/activity entry from API for mapping. */
export interface LeaderboardEntryFromApi {
  userId?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  rank?: number;
  value?: number;
  unit?: string;
  currentStreak?: number;
  securedDaysThisWeek?: number;
  respectCount?: number;
}
