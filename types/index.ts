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

export type ChallengeType = "standard" | "one_day";

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
