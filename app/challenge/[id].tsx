import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Share,
  RefreshControl,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  Flame,
  Target,
  Zap,
  Timer,
  Camera,
  Pencil,
  CircleCheck,
  AlertTriangle,
  Shield,
  Clock,
  Users,
  Lock,
  MapPin,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { parseTimeString, scheduleTaskReminder } from "@/lib/notifications";
import { formatTimeHHMM, getTimeWindowState } from "@/lib/time-enforcement";
import { formatTimeRemainingHMS, isChallengeExpired } from "@/lib/challenge-timer";
import * as Haptics from "expo-haptics";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";
import { canJoinChallenge } from "@/lib/premium";
import { FLAGS } from "@/lib/feature-flags";
import { useAuthGate } from "@/contexts/AuthGateContext";
import { type TeamMemberForList } from "@/components/challenge/TeamMemberList";
import SharedGoalProgress from "@/components/challenge/SharedGoalProgress";
import { track, trackEvent } from "@/lib/analytics";
import { useLeaveChallenge } from "@/lib/mutations";
import { formatTRPCError } from "@/lib/api";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";
import { setPendingChallengeId } from "@/lib/onboarding-pending";
import type {
  ChallengeTaskFromApi,
  ChallengeDetailFromApi,
  ActiveChallengeFromApi,
  CheckinFromApi,
} from "@/types";
import {
  DS_COLORS,
  DS_SPACING,
  DS_SHADOWS,
  GRIIT_COLORS,
  getCategoryColors,
} from "@/lib/design-system";
import JoinCelebrationModal from "@/components/challenges/JoinCelebrationModal";
import { TimeWindowPrompt } from "@/components/TimeWindowPrompt";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { SkeletonChallengeDetail } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";
import { ChallengeHero } from "@/components/challenge/ChallengeHero";
import { ChallengeStats } from "@/components/challenge/ChallengeStats";
import { ChallengeLeaderboard } from "@/components/challenge/ChallengeLeaderboard";
import { ChallengeTodayGoals } from "@/components/challenge/ChallengeTodayGoals";
import { shareChallenge } from "@/lib/share";

/** GRIIT spec: orange theme (Extreme/Hard), green theme (Medium/Easy). */
interface DifficultyTheme {
  headerBg: string;
  headerGradientEnd: string;
  accent: string;
  accentLight: string;
  accentSoft: string;
  ctaBg: string;
  ctaText: string;
  backArrowColor: string;
  chipBorder: string;
  progressBg: string;
  progressFill: string;
  missionIconBg: string;
  warningBg: string;
  warningText: string;
  warningBorder: string;
}

const DIFFICULTY_THEMES: Record<string, DifficultyTheme> = {
  easy: {
    headerBg: DS_COLORS.difficultyEasyHeader,
    headerGradientEnd: DS_COLORS.difficultyEasyHeader,
    accent: DS_COLORS.success,
    accentLight: DS_COLORS.successSoft,
    accentSoft: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_12,
    ctaBg: DS_COLORS.success,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.white,
    chipBorder: DS_COLORS.DISCOVER_HERO_AVATAR_RING,
    progressBg: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_12,
    progressFill: DS_COLORS.success,
    missionIconBg: DS_COLORS.successSoft,
    warningBg: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_6,
    warningText: DS_COLORS.success,
    warningBorder: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_15,
  },
  medium: {
    headerBg: DS_COLORS.difficultyEasyHeader,
    headerGradientEnd: DS_COLORS.difficultyEasyHeader,
    accent: DS_COLORS.success,
    accentLight: DS_COLORS.successSoft,
    accentSoft: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_12,
    ctaBg: DS_COLORS.success,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.white,
    chipBorder: DS_COLORS.DISCOVER_HERO_AVATAR_RING,
    progressBg: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_12,
    progressFill: DS_COLORS.success,
    missionIconBg: DS_COLORS.successSoft,
    warningBg: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_6,
    warningText: DS_COLORS.success,
    warningBorder: DS_COLORS.CHALLENGE_HEADER_GREEN_SOFT_15,
  },
  hard: {
    headerBg: DS_COLORS.challengeHeaderDark,
    headerGradientEnd: DS_COLORS.challengeHeaderDark,
    accent: DS_COLORS.accent,
    accentLight: DS_COLORS.accentSoft,
    accentSoft: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_14,
    ctaBg: DS_COLORS.accent,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.accent,
    chipBorder: DS_COLORS.DISCOVER_HERO_AVATAR_RING,
    progressBg: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_15,
    progressFill: DS_COLORS.accent,
    missionIconBg: DS_COLORS.accentSoft,
    warningBg: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_8,
    warningText: DS_COLORS.accent,
    warningBorder: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_20,
  },
  extreme: {
    headerBg: DS_COLORS.challengeHeaderDark,
    headerGradientEnd: DS_COLORS.challengeHeaderDark,
    accent: DS_COLORS.accent,
    accentLight: DS_COLORS.accentSoft,
    accentSoft: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_14,
    ctaBg: DS_COLORS.accent,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.accent,
    chipBorder: DS_COLORS.DISCOVER_HERO_AVATAR_RING,
    progressBg: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_15,
    progressFill: DS_COLORS.accent,
    missionIconBg: DS_COLORS.accentSoft,
    warningBg: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_8,
    warningText: DS_COLORS.accent,
    warningBorder: DS_COLORS.CHALLENGE_HEADER_ORANGE_SOFT_20,
  },
};

function getTheme(difficulty: string): DifficultyTheme {
  return (DIFFICULTY_THEMES[difficulty] ?? DIFFICULTY_THEMES.medium) as DifficultyTheme;
}

const TASK_ICONS: Record<string, React.ElementType> = {
  run: Flame,
  timer: Timer,
  journal: Pencil,
  photo: Camera,
  checkin: CircleCheck,
  checklist: Target,
  custom: Zap,
};


function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function estimateDailyMinutesFromTasks(tasks: ChallengeTaskFromApi[]): number {
  let total = 0;
  for (const t of tasks) {
    const dm = typeof t.duration_minutes === "number" ? t.duration_minutes : null;
    if (dm != null && dm > 0) total += dm;
    else if (t.type === "timer") total += 15;
    else if (t.type === "run") total += 12;
    else total += 5;
  }
  return Math.max(5, Math.round(total));
}

