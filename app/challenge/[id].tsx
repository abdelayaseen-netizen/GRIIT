import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  Modal,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  ChevronLeft,
  MoreHorizontal,
  Clock,
  Users,
  Lock,
  MapPin,
} from "lucide-react-native";
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
import { useTheme } from "@/contexts/ThemeContext";
import TeamStatusHeader from "@/components/challenge/TeamStatusHeader";
import TeamMemberList, { type TeamMemberForList } from "@/components/challenge/TeamMemberList";
import SharedGoalProgress from "@/components/challenge/SharedGoalProgress";
import { track, trackEvent } from "@/lib/analytics";
import { useLeaveChallenge } from "@/lib/mutations";
import { formatTRPCError } from "@/lib/api";
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
  DS_RADIUS,
  DS_TYPOGRAPHY,
  DS_BORDERS,
  DS_MEASURES,
  GRIIT_COLORS,
} from "@/lib/design-system";
import { InitialCircle } from "@/src/components/ui";
import JoinCelebrationModal from "@/components/challenges/JoinCelebrationModal";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { ErrorRetry } from "@/components/ErrorRetry";

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
    accentSoft: "rgba(46,125,50,0.12)",
    ctaBg: DS_COLORS.success,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.white,
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(46,125,50,0.12)",
    progressFill: DS_COLORS.success,
    missionIconBg: DS_COLORS.successSoft,
    warningBg: "rgba(46,125,50,0.06)",
    warningText: DS_COLORS.success,
    warningBorder: "rgba(46,125,50,0.15)",
  },
  medium: {
    headerBg: DS_COLORS.difficultyEasyHeader,
    headerGradientEnd: DS_COLORS.difficultyEasyHeader,
    accent: DS_COLORS.success,
    accentLight: DS_COLORS.successSoft,
    accentSoft: "rgba(46,125,50,0.12)",
    ctaBg: DS_COLORS.success,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.white,
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(46,125,50,0.12)",
    progressFill: DS_COLORS.success,
    missionIconBg: DS_COLORS.successSoft,
    warningBg: "rgba(46,125,50,0.06)",
    warningText: DS_COLORS.success,
    warningBorder: "rgba(46,125,50,0.15)",
  },
  hard: {
    headerBg: DS_COLORS.black,
    headerGradientEnd: DS_COLORS.black,
    accent: DS_COLORS.accent,
    accentLight: DS_COLORS.accentSoft,
    accentSoft: "rgba(232,115,58,0.14)",
    ctaBg: DS_COLORS.accent,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.accent,
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(232,115,58,0.15)",
    progressFill: DS_COLORS.accent,
    missionIconBg: DS_COLORS.accentSoft,
    warningBg: "rgba(232,115,58,0.08)",
    warningText: DS_COLORS.accent,
    warningBorder: "rgba(232,115,58,0.20)",
  },
  extreme: {
    headerBg: DS_COLORS.black,
    headerGradientEnd: DS_COLORS.black,
    accent: DS_COLORS.accent,
    accentLight: DS_COLORS.accentSoft,
    accentSoft: "rgba(232,115,58,0.14)",
    ctaBg: DS_COLORS.accent,
    ctaText: DS_COLORS.white,
    backArrowColor: DS_COLORS.accent,
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(232,115,58,0.15)",
    progressFill: DS_COLORS.accent,
    missionIconBg: DS_COLORS.accentSoft,
    warningBg: "rgba(232,115,58,0.08)",
    warningText: DS_COLORS.accent,
    warningBorder: "rgba(232,115,58,0.20)",
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

const CTA_LABELS_DEFAULT = { join: "Commit to This Challenge", active: "Continue Today" };
const CTA_LABELS: Record<string, { join: string; active: string }> = {
  easy: CTA_LABELS_DEFAULT,
  medium: CTA_LABELS_DEFAULT,
  hard: CTA_LABELS_DEFAULT,
  extreme: CTA_LABELS_DEFAULT,
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

function InfoChip({ label, theme: _theme, dark }: { label: string; theme: DifficultyTheme; dark?: boolean }) {
  return (
    <View
      style={[
        s.infoChip,
        { borderColor: "rgba(255,255,255,0.35)", backgroundColor: dark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.18)" },
      ]}
    >
      <Text style={s.infoChipText}>{label}</Text>
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

function SocialAvatars({ participantsCount, participantUsernames }: { participantsCount: number; participantUsernames?: string[] }) {
  const showAvatars = participantsCount > 0 && participantUsernames && participantUsernames.length > 0;
  if (!showAvatars) return null;
  return (
    <View style={s.avatarStack}>
      {(participantUsernames ?? []).slice(0, 5).map((username, i) => (
        <View key={username + i} style={[s.stackAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }]}>
          <InitialCircle username={username} size={32} />
        </View>
      ))}
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
    ? DS_COLORS.purpleTintLight
    : task.type === "run"
    ? DS_COLORS.purpleTintWarm
    : theme.missionIconBg;
  const iconColor = isCompleted ? DS_COLORS.success : isJournal ? DS_COLORS.journalPurple : task.type === "run" ? DS_COLORS.runOrange : theme.accent;
  return (
    <View style={[s.missionRow, !isLast && s.missionRowBorder]}>
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
          accessibilityLabel={`Start ${task.title ?? "task"}`}
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
  const { colors: themeColors } = useTheme();
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
  const activeCount = Array.isArray(myActiveListQuery.data) ? myActiveListQuery.data.length : 0;
  const joinLimit = canJoinChallenge(activeCount);
  const currentUserId = user?.id ?? undefined;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

  const queryClient = useQueryClient();
  const challengeQuery = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery(TRPC.challenges.getById, { id: id! }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
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
      console.error("[ChallengeDetail] recordOpen failed:", e);
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
  const teamSize = ch?.team_size ?? 1;
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
      console.error("[ChallengeDetail] fetchSharedGoalData failed:", error);
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
      router.push("/paywall" as never);
      return;
    }
    setCommitmentJoining(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await trpcMutate(TRPC.challenges.join, { challengeId: id });

      void trpcMutate(TRPC.referrals.markJoinedChallenge, { challengeId: id }).catch((refErr: unknown) => {
        console.error("[ChallengeDetail] markJoinedChallenge failed:", refErr);
      });

      setShowCommitmentModal(false);
      setShowJoinCelebration(true);
      trackEvent("challenge_joined", { challenge_id: id });
      track({ name: "challenge_joined", challenge_id: id });

      void refetchAll().catch((e: unknown) => {
        console.error("[ChallengeDetail] refetchAll after join failed:", e);
      });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      void queryClient.invalidateQueries({ queryKey: ["challenge", id] });
      void myActiveListQuery.refetch();
    } catch (err: unknown) {
      console.error("[ChallengeDetail] join failed:", err);
      const { title, message } = formatTRPCError(err);
      showError(typeof message === "string" && message.trim() ? `${title}: ${message}` : title);
    } finally {
      setCommitmentJoining(false);
    }
  }, [id, commitmentJoining, user?.id, refetchAll, router, queryClient, myActiveListQuery, showError]);

  const onJoinCelebrationDismiss = useCallback(() => {
    setShowJoinCelebration(false);
    // Drop cached home payload so the tab cannot briefly show pre-join empty goals after replace().
    queryClient.removeQueries({ queryKey: ["home"] });
    router.replace(ROUTES.TABS_HOME as never);
  }, [router, queryClient]);

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
      router.push({ pathname: ROUTES.TASK_RUN, params: { taskId: task.id } } as never);
      return;
    }

    // Unified completion screen for manual, simple, journal, timer, photo (with optional advanced verification)
    const taskConfig = {
      require_photo: needsPhotoProof || apiTask.require_photo === true,
      min_duration_minutes: apiTask.min_duration_minutes ?? apiTask.duration_minutes ?? undefined,
      min_words: apiTask.min_words ?? undefined,
      timer_direction: (apiTask.timer_direction === "countup" ? "countup" : "countdown") as "countdown" | "countup",
      timer_hard_mode: apiTask.timer_hard_mode === true || apiTask.strict_timer_mode === true,
      require_heart_rate: apiTask.require_heart_rate === true,
      heart_rate_threshold: apiTask.heart_rate_threshold ?? 100,
      require_location: apiTask.require_location === true,
      location_name: apiTask.location_name ?? undefined,
      location_latitude: apiTask.location_latitude ?? undefined,
      location_longitude: apiTask.location_longitude ?? undefined,
      location_radius_meters: apiTask.location_radius_meters ?? 200,
    };
    router.push({
      pathname: ROUTES.TASK_COMPLETE,
      params: {
        taskId: task.id,
        activeChallengeId: activeChallenge?.id ?? "",
        taskType: task.type,
        taskName: task.title ?? "",
        taskDescription: (task as { description?: string }).description ?? "",
        taskConfig: JSON.stringify(taskConfig),
      },
    } as never);
  }, [router, activeChallenge?.id, showError]);

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
  const activeChallengeId = activeChallenge?.id as string | undefined;

  const handleContinueToday = useCallback(() => {
    if (!isJoined || !id) return;
    if (activeChallengeId) {
      router.push(`/challenge/active/${activeChallengeId}` as never);
      return;
    }
    if (firstIncompleteTask) {
      handleMissionStart(firstIncompleteTask);
      return;
    }
    if (allTasks.length === 0) return;
    showError("All goals complete. Secure your day to lock it in. You can secure from Home, or stay here.");
  }, [isJoined, id, activeChallengeId, router, firstIncompleteTask, allTasks.length, handleMissionStart, showError]);
  const hasStravaTasks = allTasks.some((t) => (t as { verification_method?: string }).verification_method === "strava_activity");

  useEffect(() => {
    if (!isThisActiveChallenge || !hasStravaTasks) {
      setStravaConnected(null);
      return;
    }
    trpcQuery(TRPC.integrations.getStravaConnection)
      .then((conn: unknown) => setStravaConnected(!!conn))
      .catch(() => setStravaConnected(false));
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
    Alert.alert(
      "Leave Challenge",
      "Are you sure you want to leave this challenge? You will lose your progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveMutation.mutateAsync({ challengeId: id });
              await refetchAll();
              await refetchTodayCheckins();
              router.replace(ROUTES.TABS_DISCOVER as never);
            } catch (e: unknown) {
              const { title, message } = formatTRPCError(e);
              showError(typeof message === "string" && message.trim() ? `${title}: ${message}` : title);
            }
          },
        },
      ]
    );
  }, [id, leavePending, leaveMutation, refetchAll, refetchTodayCheckins, router, showError]);

  const difficulty = (challenge?.difficulty || "medium") as string;

  const headerColor = useMemo(() => {
    const cat = (challenge?.category ?? "").toUpperCase();
    if (cat === "FITNESS") return DS_COLORS.HEADER_FITNESS_DEEP;
    if (cat === "MIND") return DS_COLORS.HEADER_MIND_DEEP;
    if (cat === "DISCIPLINE") return DS_COLORS.HEADER_DISCIPLINE_DEEP;
    if (cat === "FAITH") return DS_COLORS.HEADER_FAITH_DEEP;
    return DS_COLORS.HEADER_DEFAULT;
  }, [challenge?.category]);

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
          <TouchableOpacity onPress={() => router.back()} style={s.emptyBtn} accessibilityLabel="Go back" accessibilityRole="button">
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
        <View style={s.skeletonHeader} />
        <View style={s.skeletonBody}>
          <View style={s.skeletonChipRow}>
            <View style={s.skeletonChip} />
            <View style={s.skeletonChip} />
            <View style={s.skeletonChip} />
          </View>
          <View style={s.skeletonBlock} />
          <View style={s.skeletonMission} />
          <View style={s.skeletonMission} />
        </View>
      </View>
    );
  }

  if (remoteLoadError) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: DS_COLORS.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[s.emptyWrap, { flex: 1, justifyContent: "center" }]}>
          <ErrorRetry message="Couldn't load this challenge" onRetry={() => void challengeQuery.refetch()} />
          <TouchableOpacity onPress={() => router.back()} style={[s.emptyBtn, { marginTop: DS_SPACING.lg }]} accessibilityLabel="Go back" accessibilityRole="button">
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
          <TouchableOpacity onPress={() => router.back()} style={[s.emptyBtn, { marginTop: 12 }]} accessibilityLabel="Go back" accessibilityRole="button">
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
  const ctaLabels: { join: string; active: string } = CTA_LABELS[difficulty] ?? CTA_LABELS_DEFAULT;
  const ctaLabel = isDaily
    ? expired ? "Expired" : "Commit to This Challenge"
    : isJoined ? ctaLabels.active : ctaLabels.join;
  const joinDisabled = isPending || (isDaily && expired);

  const headerGradientColors = [headerColor, headerColor] as const;
  const ctaBgColor = isJoined ? DS_COLORS.accent : GRIIT_COLORS.primary;
  const countdownTheme = isDaily ? { ...theme, accent: DS_COLORS.success } : theme;

  const challengeVisibility = (challenge.visibility || "public") as string;
  const visibilityLabel = challengeVisibility === "friends" ? "Friends" : challengeVisibility === "private" ? "Only me" : null;
  const visibilityIcon = challengeVisibility === "friends"
    ? <Users size={11} color={DS_COLORS.white} />
    : challengeVisibility === "private"
    ? <Lock size={11} color={DS_COLORS.white} />
    : null;

  const participantUsernames = (challenge as { participant_usernames?: string[] }).participant_usernames;

  const aboutDetailRows: { label: string; value: string; valueAccent?: boolean }[] = [
    { label: "Duration", value: durationLabel },
    { label: "Daily Time", value: `~${estimateDailyMinutesFromTasks(allTasks)} min` },
    { label: "Difficulty", value: difficultyLabel },
    { label: "Category", value: formatChallengeMetaLabel(challenge.category) },
    ...(typeof challenge.participants_count === "number"
      ? [
          {
            label: "Participants",
            value:
              challenge.participants_count > 0
                ? `${challenge.participants_count} people`
                : "Be the first to join",
            valueAccent: challenge.participants_count === 0,
          },
        ]
      : []),
  ];

  return (
    <View style={[s.container, { backgroundColor: DS_COLORS.BG_PAGE }]}>
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
          {/* HERO: green for 24h, orange gradient otherwise */}
          <LinearGradient colors={headerGradientColors} style={[s.heroHeader, isDaily && s.heroHeader24h]}>
            <SafeAreaView edges={["top"]} style={s.heroSafeArea}>
              <View style={s.topNav}>
                <TouchableOpacity
                  style={[s.backPill, isDaily && s.backPill24h]}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessible
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                >
                  <ChevronLeft size={24} color={DS_COLORS.white} />
                </TouchableOpacity>
                <Text style={[s.topNavTitle, isDaily && s.topNavTitle24h]}>Challenge</Text>
                <TouchableOpacity
                  style={[s.morePill, isDaily && s.backPill24h]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => {
                    Alert.alert("Challenge", undefined, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Share",
                        onPress: () => {
                          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          trackEvent("share_tapped", {
                            content_type: "challenge",
                            challenge_id: id ?? undefined,
                          });
                          import("@/lib/share").then(({ shareChallenge }) =>
                            shareChallenge(
                              {
                                name: challenge.title,
                                duration: challenge.duration_days ?? 0,
                                id: id ?? "",
                                tasksPerDay: challenge.tasks?.length,
                              },
                              currentUserId
                            )
                          ).catch((e) => console.error("[ChallengeDetail] shareChallenge failed:", e));
                        },
                      },
                      {
                        text: "Invite friends",
                        onPress: () => {
                          trackEvent("invite_sent", {
                            content_type: "challenge",
                            challenge_id: id ?? undefined,
                            source: "challenge_menu",
                          });
                          import("@/lib/share").then(({ inviteToChallenge }) =>
                            inviteToChallenge({ name: challenge.title, id: id ?? "" }, currentUserId)
                          ).catch((e) => console.error("[ChallengeDetail] inviteToChallenge failed:", e));
                        },
                      },
                    ], { cancelable: true });
                  }}
                  accessible
                  accessibilityLabel="Challenge options"
                  accessibilityRole="button"
                >
                  <MoreHorizontal size={20} color={DS_COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={s.heroContent}>
                {eyebrowLabel != null && (
                  <View style={s.dailyLabel}>
                    <Text style={s.dailyLabelText}>{eyebrowLabel}</Text>
                  </View>
                )}
                <Text style={s.heroTitle}>{challenge.title}</Text>
                <Text style={s.heroTagline} numberOfLines={2}>{challenge.short_hook || challenge.description}</Text>
                {referrerLabel ? <Text style={s.referrerLabel}>{referrerLabel}</Text> : null}
                <View style={s.chipRow}>
                  <InfoChip label={durationLabel} theme={theme} dark />
                  {isJoined && !isDaily && (
                    <>
                      <InfoChip label={`${userStreak}-day streak`} theme={theme} dark />
                      <InfoChip label={`Day ${userCurrentDay} / ${challenge.duration_days}`} theme={theme} dark />
                    </>
                  )}
                  <View style={[s.difficultyPill, { backgroundColor: difficultyPillStyle.bg }]}>
                    <Text style={[s.difficultyPillText, { color: difficultyPillStyle.text }]}>
                      {difficulty === "hard" || difficulty === "extreme" ? `${difficultyLabel} Mode` : difficultyLabel}
                    </Text>
                  </View>
                  {visibilityLabel && (
                    <View style={[s.infoChip, s.visibilityChip, { borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.15)" }]}>
                      {visibilityIcon}
                      <Text style={s.infoChipText}>{visibilityLabel}</Text>
                    </View>
                  )}
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* BODY: warm background, large radius cards, premium spacing */}
          <View style={[s.body, isDaily && { gap: DS_SPACING.sm }]}>

            {/* Team / Shared Goal sections (remote only) */}
            {id && (isTeamChallenge || isSharedGoal) && (
              <>
                {isTeamChallenge && runStatus && (
                  <>
                    <TeamStatusHeader
                      runStatus={runStatus}
                      teamSize={teamSize}
                      memberCount={teamMembers.length}
                      currentDay={userCurrentDay}
                      durationDays={challenge.duration_days ?? 0}
                      isCreator={teamMembers.some((m) => m.user_id === currentUserId && m.role === "creator")}
                      onStartChallenge={async () => {
                        if (!id) return;
                        try {
                          await trpcMutate(TRPC.challenges.startTeamChallenge, { challengeId: id });
                          queryClient.invalidateQueries({ queryKey: ["challenge", id] });
                        } catch (e: unknown) {
                          console.error("[ChallengeDetail] startTeamChallenge failed:", e);
                          showError((e as Error)?.message ?? "Could not start challenge.");
                        }
                      }}
                      onInvite={() => {
                        trackEvent("invite_sent", {
                          content_type: "challenge",
                          challenge_id: id ?? undefined,
                          source: "team_status",
                        });
                        import("@/lib/share").then(({ inviteToChallenge }) =>
                          inviteToChallenge({ name: challenge.title, id: id ?? "" }, currentUserId)
                        ).catch((e) => console.error("[ChallengeDetail] inviteToChallenge (team) failed:", e));
                      }}
                    />
                    <TeamMemberList
                      members={teamMembers}
                      currentUserId={currentUserId}
                      runStatus={runStatus}
                    />
                    {runStatus === "failed" && (
                      <View style={[s.failCtaWrap, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                        <Text style={s.failCtaText}>Challenge failed for all {teamMembers.length} team members</Text>
                        <TouchableOpacity
                          style={[s.failCtaBtn, { backgroundColor: theme.accent }]}
                          onPress={() => router.replace(ROUTES.TABS as never)}
                          activeOpacity={0.85}
                          accessibilityRole="button"
                          accessibilityLabel="Back to home"
                        >
                          <Text style={s.failCtaBtnText}>Back to Home</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
                {isSharedGoal && isTeamOrSharedMember && (
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
              </>
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

            {/* Progress (joined only; simple day line — no progress grid) */}
            {isJoined && !isDaily && !(isTeamChallenge && runStatus === "failed") && (
              <View style={[s.progressSimpleCard, { backgroundColor: DS_COLORS.BG_CARD }]}>
                <Text style={[s.progressSimpleText, { color: DS_COLORS.TEXT_SECONDARY }]}>
                  Day {userCurrentDay} of {challenge.duration_days}
                </Text>
              </View>
            )}

            {/* Participants summary card */}
            <View style={s.participantStatsCard}>
              <View style={s.socialRow}>
                <SocialAvatars participantsCount={challenge.participants_count ?? 0} participantUsernames={participantUsernames} />
                <View style={s.socialTextWrap}>
                  <Text style={s.socialPrimary}>
                    {(challenge.participants_count ?? 0) === 0
                      ? "Be the first to start something real."
                      : (() => {
                          const pc = challenge.participants_count ?? 0;
                          const joinedToday = Math.max(1, Math.floor(pc * 0.02));
                          const rate = challenge.completion_rate ?? 0;
                          const activeToday =
                            (challenge.active_today_count ?? 0) > 0
                              ? ` · ${formatCount(challenge.active_today_count ?? 0)} active today`
                              : "";
                          return `${formatCount(pc)} in this challenge${activeToday} · about ${joinedToday} joined today · ${rate}% completion rate`;
                        })()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats row: secured today % | completion rate % (spec 3.3) */}
            <View style={s.statsRowCard}>
              <View style={s.statsRowCol}>
                <Text style={s.statsRowValue}>
                  {challenge.participants_count
                    ? Math.round(((challenge.active_today_count ?? 0) / Math.max(1, challenge.participants_count)) * 100)
                    : 0}%
                </Text>
                <Text style={s.statsRowLabel}>secured today</Text>
              </View>
              <View style={s.statsRowDivider} />
              <View style={s.statsRowCol}>
                <Text style={s.statsRowValue}>{challenge.completion_rate ?? 0}%</Text>
                <Text style={s.statsRowLabel}>completion rate</Text>
              </View>
            </View>

            {/* Today's Goals (hidden when team failed or shared-goal-only) */}
            {!(isTeamChallenge && runStatus === "failed") && (
            <View style={s.missionsSection}>
              <Text style={s.sectionTitle}>Today&apos;s Goals</Text>
              <View style={s.missionsCard}>
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
                          console.error("[ChallengeDetail] verifyStravaTask failed:", e);
                          showError("No matching Strava activity found for today.");
                        } finally {
                          setStravaVerifyPending(null);
                        }
                      }}
                    />
                  );
                })}
              </View>
            </View>
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

            {isJoined && id && (
              <TouchableOpacity
                style={[s.leaveBtn, { borderWidth: DS_BORDERS.width, borderColor: DS_COLORS.border, borderRadius: DS_RADIUS.button }]}
                onPress={handleLeave}
                disabled={leavePending}
                activeOpacity={0.7}
                accessibilityLabel="Leave this challenge"
                accessibilityRole="button"
              >
                {leavePending ? (
                  <ActivityIndicator size="small" color={themeColors.text?.secondary} />
                ) : (
                  <Text style={s.leaveBtnText}>Leave Challenge</Text>
                )}
              </TouchableOpacity>
            )}

          </View>
        </ScrollView>

        {/* STICKY CTA */}
        <View style={[s.stickyFooter, { paddingBottom: insets.bottom + DS_SPACING.lg }]}>
          {isDaily && expired ? (
            <View style={s.disabledCta}>
              <Text style={s.disabledCtaText}>Expired</Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: ctaScaleAnim }], alignSelf: "stretch" }}>
            <TouchableOpacity
              style={[s.ctaButton, { backgroundColor: ctaBgColor }]}
              onPress={isJoined ? handleContinueToday : user ? () => handleJoin() : async () => { if (id) await setPendingChallengeId(id); showGate("join"); }}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              disabled={joinDisabled}
              activeOpacity={0.85}
              testID="join-challenge-button"
              accessibilityLabel={isJoined ? "Go to challenge" : "Join this challenge"}
              accessibilityRole="button"
              accessibilityState={{ disabled: joinDisabled }}
            >
                {isPending ? (
                  <ActivityIndicator color={DS_COLORS.white} />
                ) : (
                  <Text style={s.ctaText}>{ctaLabel}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
          {!isJoined && !joinLimit.allowed && (
            <Text style={[s.ctaMicro, { marginTop: 8 }]}>
              {activeCount}/{joinLimit.limit} active challenges — upgrade for unlimited
            </Text>
          )}
          {isJoined && (
            <TouchableOpacity
              style={s.inviteLink}
              onPress={() => {
                track({ name: "invite_shared", challengeId: id ?? undefined, source: "challenge_detail" });
                trackEvent("invite_sent", {
                  content_type: "challenge",
                  challenge_id: id ?? undefined,
                  source: "challenge_detail_cta",
                });
                import("@/lib/share").then(({ inviteToChallenge }) =>
                  inviteToChallenge({ name: challenge.title, id: id ?? "" }, currentUserId)
                ).catch((e) => console.error("[ChallengeDetail] inviteToChallenge (cta) failed:", e));
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Invite friends to this challenge"
            >
              <Text style={s.inviteLinkText}>Invite friends to this challenge</Text>
            </TouchableOpacity>
          )}
          <Text style={s.ctaMicro}>
            {isDaily ? "Challenge expires at midnight" : "Day resets at midnight"}
          </Text>
        </View>
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
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  flex: { flex: 1 },
  warningIconInline: { marginRight: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: DS_SPACING.lg },

  loadingContainer: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  skeletonHeader: {
    height: 260,
    backgroundColor: DS_COLORS.borderAlt,
  },
  skeletonBody: {
    padding: DS_SPACING.cardPadding,
  },
  skeletonChipRow: {
    flexDirection: "row",
    gap: DS_SPACING.sm,
    marginBottom: DS_SPACING.xxl,
    marginTop: DS_SPACING.lg,
  },
  skeletonChip: {
    width: 80,
    height: 32,
    borderRadius: DS_RADIUS.chip,
    backgroundColor: DS_COLORS.surfaceMuted,
  },
  skeletonBlock: {
    height: 80,
    borderRadius: DS_RADIUS.cardAlt,
    backgroundColor: DS_COLORS.surfaceMuted,
    marginBottom: DS_SPACING.xl,
  },
  skeletonMission: {
    height: 64,
    borderRadius: DS_RADIUS.cardAlt,
    backgroundColor: DS_COLORS.surfaceMuted,
    marginBottom: DS_SPACING.md,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.xxxl,
  },
  emptyText: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    marginBottom: DS_SPACING.lg,
  },
  emptySubtext: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    marginBottom: DS_SPACING.lg,
    textAlign: "center",
    color: DS_COLORS.textSecondary,
  },
  emptyBtn: {
    paddingHorizontal: DS_SPACING.xxl,
    paddingVertical: DS_SPACING.md,
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.button,
  },
  emptyBtnText: {
    fontSize: DS_TYPOGRAPHY.buttonSmall.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
  },

  heroHeader: {
    minHeight: 280,
    paddingBottom: DS_SPACING.xxl + DS_SPACING.lg,
    borderBottomLeftRadius: DS_RADIUS.card,
    borderBottomRightRadius: DS_RADIUS.card,
  },
  heroHeader24h: {
    backgroundColor: DS_COLORS.challenge24hHeaderBg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroSafeArea: {
    paddingHorizontal: 20,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: DS_SPACING.sm,
    marginBottom: DS_SPACING.xxl,
  },
  backPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backPill24h: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  topNavTitle: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
    letterSpacing: 0.5,
  },
  topNavTitle24h: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  morePill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    paddingTop: DS_SPACING.xs,
  },
  heroEyebrow: {
    fontSize: DS_TYPOGRAPHY.eyebrow.fontSize,
    fontWeight: DS_TYPOGRAPHY.eyebrow.fontWeight,
    letterSpacing: DS_TYPOGRAPHY.eyebrow.letterSpacing,
    color: "rgba(255,255,255,0.85)",
    marginBottom: DS_SPACING.sm,
  },
  dailyLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: DS_SPACING.sm,
  },
  dailyLabelText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800" as const,
    color: DS_COLORS.white,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: DS_SPACING.sm,
  },
  heroTagline: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
    marginBottom: DS_SPACING.lg,
  },
  referrerLabel: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.85)",
    marginBottom: DS_SPACING.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING.sm,
  },
  visibilityChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
  },
  difficultyPill: {
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.sm,
    borderRadius: 100,
  },
  difficultyPillText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600" as const,
  },
  infoChip: {
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  infoChipText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
    letterSpacing: 0.1,
  },
  body: {
    backgroundColor: DS_COLORS.background,
    borderTopLeftRadius: DS_RADIUS.card,
    borderTopRightRadius: DS_RADIUS.card,
    marginTop: -DS_RADIUS.card * 0.5,
    paddingTop: DS_SPACING.xxl,
    paddingHorizontal: 20,
    paddingBottom: DS_SPACING.lg,
    borderWidth: 0,
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },

  countdownCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DS_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: DS_SPACING.lg,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  countdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countdownLabel: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    fontVariant: ["tabular-nums"] as const,
    letterSpacing: 0.5,
  },

  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: DS_COLORS.dangerSoft,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  expiredText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.dangerDark,
  },

  progressSimpleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressSimpleText: {
    fontSize: 13,
  },
  progressSection: {
    marginBottom: DS_SPACING.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DS_SPACING.sm,
  },
  sectionLabel: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  progressValue: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    fontVariant: ["tabular-nums"] as const,
  },
  progressBarBg: {
    height: DS_MEASURES.progressBarHeight,
    borderRadius: DS_RADIUS.input / 2,
    overflow: "hidden" as const,
    marginBottom: DS_SPACING.sm,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  streakAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  streakAlertText: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  failAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  failAlertText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: DS_COLORS.dangerDark,
  },
  failCtaWrap: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  failCtaText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    marginBottom: 12,
  },
  failCtaBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  failCtaBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
  },

  participantStatsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  statsRowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.surfaceMuted,
    borderRadius: 14,
    padding: 16,
    marginBottom: DS_SPACING.lg,
    borderWidth: 0,
  },
  statsRowCol: {
    flex: 1,
    alignItems: "center",
  },
  statsRowValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: DS_COLORS.accent,
    marginBottom: DS_SPACING.xs,
  },
  statsRowLabel: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
  },
  statsRowDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: DS_COLORS.border,
    marginVertical: DS_SPACING.xs,
  },
  progressStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  progressStatItem: {
    flex: 1,
    alignItems: "center",
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: DS_COLORS.accent,
    marginBottom: DS_SPACING.xs,
  },
  progressStatLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: DS_TYPOGRAPHY.statLabel.fontWeight,
    color: DS_COLORS.textSecondary,
  },
  progressStatDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: DS_COLORS.border,
    marginVertical: DS_SPACING.xs,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.lg,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DS_COLORS.white,
  },
  socialTextWrap: {
    flex: 1,
  },
  socialPrimary: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  socialSecondary: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
  },

  statItem: {
    flex: 1,
    backgroundColor: DS_COLORS.surfaceMuted,
    borderRadius: DS_RADIUS.cardAlt,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.cardPadding,
    alignItems: "center",
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  statNumber: {
    fontSize: DS_TYPOGRAPHY.statValue.fontSize,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    marginBottom: DS_SPACING.xs,
  },
  statLabel: {
    fontSize: DS_TYPOGRAPHY.statLabel.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
    textAlign: "center" as const,
  },

  missionsSection: {
    marginBottom: DS_SPACING.xxl,
  },
  sectionTitle: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: DS_TYPOGRAPHY.sectionTitle.fontWeight,
    color: DS_COLORS.textPrimary,
    letterSpacing: DS_TYPOGRAPHY.sectionTitle.letterSpacing,
    marginBottom: DS_SPACING.md,
  },
  missionsCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    overflow: "hidden" as const,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.cardPadding,
    paddingVertical: DS_SPACING.lg,
    gap: DS_SPACING.lg,
    minHeight: 72,
  },
  missionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS.border,
  },
  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  missionContent: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  journalPill: {
    backgroundColor: DS_COLORS.avatarPurple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  journalPillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: DS_COLORS.avatarPurpleText,
  },
  timePill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    backgroundColor: "rgba(14,165,233,0.10)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timePillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: DS_COLORS.linkBlue,
  },
  proBadge: {
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: DS_COLORS.WHITE,
  },
  missionTitle: {
    fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  missionTitleDone: {
    color: DS_COLORS.textSecondary,
    textDecorationLine: "line-through" as const,
  },
  missionMeta: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
  },
  missionMetaActive: {
    color: DS_COLORS.emeraldDark,
    fontWeight: "500" as const,
  },
  missionMetaMissed: {
    color: DS_COLORS.dangerMid,
    fontWeight: "500" as const,
  },
  reqChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: DS_SPACING.xs,
    maxWidth: "78%" as const,
  },
  reqChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: DS_COLORS.CARD_ALT_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reqChipText: {
    fontSize: 10,
    color: DS_COLORS.TEXT_MUTED,
  },
  startAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  startActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: DS_COLORS.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: DS_COLORS.success,
  },

  rulesSection: {
    marginBottom: DS_SPACING.xxl,
  },
  rulesCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    overflow: "hidden" as const,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.cardPadding,
    paddingVertical: DS_SPACING.lg,
    gap: DS_SPACING.md,
  },
  ruleRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS.border,
  },
  ruleBullet: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: DS_COLORS.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleBulletOrange: {
    backgroundColor: DS_COLORS.accentLight,
  },
  ruleBulletWarning: {
    backgroundColor: DS_COLORS.dangerSoft,
  },
  ruleText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
    flex: 1,
    lineHeight: DS_TYPOGRAPHY.bodySmall.lineHeight,
  },
  ruleTextWarning: {
    color: DS_COLORS.danger,
    fontWeight: "600" as const,
  },
  aboutSection: {
    marginBottom: DS_SPACING.lg,
  },
  aboutText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  aboutDetailsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.BASE,
    marginTop: DS_SPACING.BASE,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  aboutDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: DS_SPACING.md,
  },
  aboutDetailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.borderAlt,
  },
  aboutDetailLabel: {
    width: 120,
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
  aboutDetailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    textAlign: "right" as const,
  },

  leaveBtn: {
    alignItems: "center",
    paddingVertical: DS_SPACING.md,
    marginBottom: DS_SPACING.sm,
  },
  leaveBtnText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.danger,
    opacity: 0.9,
  },

  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.lg,
    backgroundColor: DS_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    alignItems: "center",
  },
  ctaButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingVertical: 14,
    borderRadius: DS_RADIUS.joinCta,
    backgroundColor: DS_COLORS.accent,
    width: Platform.OS === "web" ? 400 : undefined,
    alignSelf: "stretch" as const,
    minWidth: 280,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  inviteLink: {
    marginTop: DS_SPACING.sm,
    paddingVertical: DS_SPACING.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  inviteLinkText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.accent,
  },
  ctaMicro: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.sm,
    textAlign: "center",
  },
  disabledCta: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DS_SPACING.lg,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.chipFill,
    alignSelf: "stretch" as const,
  },
  disabledCtaText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.textMuted,
  },

  commitmentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  commitmentCenter: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  commitmentCard: {
    backgroundColor: DS_COLORS.BG_PRIMARY,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 0,
  },
  commitmentClose: {
    position: "absolute",
    top: DS_SPACING.lg,
    right: DS_SPACING.lg,
    zIndex: 1,
    padding: DS_SPACING.xs,
  },
  commitmentCloseText: {
    fontSize: 20,
    color: DS_COLORS.textMuted,
    fontWeight: "600",
  },
  commitmentShieldWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DS_COLORS.GRAY_CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    marginTop: DS_SPACING.sm,
  },
  commitmentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginTop: DS_SPACING.xl,
    paddingHorizontal: DS_SPACING.sm,
  },
  commitmentDetails: {
    width: "100%",
    marginTop: DS_SPACING.xl,
    backgroundColor: DS_COLORS.BG_PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  commitmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: DS_SPACING.lg,
  },
  commitmentRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS.border,
  },
  commitmentCheckCard: {
    width: "100%",
    marginTop: DS_SPACING.xl,
    backgroundColor: DS_COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: DS_SPACING.cardPadding,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  commitmentCheckCardTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: DS_COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: DS_SPACING.md,
    textTransform: "uppercase" as const,
  },
  commitmentCheckCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: DS_SPACING.sm,
  },
  commitmentCheckCardLabel: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
  },
  commitmentCheckCardValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
  },
  commitmentLabel: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
  },
  commitmentValue: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
    textAlign: "right",
    flex: 1,
    marginLeft: DS_SPACING.lg,
  },
  commitmentWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.ERROR_BG,
    borderRadius: 12,
    padding: DS_SPACING.lg,
    marginTop: DS_SPACING.xl,
    width: "100%",
  },
  commitmentWarningText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.ERROR_RED,
    flex: 1,
  },
  commitmentCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: DS_SPACING.lg,
    gap: 12,
  },
  commitmentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  commitmentCheckboxChecked: {
    backgroundColor: DS_COLORS.DARK_GREEN_HEADER,
    borderColor: DS_COLORS.DARK_GREEN_HEADER,
  },
  commitmentCheckLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  commitmentConfirmBtn: {
    backgroundColor: DS_COLORS.PRESSED_ORANGE,
    borderRadius: 12,
    paddingVertical: 16,
    minHeight: 50,
    alignItems: "center",
    width: "100%",
    marginTop: DS_SPACING.xl,
  },
  commitmentConfirmDisabled: {
    backgroundColor: DS_COLORS.accent,
    opacity: 0.5,
  },
  commitmentConfirmText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  commitmentCancelBtn: {
    marginTop: DS_SPACING.lg,
    paddingVertical: DS_SPACING.sm,
  },
  commitmentCancelText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
  },
});