function formatChallengeMetaLabel(raw: string | null | undefined): string {
  if (!raw || !String(raw).trim()) return "—";
  return String(raw)
    .replace(/_/g, " ")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getCountdown(endsAt: string | null): { text: string; expired: boolean } {
  if (!endsAt) return { text: "", expired: false };
  const expired = isChallengeExpired(endsAt);
  return { text: expired ? "Expired" : formatTimeRemainingHMS(endsAt), expired };
}

function CountdownTimer({ endsAt, theme }: { endsAt: string; theme: DifficultyTheme }) {
  const [countdown, setCountdown] = useState(() => getCountdown(endsAt));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  if (countdown.expired) return null;

  return (
    <View style={[s.countdownCard, { borderColor: DS_COLORS.border }]}>
      <View style={s.countdownLeft}>
        <Animated.View style={[s.liveDot, { backgroundColor: DS_COLORS.success, opacity: pulseAnim }]} />
        <Text style={s.countdownLabel}>Ends in</Text>
      </View>
      <Text style={[s.countdownValue, { color: theme.accent }]}>{countdown.text}</Text>
    </View>
  );
}

function RequirementChips({
  task,
}: {
  task: ChallengeTaskFromApi & { min_duration_minutes?: number | null; require_photo?: boolean };
}) {
  const reqPhoto = task.require_photo === true || task.require_photo_proof === true;
  const dur =
    (typeof task.min_duration_minutes === "number" && task.min_duration_minutes > 0
      ? task.min_duration_minutes
      : null) ??
    (typeof task.duration_minutes === "number" && task.duration_minutes > 0 ? task.duration_minutes : null);
  const loc = task.require_location === true;
  const words = typeof task.min_words === "number" && task.min_words > 0 ? task.min_words : null;
  if (!reqPhoto && dur == null && !loc && words == null) return null;
  return (
    <View style={s.reqChipRow}>
      {reqPhoto ? (
        <View style={s.reqChip}>
          <Camera size={10} color={DS_COLORS.TEXT_MUTED} />
          <Text style={s.reqChipText}>Photo</Text>
        </View>
      ) : null}
      {dur != null ? (
        <View style={s.reqChip}>
          <Clock size={10} color={DS_COLORS.TEXT_MUTED} />
          <Text style={s.reqChipText}>{dur} min</Text>
        </View>
      ) : null}
      {loc ? (
        <View style={s.reqChip}>
          <MapPin size={10} color={DS_COLORS.TEXT_MUTED} />
          <Text style={s.reqChipText} numberOfLines={1}>
            {(task.location_name as string | undefined)?.trim() || "Location"}
          </Text>
        </View>
      ) : null}
      {words != null ? (
        <View style={s.reqChip}>
          <Text style={s.reqChipText}>{words}+ words</Text>
        </View>
      ) : null}
    </View>
  );
}

function MissionRow({
  task,
  theme,
  isCompleted,
  isLast,
  onStart,
  checkin,
  verificationMethod,
  stravaConnected,
  activeChallengeId,
  stravaVerifyPending,
  onConnectStrava,
  onVerifyStrava,
  isPro = true,
}: {
  task: ChallengeTaskFromApi & { journalPrompt?: string; journalTypes?: string[]; captureMood?: boolean; captureEnergy?: boolean; captureBodyState?: boolean; wordLimitEnabled?: boolean; wordLimitWords?: number | null; timeEnforcementEnabled?: boolean; anchorTimeLocal?: string; verification_method?: string | null; require_location?: boolean; require_heart_rate?: boolean };
  theme: DifficultyTheme;
  isCompleted: boolean;
  isLast: boolean;
  onStart: () => void;
  checkin?: CheckinFromApi | null;
  verificationMethod?: string | null;
  stravaConnected?: boolean | null;
  activeChallengeId?: string;
  stravaVerifyPending?: boolean;
  onConnectStrava?: () => void;
  onVerifyStrava?: () => Promise<void>;
  isPro?: boolean;
}) {
  const isLockedProFeature = !isPro && (task.require_location === true || task.require_heart_rate === true);
  const IconComp = TASK_ICONS[task.type] || Target;
  const isJournal = task.type === "journal";
  const hasTimeEnforcement = task.timeEnforcementEnabled && task.anchorTimeLocal;
  const needsStrava = verificationMethod === "strava_activity";
  const verifiedByStrava = isCompleted && checkin?.proof_source === "strava";

  const timeState = hasTimeEnforcement ? getTimeWindowState({
    timeEnforcementEnabled: true,
    scheduleType: "DAILY",
    anchorTimeLocal: task.anchorTimeLocal!,
    durationMinutes: null,
    windowMode: "WINDOW",
    windowStartOffsetMin: Number((task as { windowStartOffsetMin?: number | null }).windowStartOffsetMin ?? 0),
    windowEndOffsetMin: Number((task as { windowEndOffsetMin?: number | null }).windowEndOffsetMin ?? 60),
    hardWindowStartOffsetMin: null,
    hardWindowEndOffsetMin: null,
    timezoneMode: "USER_LOCAL",
    challengeTimezone: null,
  }) : null;

  const iconBg = isCompleted
    ? DS_COLORS.successSoft
    : isJournal
    ? DS_COLORS.accentSoft
    : task.type === "run"
    ? DS_COLORS.accentSoft
    : theme.missionIconBg;
  const iconColor = isCompleted
    ? DS_COLORS.success
    : isJournal
    ? DS_COLORS.DISCOVER_CORAL
    : task.type === "run"
    ? DS_COLORS.DISCOVER_CORAL
    : theme.accent;
  return (
    <View
      style={[s.missionRow, !isLast && s.missionRowBorder]}
      accessibilityRole="none"
    >
      <View style={[s.missionIcon, { backgroundColor: iconBg }]}>
        {isCompleted ? (
          <Check size={16} color={DS_COLORS.success} />
        ) : (
          <IconComp size={16} color={iconColor} />
        )}
      </View>
      <View style={s.missionContent}>
        <View style={s.missionTitleRow}>
          <Text style={[s.missionTitle, isCompleted && s.missionTitleDone]}>{task.title}</Text>
          {isLockedProFeature && (
            <View style={s.proBadge}>
              <Text style={s.proBadgeText}>PRO</Text>
            </View>
          )}
          {isJournal && (
            <View style={s.journalPill}>
              <Text style={s.journalPillText}>Journal</Text>
            </View>
          )}
          {hasTimeEnforcement && (
            <View style={s.timePill}>
              <Clock size={9} color={DS_COLORS.linkBlue} />
              <Text style={s.timePillText}>{formatTimeHHMM(task.anchorTimeLocal!)}</Text>
            </View>
          )}
        </View>
        {hasTimeEnforcement && timeState && !isCompleted ? (
          <Text style={[
            s.missionMeta,
            timeState.status === "active" && s.missionMetaActive,
            timeState.status === "missed" && s.missionMetaMissed,
          ]}>
            {timeState.status === "before"
              ? `Opens in ${timeState.formattedTimeLeft}`
              : timeState.status === "active"
              ? `Active \u00B7 ${timeState.formattedTimeLeft} left`
              : "Missed \u00B7 window closed"}
          </Text>
        ) : isJournal && task.journalPrompt ? (
          <Text style={s.missionMeta} numberOfLines={1}>
            {task.journalPrompt}
          </Text>
        ) : needsStrava && !isCompleted ? (
          <Text style={s.missionMeta}>
            {stravaConnected === false
              ? "Connect Strava to verify this task"
              : stravaConnected === true
              ? "No matching Strava activity found yet"
              : null}
          </Text>
        ) : (task.verification || task.estimate) ? (
          <Text style={s.missionMeta}>
            {[task.verification, task.estimate].filter(Boolean).join(" \u00B7 ")}
          </Text>
        ) : null}
        <RequirementChips task={task} />
      </View>
      {isCompleted ? (
        <View style={s.completedBadge}>
          <Check size={12} color={DS_COLORS.success} />
          <Text style={s.completedBadgeText}>{verifiedByStrava ? "Verified by Strava" : "Done"}</Text>
        </View>
      ) : needsStrava && stravaConnected === false && onConnectStrava ? (
        <TouchableOpacity
          style={s.startAction}
          onPress={onConnectStrava}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Connect Strava"
        >
          <Text style={[s.startActionText, { color: theme.accent }]}>Connect Strava</Text>
          <ChevronRight size={14} color={theme.accent} />
        </TouchableOpacity>
      ) : needsStrava && stravaConnected === true && activeChallengeId && onVerifyStrava ? (
        <TouchableOpacity
          style={s.startAction}
          onPress={onVerifyStrava}
          disabled={stravaVerifyPending}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Verify with Strava"
          accessibilityState={{ disabled: stravaVerifyPending }}
        >
          {stravaVerifyPending ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <>
              <Text style={[s.startActionText, { color: theme.accent }]}>Verify with Strava</Text>
              <ChevronRight size={14} color={theme.accent} />
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={s.startAction}
          onPress={onStart}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`${task.title ?? "Task"} — not completed — tap to start`}
          accessibilityRole="button"
        >
          <Text style={[s.startActionText, { color: isJournal ? DS_COLORS.journalStartBlue : theme.accent }]}>Start</Text>
          <ChevronRight size={14} color={isJournal ? DS_COLORS.journalStartBlue : theme.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ChallengeDetailScreen() {
  const rawParams = useLocalSearchParams();
  const params = (rawParams ?? {}) as Record<string, string | string[] | undefined>;
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id?.[0] : undefined;
  const p = params as { id?: string; ref?: string; openJoin?: string | boolean };
  const ref = typeof p.ref === "string" ? p.ref : Array.isArray(p.ref) ? p.ref[0] : undefined;
  const router = useRouter();
  const { user } = useAuth();
  const { showGate } = useAuthGate();
  const { activeChallenge, todayCheckins, refetchTodayCheckins, refetchAll } = useApp();
  const { isPro } = useProStatus();
  const myActiveListQuery = useQuery({
    queryKey: ["challenge", "listMyActive", id],
    queryFn: () => trpcQuery(TRPC.challenges.listMyActive) as Promise<unknown[]>,
    enabled: !!user && !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const isJoined = useMemo(() => {
    if (id && activeChallenge?.challenge_id === id) return true;
    const list = myActiveListQuery.data;
    if (!id || !Array.isArray(list)) return false;
    return list.some((r) => (r as { challenge_id?: string }).challenge_id === id);
  }, [activeChallenge?.challenge_id, id, myActiveListQuery.data]);

  /** Active row for *this* challenge detail screen (not the global first active from AppContext). */
  const activeChallengeId = useMemo(() => {
    if (id && activeChallenge?.challenge_id === id) return activeChallenge.id;
    const list = myActiveListQuery.data;
    if (!id || !Array.isArray(list)) return undefined;
    const match = list.find((r) => (r as { challenge_id?: string }).challenge_id === id) as { id?: string } | undefined;
    return match?.id;
  }, [id, activeChallenge?.challenge_id, activeChallenge?.id, myActiveListQuery.data]);

  const currentUserId = user?.id ?? undefined;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

  const queryClient = useQueryClient();
  const challengeQuery = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery(TRPC.challenges.getById, { id: id! }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  const remoteChallenge = (challengeQuery.data as Record<string, unknown> | undefined) ?? null;
  const remoteLoading = challengeQuery.isLoading;
  const remoteLoadError = challengeQuery.isError;
  const [joinPending] = useState(false);
  const leaveMutation = useLeaveChallenge();
  const leavePending = leaveMutation.isPending;
  const [stravaConnected, setStravaConnected] = useState<boolean | null>(null);
  const [stravaVerifyPending, setStravaVerifyPending] = useState<string | null>(null);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showJoinCelebration, setShowJoinCelebration] = useState(false);
  const [showTimePrompt, setShowTimePrompt] = useState(false);
  const [promptTasks, setPromptTasks] = useState<Array<{ id: string; name: string }>>([]);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [commitmentJoining, setCommitmentJoining] = useState<boolean>(false);
  const [commitmentUnderstood, setCommitmentUnderstood] = useState(false);
  const insets = useSafeAreaInsets();
  const { error, showError, clearError } = useInlineError();
  const referrerLabel = ref ? "Invited by a friend" : null;

  const sourceParam =
    typeof params.source === "string"
      ? params.source
      : Array.isArray(params.source)
        ? params.source[0]
        : undefined;

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const source: "discover" | "home" | "deeplink" =
        sourceParam === "home" || sourceParam === "discover" || sourceParam === "deeplink"
          ? sourceParam
          : ref
            ? "deeplink"
            : "discover";
      trackEvent("challenge_viewed", { challenge_id: id, source });
    }, [id, ref, sourceParam])
  );

  useEffect(() => {
    if (!ref || !currentUserId || !id) return;
    trpcMutate(TRPC.referrals.recordOpen, { referrerUserId: ref, challengeId: id }).catch((e) => {
      captureError(e, "ChallengeDetailRecordOpen");
    });
  }, [ref, currentUserId, id]);

  const challenge = useMemo(() => {
    if (remoteChallenge) {
      const d = remoteChallenge as Record<string, unknown>;
      const tasksRaw = (d.tasks ?? d.challenge_tasks) as unknown[] | undefined;
      return {
        ...d,
        tasks: Array.isArray(tasksRaw) ? tasksRaw : [],
        is_daily: (d.is_daily as boolean | undefined) ?? d.duration_type === "24h",
        ends_at: (d.ends_at as string | null) ?? null,
        category: (d.category as string) ?? "default",
        about: (d.about as string) ?? (d.description as string) ?? "",
        active_today_count: (d.active_today_count as number) ?? 0,
        hard_pick_rate: (d.hard_pick_rate as number | null) ?? null,
        hard_finish_rate: (d.hard_finish_rate as number | null) ?? null,
        completion_rate: (d.completion_rate as number | null) ?? null,
        rules: (d.rules as unknown[]) ?? [],
        fail_condition: (d.fail_condition as string | null) ?? null,
        visibility: (d.visibility as string) ?? "public",
      } as unknown as ChallengeDetailFromApi;
    }
    return null;
  }, [remoteChallenge]);

  const ch = challenge as ChallengeDetailFromApi | null | undefined;
  const participationType = ch?.participation_type ?? "solo";
  const runStatus = ch?.run_status;
  const teamMembers: TeamMemberForList[] = (ch?.teamMembers ?? []) as TeamMemberForList[];
  const isTeamChallenge = participationType === "team";
  const isSharedGoal = participationType === "shared_goal";
  const sharedGoalTotal = ch?.sharedGoalTotal ?? 0;
  const sharedGoalTarget = ch?.shared_goal_target ?? 0;
  const sharedGoalUnit = ch?.shared_goal_unit ?? "units";
  const deadlineType = ch?.deadline_type ?? undefined;
  const deadlineDate = ch?.deadline_date ?? undefined;

  const [sharedContributions, setSharedContributions] = useState<{ user_id: string; display_name: string; total: number; percent: number }[]>([]);
  const [sharedRecentLogs, setSharedRecentLogs] = useState<{ id: string; user_id: string; amount: number; unit: string; note: string | null; logged_at: string; display_name: string }[]>([]);
  const [sharedLogsLoading, setSharedLogsLoading] = useState(false);

  const isTeamOrSharedMember = teamMembers.some((m) => m.user_id === currentUserId);

  const fetchSharedGoalData = useCallback(async () => {
    if (!id || !isSharedGoal || !isTeamOrSharedMember) return;
    setSharedLogsLoading(true);
    try {
      const [contrib, logs] = await Promise.all([
        trpcQuery(TRPC.sharedGoal.getContributions, { challengeId: id }) as Promise<{ user_id: string; display_name: string; total: number; percent: number }[]>,
        trpcQuery(TRPC.sharedGoal.getRecentLogs, { challengeId: id, limit: 20 }) as Promise<{ id: string; user_id: string; amount: number; unit: string; note: string | null; logged_at: string; display_name: string }[]>,
      ]);
      setSharedContributions(Array.isArray(contrib) ? contrib : []);
      setSharedRecentLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      captureError(error, "ChallengeDetailFetchSharedGoalData");
      setSharedContributions([]);
      setSharedRecentLogs([]);
    } finally {
      setSharedLogsLoading(false);
    }
  }, [id, isSharedGoal, isTeamOrSharedMember]);

  useEffect(() => {
    if (isSharedGoal && isTeamOrSharedMember && id) fetchSharedGoalData();
  }, [isSharedGoal, isTeamOrSharedMember, id, fetchSharedGoalData]);

  useFocusEffect(
    useCallback(() => {
      if (isSharedGoal && isTeamOrSharedMember && id) fetchSharedGoalData();
    }, [isSharedGoal, isTeamOrSharedMember, id, fetchSharedGoalData])
  );

  const isDaily = challenge?.is_daily ?? false;
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!isDaily || !challenge?.ends_at) return;
    const check = () => {
      setExpired(isChallengeExpired(challenge.ends_at));
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [isDaily, challenge?.ends_at]);

  const waitingForMembership =
    !!challenge &&
    !!user &&
    !!id &&
    activeChallenge?.challenge_id !== id &&
    !myActiveListQuery.isFetched;

  const isLoading = remoteLoading || waitingForMembership;

  useEffect(() => {
    if (isLoading) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [isLoading, fadeAnim]);

  const userCurrentDay = useMemo(() => {
    if (!isJoined) return 0;
    const ac = activeChallenge as ActiveChallengeFromApi | null;
    return ac?.current_day ?? ac?.current_day_index ?? 1;
  }, [isJoined, activeChallenge]);

  const userStreak = useMemo(() => {
    if (!isJoined) return 0;
    return Math.max(userCurrentDay, 1);
  }, [isJoined, userCurrentDay]);

  const handleJoin = useCallback(() => {
    if (!challenge || !id) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCommitmentUnderstood(false);
    setShowCommitmentModal(true);
  }, [challenge, id]);

  const handleCommitmentConfirm = useCallback(async () => {
    if (!id || commitmentJoining) return;
    const count = Array.isArray(myActiveListQuery.data) ? myActiveListQuery.data.length : 0;
    const joinGate = canJoinChallenge(count);
    if (!joinGate.allowed) {
      router.push(ROUTES.PAYWALL as never);
      return;
    }
    setCommitmentJoining(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await trpcMutate(TRPC.challenges.join, { challengeId: id });

      void trpcMutate(TRPC.referrals.markJoinedChallenge, { challengeId: id }).catch((refErr: unknown) => {
        captureError(refErr, "ChallengeDetailMarkJoinedChallenge");
      });

      setShowCommitmentModal(false);
      setShowJoinCelebration(true);
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_JOINED_CHALLENGE, "true");
      trackEvent("challenge_joined", { challenge_id: id });
      track({ name: "challenge_joined", challenge_id: id });

      void refetchAll().catch((e: unknown) => {
        captureError(e, "ChallengeDetailRefetchAfterJoin");
      });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      void queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      void myActiveListQuery.refetch();
    } catch (err: unknown) {
      captureError(err, { flow: "challenge_join", challengeId: id });
      const msg = err instanceof Error ? err.message : "";
      const code = (err as { data?: { code?: string } })?.data?.code;
      if (code === "FORBIDDEN" || msg.toLowerCase().includes("up to 3 challenges")) {
        showError("Free accounts can have up to 3 active challenges. Upgrade to Premium for unlimited challenges.");
        router.push(ROUTES.PAYWALL as never);
        return;
      }
      const { title, message } = formatTRPCError(err);
      showError(typeof message === "string" && message.trim() ? `${title}: ${message}` : title);
    } finally {
      setCommitmentJoining(false);
    }
  }, [id, commitmentJoining, user?.id, refetchAll, router, queryClient, myActiveListQuery, showError]);

  const finishJoinAfterTimeWindow = useCallback(() => {
    setShowTimePrompt(false);
    queryClient.removeQueries({ queryKey: ["home"] });
    router.replace(ROUTES.TABS_HOME as never);
  }, [router, queryClient]);

  const onJoinCelebrationDismiss = useCallback(() => {
    setShowJoinCelebration(false);
    const raw = (challenge?.tasks ?? []) as ChallengeTaskFromApi[];
    setPromptTasks(
      raw.map((t, i) => ({
        id: String(t.id ?? `task-${i}`),
        name: String((t as { title?: string }).title ?? t.type ?? "Task"),
      }))
    );
    setShowTimePrompt(true);
  }, [challenge?.tasks]);

  const onTimeWindowComplete = useCallback(() => {
    finishJoinAfterTimeWindow();
  }, [finishJoinAfterTimeWindow]);

  const handleCtaPressIn = useCallback(() => {
    Animated.spring(ctaScaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [ctaScaleAnim]);

  const handleCtaPressOut = useCallback(() => {
    Animated.spring(ctaScaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [ctaScaleAnim]);

  const handleMissionStart = useCallback((task: ChallengeTaskFromApi) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const apiTask = task as ChallengeTaskFromApi & {
      require_photo?: boolean;
      timer_direction?: string;
      timer_hard_mode?: boolean;
      require_heart_rate?: boolean;
      heart_rate_threshold?: number;
      require_location?: boolean;
      location_name?: string;
      location_latitude?: number;
      location_longitude?: number;
      location_radius_meters?: number;
      min_duration_minutes?: number;
    };
    const needsPhotoProof = apiTask.require_photo_proof === true || apiTask.require_photo === true;

    if (task.type === "checkin") {
      if (!FLAGS.LOCATION_CHECKIN_ENABLED) {
        showError("Location check-in verification is not available yet. Use another task type for now.");
        return;
      }
      router.push({ pathname: ROUTES.TASK_CHECKIN, params: { taskId: task.id } } as never);
      return;
    }
    if (task.type === "run") {
      const runTask = task as ChallengeTaskFromApi & { tracking_mode?: string | null; config?: Record<string, unknown> };
      const runCfg =
        typeof runTask.config === "object" && runTask.config !== null ? runTask.config : {};
      const useUnifiedComplete =
        runCfg.hard_mode === true ||
        runTask.tracking_mode === "time" ||
        runTask.verification_method === "heart_rate" ||
        runTask.require_location === true ||
        runTask.strict_timer_mode === true ||
        (runTask as { timer_hard_mode?: boolean }).timer_hard_mode === true ||
        runTask.require_photo_proof === true ||
        (runTask as { require_photo?: boolean }).require_photo === true;
      if (!useUnifiedComplete) {
        router.push({ pathname: ROUTES.TASK_RUN, params: { taskId: task.id } } as never);
        return;
      }
    }

    // Unified completion screen for manual, simple, journal, timer, photo (with optional advanced verification)
    const rawTask = task as Record<string, unknown>;
    const cfg =
      typeof rawTask.config === "object" && rawTask.config !== null
        ? (rawTask.config as Record<string, unknown>)
        : {};
    const requireLoc = apiTask.require_location === true || cfg.require_location === true;
    const taskConfig = {
      require_photo: needsPhotoProof || apiTask.require_photo === true,
      min_duration_minutes: apiTask.min_duration_minutes ?? apiTask.duration_minutes ?? undefined,
      min_words: apiTask.min_words ?? undefined,
      timer_direction: (apiTask.timer_direction === "countup" ? "countup" : "countdown") as "countdown" | "countup",
      timer_hard_mode: apiTask.timer_hard_mode === true || apiTask.strict_timer_mode === true,
      require_heart_rate: apiTask.require_heart_rate === true,
      heart_rate_threshold: apiTask.heart_rate_threshold ?? 100,
      require_location: requireLoc,
      location_name: (apiTask.location_name ?? cfg.location_name) as string | undefined,
      location_latitude: (apiTask.location_latitude ?? cfg.location_latitude) as number | undefined,
      location_longitude: (apiTask.location_longitude ?? cfg.location_longitude) as number | undefined,
      location_radius_meters: (apiTask.location_radius_meters ?? cfg.location_radius_meters ?? 200) as number,
      hard_mode: cfg.hard_mode === true,
      schedule_window_start: typeof cfg.schedule_window_start === "string" ? cfg.schedule_window_start : undefined,
      schedule_window_end: typeof cfg.schedule_window_end === "string" ? cfg.schedule_window_end : undefined,
      schedule_timezone: typeof cfg.schedule_timezone === "string" ? cfg.schedule_timezone : undefined,
      require_camera_only: cfg.require_camera_only === true,
      require_strava: cfg.require_strava === true,
      journal_prompt: typeof cfg.journal_prompt === "string" ? cfg.journal_prompt : undefined,
    };
    router.push({
      pathname: ROUTES.TASK_COMPLETE,
      params: {
        taskId: task.id,
        activeChallengeId: activeChallengeId ?? "",
        taskType: task.type,
        taskName: task.title ?? "",
        taskDescription: (task as { description?: string }).description ?? "",
        taskConfig: JSON.stringify(taskConfig),
      },
    } as never);
  }, [router, activeChallengeId, showError]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `I'm taking on the ${challenge?.title ?? "this"} challenge on GRIIT! ${challenge?.description ?? challenge?.about ?? ""}`,
        ...(Platform.OS === "ios" ? { url: "" } : {}),
      });
    } catch (error) {
      const message = (error as Error)?.message ?? "";
      if (message !== "User did not share") {
        captureError(error, "ChallengeDetailShare");
        showError("Couldn't open share options right now. Please try again.");
      }
    }
  }, [challenge?.title, challenge?.description, challenge?.about, showError]);

  const allTasks = (challenge?.tasks ?? []) as ChallengeTaskFromApi[];
  const todayTasksWithCompletion = useMemo(() => {
    return allTasks.map((task) => {
      const isCompleted =
        isJoined &&
        todayCheckins.some((c: CheckinFromApi) => c.task_id === task.id && c.status === "completed");
      return { task, isCompleted };
    });
  }, [allTasks, isJoined, todayCheckins]);

  const firstIncompleteTask = useMemo(
    () => todayTasksWithCompletion.find(({ isCompleted }) => !isCompleted)?.task,
    [todayTasksWithCompletion]
  );

  const isThisActiveChallenge = !!(
    activeChallenge?.challenges?.id && challenge?.id && String(activeChallenge.challenges.id) === String(challenge.id)
  );

  const hasStravaTasks = allTasks.some((t) => (t as { verification_method?: string }).verification_method === "strava_activity");

  useEffect(() => {
    if (!isThisActiveChallenge || !hasStravaTasks) {
      setStravaConnected(null);
      return;
    }
    trpcQuery(TRPC.integrations.getStravaConnection)
      .then((conn: unknown) => setStravaConnected(!!conn))
      .catch((err) => {
        captureError(err, "ChallengeDetailGetStravaConnection");
        setStravaConnected(false);
      });
  }, [isThisActiveChallenge, hasStravaTasks]);

  useFocusEffect(
    useCallback(() => {
      if (isJoined) refetchTodayCheckins();
      if (id && (isTeamChallenge || isSharedGoal)) {
        challengeQuery.refetch();
      }
    }, [id, isJoined, isTeamChallenge, isSharedGoal, refetchTodayCheckins, challengeQuery])
  );

  const onRefresh = useCallback(async () => {
    if (!id) return;
    await challengeQuery.refetch();
    if (isJoined) await refetchTodayCheckins();
  }, [id, isJoined, refetchTodayCheckins, challengeQuery]);

  const handleLeave = useCallback(() => {
    if (!id || leavePending) return;
    setLeaveConfirmVisible(true);
  }, [id, leavePending]);

  const confirmLeaveChallenge = useCallback(async () => {
    if (!id || leavePending) return;
    setLeaveConfirmVisible(false);
    try {
      await leaveMutation.mutateAsync({ challengeId: id });
      trackEvent("challenge_abandoned", { challenge_id: id, day: userCurrentDay });
      await refetchAll();
      await refetchTodayCheckins();
      router.replace(ROUTES.TABS_DISCOVER as never);
    } catch (e: unknown) {
      captureError(e, "ChallengeDetailLeaveChallenge");
      const { title, message } = formatTRPCError(e);
      showError(typeof message === "string" && message.trim() ? `${title}: ${message}` : title);
    }
  }, [id, leavePending, leaveMutation, refetchAll, refetchTodayCheckins, router, showError, userCurrentDay]);

  const difficulty = (challenge?.difficulty || "medium") as string;

  const categoryColors = useMemo(() => getCategoryColors(challenge?.category ?? "discipline"), [challenge?.category]);

  const eyebrowLabel = useMemo(() => {
    if (challenge?.is_featured) return "🏆 FEATURED";
    if (challenge?.duration_type === "24h" || (challenge as { challenge_type?: string })?.challenge_type === "one_day" || isDaily)
      return "⚡ 24-HOUR CHALLENGE";
    if ((challenge?.participants_count ?? 0) > 100)
      return `🔥 ${formatCount(challenge?.participants_count ?? 0)} active today`;
    if (challenge?.difficulty === "extreme") return "💀 EXTREME CHALLENGE";
    return null;
  }, [challenge?.is_featured, challenge?.duration_type, challenge?.participants_count, challenge?.difficulty, isDaily]);

  const difficultyPillStyle = useMemo(() => {
    const defaultPill = { bg: DS_COLORS.DIFFICULTY_MEDIUM_BG, text: DS_COLORS.DIFFICULTY_MEDIUM_TEXT };
    const map: Record<string, { bg: string; text: string }> = {
      easy: { bg: DS_COLORS.GREEN_BG, text: DS_COLORS.ACCENT_GREEN },
      medium: defaultPill,
      hard: { bg: DS_COLORS.ACCENT_TINT, text: DS_COLORS.ACCENT_PRIMARY },
      extreme: { bg: DS_COLORS.DIFFICULTY_EXTREME_BG, text: DS_COLORS.DIFFICULTY_EXTREME_TEXT },
    };
    return map[difficulty] ?? defaultPill;
  }, [difficulty]);

  if (!id) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Not found</Text>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))} style={s.emptyBtn} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.loadingContainer, { backgroundColor: DS_COLORS.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SkeletonChallengeDetail />
      </View>
    );
  }

  if (remoteLoadError) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.emptyWrap, { flex: 1, justifyContent: "center" }]}>
          <ErrorState message="Couldn't load this challenge" onRetry={() => void challengeQuery.refetch()} />
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))} style={[s.emptyBtn, { marginTop: DS_SPACING.lg }]} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Challenge not found</Text>
          <TouchableOpacity onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} style={s.emptyBtn} accessibilityLabel="Browse challenges" accessibilityRole="button">
            <Text style={s.emptyBtnText}>Browse challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))} style={[s.emptyBtn, { marginTop: 12 }]} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = joinPending;
  const theme = getTheme(difficulty);
  const rules = challenge.rules || [];

  const durationLabel = isDaily ? "24 hours" : `${challenge.duration_days} days`;
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const rawParticipantCount = challenge.participants_count ?? 0;
  const participantCount = Math.max(rawParticipantCount, isJoined ? 1 : 0);
  const joinDisabled = isPending || (isDaily && expired);

  const headerGradientColors = [categoryColors.header, categoryColors.header] as const;
  const countdownTheme = isDaily ? { ...theme, accent: DS_COLORS.success } : theme;

  const challengeVisibility = (challenge.visibility || "public") as string;
  const visibilityLabel = challengeVisibility === "friends" ? "Friends" : challengeVisibility === "private" ? "Only me" : null;
  const visibilityIcon = challengeVisibility === "friends"
    ? <Users size={11} color={DS_COLORS.white} />
    : challengeVisibility === "private"
    ? <Lock size={11} color={DS_COLORS.white} />
    : null;

  const participantUsernames = (challenge as { participant_usernames?: string[] }).participant_usernames;
  const joinedToday = Math.max(0, Math.floor(rawParticipantCount * 0.02));

  const aboutDetailRows: { label: string; value: string; valueAccent?: boolean }[] = [
    { label: "Duration", value: durationLabel },
    { label: "Daily Time", value: `~${estimateDailyMinutesFromTasks(allTasks)} min` },
    { label: "Difficulty", value: difficultyLabel },
    { label: "Category", value: formatChallengeMetaLabel(challenge.category) },
    ...(typeof challenge.participants_count === "number"
      ? [
          {
            label: "Participants",
            value: participantCount > 0 ? `${participantCount} people` : "Be the first to join",
            valueAccent: participantCount === 0,
          },
        ]
      : []),
  ];

  return (
    <ErrorBoundary>
    <View style={[s.container, { backgroundColor: GRIIT_COLORS.background }]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={challengeQuery.isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.ctaText}
            />
          }
        >
          <InlineError message={error} onDismiss={clearError} />
          <ChallengeHero
            headerGradientColors={headerGradientColors}
            isDaily={isDaily}
            isJoined={isJoined}
            challenge={challenge}
            durationLabel={durationLabel}
            userStreak={userStreak}
            userCurrentDay={userCurrentDay}
            difficulty={difficulty}
            difficultyLabel={difficultyLabel}
            difficultyPillStyle={difficultyPillStyle}
            visibilityLabel={visibilityLabel}
            visibilityIcon={visibilityIcon}
            eyebrowLabel={eyebrowLabel}
            referrerLabel={referrerLabel}
            subtitleColor={categoryColors.subtitleText}
            onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
            onShare={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              void handleShare();
            }}
            onMore={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              trackEvent("share_tapped", {
                content_type: "challenge",
                challenge_id: id ?? undefined,
              });
              void shareChallenge(
                {
                  name: challenge.title,
                  duration: challenge.duration_days ?? 0,
                  id: id ?? "",
                  tasksPerDay: challenge.tasks?.length,
                },
                currentUserId
              ).catch((e) => {
                captureError(e, "ChallengeDetailShareChallenge");
                showError("Couldn't open share options right now. Please try again.");
              });
            }}
          />

          {/* BODY: warm background, large radius cards, premium spacing */}
          <View style={[s.body, isDaily && { gap: DS_SPACING.sm }]}>
            <View style={[s.socialProofCard, DS_SHADOWS.cardSubtle]}>
              <Text style={s.socialProofTitle}>{participantCount} {participantCount === 1 ? "warrior" : "warriors"}</Text>
              <Text style={s.socialProofSub}>{participantCount === 0 ? "Be the first to join" : `${joinedToday} joined today`}</Text>
            </View>

            {firstIncompleteTask ? (
              <TouchableOpacity
                style={s.todayGoalCard}
                onPress={() => handleMissionStart(firstIncompleteTask)}
                activeOpacity={0.86}
                accessibilityRole="button"
                accessibilityLabel={`${firstIncompleteTask.title ?? "Task"} — not completed — tap to start`}
              >
                {isJoined ? (
                  <Text style={s.dayCounterText}>Day {Math.max(userCurrentDay, 1)} of {challenge.duration_days}</Text>
                ) : null}
                <View style={s.todayGoalRow}>
                  <View style={s.todayGoalCircle}>
                    <View style={s.todayGoalCircleInner} />
                  </View>
                  <View style={s.todayGoalTextWrap}>
                    <Text style={s.todayGoalTitle}>{firstIncompleteTask.title}</Text>
                    <Text style={s.todayGoalSubtitle}>Tap to start and log proof</Text>
                  </View>
                  <View style={s.todayGoalArrowWrap}>
                    <ChevronRight size={18} color={DS_COLORS.DISCOVER_CORAL} />
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}

            {/* Shared-goal logs section remains for contributors */}
            {id && isSharedGoal && isTeamOrSharedMember && (
              <SharedGoalProgress
                target={sharedGoalTarget}
                unit={sharedGoalUnit}
                total={sharedGoalTotal}
                runStatus={runStatus ?? "waiting"}
                deadlineType={deadlineType}
                deadlineDate={deadlineDate}
                contributions={sharedContributions}
                recentLogs={sharedRecentLogs}
                loadingLogs={sharedLogsLoading}
                onLogProgress={async (amount, note) => {
                  if (!id) return;
                  await trpcMutate(TRPC.sharedGoal.logProgress, { challengeId: id, amount, unit: sharedGoalUnit, note: note || undefined });
                  queryClient.invalidateQueries({ queryKey: ["challenge", id] });
                  await fetchSharedGoalData();
                }}
              />
            )}

            {/* Daily Countdown */}
            {isDaily && challenge.ends_at && !expired && (
              <CountdownTimer endsAt={challenge.ends_at} theme={countdownTheme} />
            )}
            {isDaily && expired && (
              <View style={s.expiredBanner}>
                <AlertTriangle size={14} color={DS_COLORS.dangerDark} />
                <Text style={s.expiredText}>This challenge has expired</Text>
              </View>
            )}

            {isJoined && !isDaily && !(isTeamChallenge && runStatus === "failed") ? (
              <View style={s.progressSectionCard} accessibilityRole="progressbar" accessibilityLabel={`Progress: ${Math.max(userCurrentDay, 1)} of ${challenge.duration_days} days completed`}>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${Math.max(4, Math.min(100, (Math.max(userCurrentDay, 1) / Math.max(challenge.duration_days ?? 1, 1)) * 100))}%` }]} />
                </View>
                <View style={s.progressDotsRow}>
                  <View style={[s.progressDot, userCurrentDay >= Math.ceil((challenge.duration_days ?? 1) * 0.33) && s.progressDotFilled]} />
                  <View style={[s.progressDot, userCurrentDay >= Math.ceil((challenge.duration_days ?? 1) * 0.66) && s.progressDotFilled]} />
                  <View style={[s.progressDot, userCurrentDay >= (challenge.duration_days ?? 1) && s.progressDotFilled]} />
                </View>
                <View style={s.progressLabelsRow}>
                  <Text style={s.progressLabelStart}>Start</Text>
                  <Text style={s.progressLabel}>Week 1</Text>
                  <Text style={s.progressLabel}>Week 2</Text>
                  <Text style={s.progressLabel}>Done</Text>
                </View>
              </View>
            ) : null}

            <ChallengeLeaderboard
              challenge={challenge}
              participantCount={participantCount}
              participantUsernames={participantUsernames}
              formatCount={formatCount}
            />

            <ChallengeStats challenge={challenge} />

            {/* Today's Goals (hidden when team failed or shared-goal-only) */}
            {!(isTeamChallenge && runStatus === "failed") && (
            <ChallengeTodayGoals>
                {allTasks.map((task, index) => {
                  const checkin = todayCheckins.find((c: CheckinFromApi) => c.task_id === task.id);
                  const isCompleted =
                    isJoined &&
                    todayCheckins.some(
                      (c: CheckinFromApi) => c.task_id === task.id && c.status === "completed"
                    );
                  return (
                    <MissionRow
                      key={task.id}
                      task={task as ChallengeTaskFromApi & { journalPrompt?: string; journalTypes?: string[]; captureMood?: boolean; captureEnergy?: boolean; captureBodyState?: boolean; wordLimitEnabled?: boolean; wordLimitWords?: number | null; timeEnforcementEnabled?: boolean; anchorTimeLocal?: string; verification_method?: string | null; require_location?: boolean; require_heart_rate?: boolean }}
                      theme={theme}
                      isCompleted={isCompleted}
                      isLast={index === allTasks.length - 1}
                      onStart={() => handleMissionStart(task)}
                      checkin={checkin}
                      isPro={isPro}
                      verificationMethod={(task as { verification_method?: string }).verification_method}
                      stravaConnected={hasStravaTasks ? stravaConnected : null}
                      activeChallengeId={isThisActiveChallenge ? activeChallengeId : undefined}
                      stravaVerifyPending={stravaVerifyPending === task.id}
                      onConnectStrava={isThisActiveChallenge ? () => router.push(ROUTES.TABS_PROFILE as never) : undefined}
                      onVerifyStrava={async () => {
                        if (!activeChallengeId) return;
                        setStravaVerifyPending(task.id);
                        try {
                          await trpcMutate(TRPC.integrations.verifyStravaTask, {
                            activeChallengeId,
                            taskId: task.id,
                          });
                          await refetchTodayCheckins();
                        } catch (e) {
                          captureError(e, "ChallengeDetailVerifyStravaTask");
                          showError("No matching Strava activity found for today.");
                        } finally {
                          setStravaVerifyPending(null);
                        }
                      }}
                    />
                  );
                })}
            </ChallengeTodayGoals>
            )}

            {/* Rules */}
            {rules.length > 0 && (
              <View style={s.rulesSection}>
                <Text style={s.sectionTitle}>Rules</Text>
                <View style={s.rulesCard}>
                  {(rules as string[]).map((rule: string, i: number) => {
                    const isWarning = rule.toLowerCase().includes("miss") || rule.toLowerCase().includes("fail") || rule.toLowerCase().includes("reset");
                    return (
                      <View key={i} style={[s.ruleRow, i < rules.length - 1 && s.ruleRowBorder]}>
                        <View style={[s.ruleBullet, isWarning && s.ruleBulletWarning, !isWarning && s.ruleBulletOrange]}>
                          {isWarning ? (
                            <AlertTriangle size={12} color={DS_COLORS.danger} />
                          ) : (
                            <Check size={12} color={DS_COLORS.accent} />
                          )}
                        </View>
                        <Text style={[s.ruleText, isWarning && s.ruleTextWarning]}>{rule}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* About (hidden for 24h — hero chips already cover duration & difficulty) */}
            {!isDaily && (
            <View style={s.aboutSection}>
              <Text style={s.sectionTitle}>About</Text>
              {challenge.about ? <Text style={s.aboutText}>{challenge.about}</Text> : null}
              <View style={s.aboutDetailsCard}>
                {aboutDetailRows.map((row, i) => (
                  <View
                    key={row.label}
                    style={[s.aboutDetailRow, i < aboutDetailRows.length - 1 && s.aboutDetailRowBorder]}
                  >
                    <Text style={s.aboutDetailLabel}>{row.label}</Text>
                    <Text
                      style={[s.aboutDetailValue, row.valueAccent && { color: DS_COLORS.accent, fontWeight: "600" as const }]}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            )}

            {!isJoined && (
              <TouchableOpacity
                style={s.commitCtaInFlow}
                onPress={user ? () => handleJoin() : async () => { if (id) await setPendingChallengeId(id); showGate("join"); }}
                onPressIn={handleCtaPressIn}
                onPressOut={handleCtaPressOut}
                disabled={joinDisabled}
                activeOpacity={0.85}
                testID="join-challenge-button"
                accessibilityLabel={`Join ${challenge.title ?? "challenge"} — ${challenge.duration_days ?? 0} day challenge`}
                accessibilityRole="button"
                accessibilityState={{ disabled: joinDisabled }}
              >
                {isPending ? <ActivityIndicator color={DS_COLORS.white} /> : <Text style={s.commitCtaInFlowText}>Commit to This Challenge</Text>}
              </TouchableOpacity>
            )}
            {isJoined && id && challenge.created_by !== currentUserId && (
              <>
                <TouchableOpacity
                  style={s.leaveBtnInFlow}
                  onPress={handleLeave}
                  disabled={leavePending}
                  activeOpacity={0.7}
                  accessibilityLabel="Leave this challenge — your progress will not be saved"
                  accessibilityHint="Double-tap to confirm leaving the challenge"
                  accessibilityRole="button"
                >
                  {leavePending ? (
                    <ActivityIndicator size="small" color={DS_COLORS.textSecondary} />
                  ) : (
                    <Text style={s.leaveBtnInFlowText}>Leave Challenge</Text>
                  )}
                </TouchableOpacity>
                <Text style={s.ctaMicroInFlow}>Your progress will not be saved</Text>
              </>
            )}

            {!isJoined && (
              <Text style={s.ctaMicroInFlow}>{isDaily ? "Challenge expires at midnight" : "Day resets at midnight"}</Text>
            )}

          </View>
        </ScrollView>
      </Animated.View>

      {/* Commitment Confirmation Modal (GRIIT Step 4) */}
      <Modal visible={showCommitmentModal} transparent animationType="fade">
        <TouchableOpacity
          style={s.commitmentOverlay}
          activeOpacity={1}
          onPress={() => !commitmentJoining && setShowCommitmentModal(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal"
        />
        <View style={[s.commitmentCenter, { paddingBottom: insets.bottom + 24 }]}>
          <View style={s.commitmentCard}>
            <TouchableOpacity
              style={s.commitmentClose}
              onPress={() => !commitmentJoining && setShowCommitmentModal(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={s.commitmentCloseText}>✕</Text>
            </TouchableOpacity>
            <View style={s.commitmentShieldWrap}>
              <Shield size={28} color={DS_COLORS.accent} strokeWidth={2} />
            </View>
            <Text style={s.commitmentTitle}>You are committing to this challenge.</Text>
            <View style={s.commitmentDetails}>
              <View style={s.commitmentRow}>
                <Text style={s.commitmentLabel}>Challenge</Text>
                <Text style={s.commitmentValue} numberOfLines={2}>{challenge?.title ?? ""}</Text>
              </View>
              <View style={[s.commitmentRow, s.commitmentRowBorder]}>
                <Text style={s.commitmentLabel}>Duration</Text>
                <Text style={s.commitmentValue}>{challenge?.duration_days ?? 0} days</Text>
              </View>
              <View style={s.commitmentRow}>
                <Text style={s.commitmentLabel}>Mode</Text>
                <Text style={[s.commitmentValue, { color: DS_COLORS.accent, fontWeight: "600" }]}>
                  {difficultyLabel}{difficulty === "hard" || difficulty === "extreme" ? " Mode" : ""}
                </Text>
              </View>
            </View>
            <View style={s.commitmentCheckCard}>
              <Text style={s.commitmentCheckCardTitle}>COMMITMENT CHECK</Text>
              <View style={s.commitmentCheckCardRow}>
                <Text style={s.commitmentCheckCardLabel}>Time per day</Text>
                <Text style={s.commitmentCheckCardValue}>~15 min</Text>
              </View>
              <View style={[s.commitmentCheckCardRow, s.commitmentRowBorder]}>
                <Text style={s.commitmentCheckCardLabel}>Best for</Text>
                <Text style={s.commitmentCheckCardValue}>Mornings</Text>
              </View>
              <View style={s.commitmentCheckCardRow}>
                <Text style={s.commitmentCheckCardLabel}>Daily goals</Text>
                <Text style={s.commitmentCheckCardValue}>{challenge?.tasks?.length ?? 0} goals</Text>
              </View>
            </View>
            <View style={[s.commitmentWarning, { backgroundColor: DS_COLORS.dangerLight }]}>
              <AlertTriangle size={14} color={DS_COLORS.danger} style={s.warningIconInline} />
              <Text style={[s.commitmentWarningText, { color: DS_COLORS.danger }]}>One missed day resets progress to Day 1.</Text>
            </View>
            <TouchableOpacity
              style={s.commitmentCheckRow}
              onPress={() => !commitmentJoining && setCommitmentUnderstood((v) => !v)}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: commitmentUnderstood }}
              accessibilityLabel="I understand the rules and reset conditions"
            >
              <View style={[s.commitmentCheckbox, commitmentUnderstood && s.commitmentCheckboxChecked]}>
                {commitmentUnderstood ? <Check size={14} color={DS_COLORS.white} /> : null}
              </View>
              <Text style={s.commitmentCheckLabel}>I understand the rules and reset conditions.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.commitmentConfirmBtn,
                (commitmentJoining || !commitmentUnderstood) && s.commitmentConfirmDisabled,
              ]}
              onPress={handleCommitmentConfirm}
              disabled={commitmentJoining || !commitmentUnderstood}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Confirm commitment"
              accessibilityState={{ disabled: commitmentJoining || !commitmentUnderstood }}
            >
              {commitmentJoining ? (
                <ActivityIndicator color={DS_COLORS.white} />
              ) : (
                <Text style={s.commitmentConfirmText}>Confirm Commitment</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.commitmentCancelBtn}
              onPress={() => !commitmentJoining && setShowCommitmentModal(false)}
              disabled={commitmentJoining}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityState={{ disabled: commitmentJoining }}
            >
              <Text style={s.commitmentCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <JoinCelebrationModal
        visible={showJoinCelebration}
        onDismiss={onJoinCelebrationDismiss}
        challengeName={challenge?.title ?? ""}
      />

      <TimeWindowPrompt
        visible={showTimePrompt}
        tasks={promptTasks}
        onSave={async (times) => {
          const cid = challenge?.id ?? id ?? "";
          const ctitle = challenge?.title ?? "Your challenge";
          const rawTasks = (challenge?.tasks ?? []) as ChallengeTaskFromApi[];
          await Promise.all(
            Object.entries(times).map(async ([taskId, timeStr]) => {
              const parsed = parseTimeString(timeStr);
              if (!parsed) return;
              const task = rawTasks.find((t) => String(t.id) === String(taskId));
              if (!task) return;
              const taskName = String((task as { title?: string }).title ?? task.type ?? "Task");
              await scheduleTaskReminder({
                taskName,
                challengeName: ctitle,
                hour: parsed.hour,
                minute: parsed.minute,
                identifier: `task-${cid}-${taskId}`,
              });
            })
          );
          onTimeWindowComplete();
        }}
        onSkip={onTimeWindowComplete}
      />

      <ConfirmDialog
        visible={leaveConfirmVisible}
        title="Leave Challenge"
        message="Are you sure you want to leave this challenge? You will lose your progress."
        confirmLabel="Leave"
        destructive
        onCancel={() => setLeaveConfirmVisible(false)}
        onConfirm={() => void confirmLeaveChallenge()}
      />
    </View>
    </ErrorBoundary>
  );
}


