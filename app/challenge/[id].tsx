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
  Image,
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
  TrendingUp,
  Clock,
  Users,
  Lock,
} from "lucide-react-native";
import { formatTimeHHMM, getTimeWindowState } from "@/lib/time-enforcement";
import { formatTimeRemainingHMS, isChallengeExpired } from "@/lib/challenge-timer";
import * as Haptics from "expo-haptics";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGate } from "@/contexts/AuthGateContext";
import { useTheme } from "@/contexts/ThemeContext";
import TeamStatusHeader from "@/components/challenge/TeamStatusHeader";
import TeamMemberList, { type TeamMemberForList } from "@/components/challenge/TeamMemberList";
import SharedGoalProgress from "@/components/challenge/SharedGoalProgress";
import { track } from "@/lib/analytics";
import { useLeaveChallenge } from "@/lib/mutations";
import { formatTRPCError } from "@/lib/api";
import { FLAGS } from "@/lib/feature-flags";
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
} from "@/lib/design-system";

const AVATAR_URLS = [
  "https://i.pravatar.cc/80?img=10",
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=15",
  "https://i.pravatar.cc/80?img=18",
  "https://i.pravatar.cc/80?img=22",
  "https://i.pravatar.cc/80?img=25",
];

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
    headerBg: "#1B5E20",
    headerGradientEnd: "#1B5E20",
    accent: "#2E7D32",
    accentLight: "#E8F5E9",
    accentSoft: "rgba(46,125,50,0.12)",
    ctaBg: "#2E7D32",
    ctaText: "#FFFFFF",
    backArrowColor: "#FFFFFF",
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(46,125,50,0.12)",
    progressFill: "#2E7D32",
    missionIconBg: "#E8F5E9",
    warningBg: "rgba(46,125,50,0.06)",
    warningText: "#2E7D32",
    warningBorder: "rgba(46,125,50,0.15)",
  },
  medium: {
    headerBg: "#1B5E20",
    headerGradientEnd: "#1B5E20",
    accent: "#2E7D32",
    accentLight: "#E8F5E9",
    accentSoft: "rgba(46,125,50,0.12)",
    ctaBg: "#2E7D32",
    ctaText: "#FFFFFF",
    backArrowColor: "#FFFFFF",
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(46,125,50,0.12)",
    progressFill: "#2E7D32",
    missionIconBg: "#E8F5E9",
    warningBg: "rgba(46,125,50,0.06)",
    warningText: "#2E7D32",
    warningBorder: "rgba(46,125,50,0.15)",
  },
  hard: {
    headerBg: "#1A1A2E",
    headerGradientEnd: "#1A1A2E",
    accent: "#E8733A",
    accentLight: "#FFF0E8",
    accentSoft: "rgba(232,115,58,0.14)",
    ctaBg: "#E8733A",
    ctaText: "#FFFFFF",
    backArrowColor: "#E8733A",
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(232,115,58,0.15)",
    progressFill: "#E8733A",
    missionIconBg: "#FFF0E8",
    warningBg: "rgba(232,115,58,0.08)",
    warningText: "#E8733A",
    warningBorder: "rgba(232,115,58,0.20)",
  },
  extreme: {
    headerBg: "#1A1A2E",
    headerGradientEnd: "#1A1A2E",
    accent: "#E8733A",
    accentLight: "#FFF0E8",
    accentSoft: "rgba(232,115,58,0.14)",
    ctaBg: "#E8733A",
    ctaText: "#FFFFFF",
    backArrowColor: "#E8733A",
    chipBorder: "rgba(255,255,255,0.35)",
    progressBg: "rgba(232,115,58,0.15)",
    progressFill: "#E8733A",
    missionIconBg: "#FFF0E8",
    warningBg: "rgba(232,115,58,0.08)",
    warningText: "#E8733A",
    warningBorder: "rgba(232,115,58,0.20)",
  },
};

function getTheme(difficulty: string): DifficultyTheme {
  return DIFFICULTY_THEMES[difficulty] || DIFFICULTY_THEMES.medium;
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

const CTA_LABELS: Record<string, { join: string; active: string }> = {
  easy: { join: "Commit", active: "Continue Today" },
  medium: { join: "Commit", active: "Continue Today" },
  hard: { join: "Start", active: "Continue Today" },
  extreme: { join: "Start", active: "Continue Today" },
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
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
    <View style={[s.countdownCard, { borderColor: theme.chipBorder }]}>
      <View style={s.countdownLeft}>
        <Animated.View style={[s.liveDot, { backgroundColor: theme.accent, opacity: pulseAnim }]} />
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

function SocialAvatars() {
  return (
    <View style={s.avatarStack}>
      {AVATAR_URLS.slice(0, 5).map((url, i) => (
        <Image
          key={i}
          source={{ uri: url }}
          style={[
            s.stackAvatar,
            { marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i },
          ]}
        />
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
}: {
  task: ChallengeTaskFromApi & { journalPrompt?: string; journalTypes?: string[]; captureMood?: boolean; captureEnergy?: boolean; captureBodyState?: boolean; wordLimitEnabled?: boolean; wordLimitWords?: number | null; timeEnforcementEnabled?: boolean; anchorTimeLocal?: string; verification_method?: string | null };
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
}) {
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
    ? "#F5ECFF"
    : task.type === "run"
    ? "#FFEFEB"
    : theme.missionIconBg;
  const iconColor = isCompleted ? DS_COLORS.success : isJournal ? "#8E44AD" : task.type === "run" ? "#FF6B35" : theme.accent;
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
          {isJournal && (
            <View style={s.journalPill}>
              <Text style={s.journalPillText}>Journal</Text>
            </View>
          )}
          {hasTimeEnforcement && (
            <View style={s.timePill}>
              <Clock size={9} color="#0EA5E9" />
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
          <Text style={[s.startActionText, { color: isJournal ? "#6B8BFF" : theme.accent }]}>Start</Text>
          <ChevronRight size={14} color={isJournal ? "#6B8BFF" : theme.accent} />
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
  const currentUserId = user?.id ?? undefined;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const queryClient = useQueryClient();
  const challengeQuery = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery("challenges.getById", { id: id! }),
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
  const [commitmentJoining, setCommitmentJoining] = useState(false);
  const insets = useSafeAreaInsets();
  const referrerLabel = ref ? "Invited by a friend" : null;

  useEffect(() => {
    if (!ref || !currentUserId || !id) return;
    trpcMutate("referrals.recordOpen", { referrerUserId: ref, challengeId: id }).catch((err) => {
      if (__DEV__) console.warn("[challenge] referrals.recordOpen failed:", err instanceof Error ? err.message : err);
    });
  }, [ref, currentUserId, id]);

  const challenge = useMemo(() => {
    if (remoteChallenge) {
      const d = remoteChallenge as Record<string, unknown>;
      return {
        ...d,
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
    } catch {
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

  const isLoading = remoteLoading;
  const isJoinedRemote = activeChallenge?.challenge_id === id;
  const isJoined = isJoinedRemote;

  const userCurrentDay = useMemo(() => {
    if (!isJoined) return 0;
    return (activeChallenge as ActiveChallengeFromApi | null)?.current_day_index ?? 1;
  }, [isJoined, activeChallenge]);

  const userStreak = useMemo(() => {
    if (!isJoined) return 0;
    return Math.max(userCurrentDay, 1);
  }, [isJoined, userCurrentDay]);

  const handleJoin = useCallback(() => {
    if (!challenge || !id) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCommitmentModal(true);
  }, [challenge, id]);

  const handleCommitmentConfirm = useCallback(async () => {
    if (!id || commitmentJoining) return;
    setCommitmentJoining(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await trpcMutate("challenges.join", { challengeId: id });
      try {
        await trpcMutate("referrals.markJoinedChallenge", { challengeId: id });
      } catch { /* best-effort */ }
      await refetchAll();
      setShowCommitmentModal(false);
      router.replace(ROUTES.TABS as never);
      Alert.alert("You're in!", "Your challenge is under Active challenges. Secure your day to build your streak.", [
        { text: "OK" },
      ]);
    } catch (err: unknown) {
      const { title, message } = formatTRPCError(err);
      Alert.alert(title, message);
    } finally {
      setCommitmentJoining(false);
    }
  }, [id, commitmentJoining, refetchAll, router]);

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
        Alert.alert(
          "Coming soon",
          "Location check-in verification is not available yet. Use another task type for now."
        );
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
  }, [router, activeChallenge?.id]);

  const allTasks = (challenge?.tasks ?? []) as ChallengeTaskFromApi[];
  const isThisActiveChallenge = !!(
    activeChallenge?.challenges?.id && challenge?.id && String(activeChallenge.challenges.id) === String(challenge.id)
  );
  const activeChallengeId = activeChallenge?.id as string | undefined;
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
              router.replace(ROUTES.TABS as never);
            } catch (e: unknown) {
              const { title, message } = formatTRPCError(e);
              Alert.alert(title, message);
            }
          },
        },
      ]
    );
  }, [id, leavePending, leaveMutation, refetchAll, refetchTodayCheckins, router]);

  if (!id) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={s.emptyBtn}>
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.loadingContainer, { backgroundColor: themeColors.background }]}>
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
      <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Couldn&apos;t load challenge</Text>
          <Text style={[s.emptySubtext, { color: themeColors.text.secondary }]}>Check your connection and try again.</Text>
          <TouchableOpacity onPress={() => challengeQuery.refetch()} style={s.emptyBtn}>
            <Text style={s.emptyBtnText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={[s.emptyBtn, { marginTop: 8 }]}>
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: themeColors.background }]} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Challenge not found</Text>
          <TouchableOpacity onPress={() => router.push(ROUTES.TABS_DISCOVER as never)} style={s.emptyBtn}>
            <Text style={s.emptyBtnText}>Browse challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={[s.emptyBtn, { marginTop: 12 }]}>
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = joinPending;
  const difficulty = (challenge.difficulty || "medium") as string;
  const theme = getTheme(difficulty);
  const rules = challenge.rules || [];
  const failCondition = challenge.fail_condition;

  const durationLabel = isDaily ? "24 hours" : `${challenge.duration_days} days`;
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const ctaLabels = CTA_LABELS[difficulty] || CTA_LABELS.medium;
  const ctaLabel = isDaily
    ? expired ? "Expired" : "Accept Challenge"
    : isJoined ? ctaLabels.active : ctaLabels.join;
  const joinDisabled = isPending || (isDaily && expired);
  const headerGradientColors = [DS_COLORS.accent, DS_COLORS.accentDark] as const;
  const ctaBgColor = isDaily && !expired ? themeColors.success : DS_COLORS.accent;
  const countdownTheme = isDaily ? { ...theme, accent: themeColors.success } : theme;

  const challengeVisibility = (challenge.visibility || "public") as string;
  const visibilityLabel = challengeVisibility === "friends" ? "Friends" : challengeVisibility === "private" ? "Only me" : null;
  const visibilityIcon = challengeVisibility === "friends"
    ? <Users size={11} color="#fff" />
    : challengeVisibility === "private"
    ? <Lock size={11} color="#fff" />
    : null;

  const durationDays = challenge?.duration_days ?? 0;
  const progressPercent = isJoined && durationDays > 0
    ? Math.min((userCurrentDay / durationDays) * 100, 100)
    : 0;

  return (
    <View style={[s.container, { backgroundColor: themeColors.background }]}>
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
          {/* HERO: warm orange, rounded bottom, premium spacing */}
          <LinearGradient colors={headerGradientColors} style={s.heroHeader}>
            <SafeAreaView edges={["top"]} style={s.heroSafeArea}>
              <View style={s.topNav}>
                <TouchableOpacity
                  style={s.backPill}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessible
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                >
                  <ChevronLeft size={24} color={DS_COLORS.white} />
                </TouchableOpacity>
                <Text style={s.topNavTitle}>Challenge</Text>
                <TouchableOpacity
                  style={s.morePill}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => {
                    Alert.alert("Challenge", undefined, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Share",
                        onPress: () => {
                          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                          ).catch((err) => {
                            if (__DEV__) console.warn("[challenge] share failed:", err instanceof Error ? err.message : err);
                          });
                        },
                      },
                      {
                        text: "Invite friends",
                        onPress: () => {
                          import("@/lib/share").then(({ inviteToChallenge }) =>
                            inviteToChallenge({ name: challenge.title, id: id ?? "" }, currentUserId)
                          ).catch((err) => {
                            if (__DEV__) console.warn("[challenge] invite failed:", err instanceof Error ? err.message : err);
                          });
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
                {isDaily ? (
                  <View style={s.dailyLabel}>
                    <Zap size={11} color="rgba(255,255,255,0.9)" />
                    <Text style={s.dailyLabelText}>24-HOUR CHALLENGE</Text>
                  </View>
                ) : (
                  <Text style={s.heroEyebrow}>CHALLENGE</Text>
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
                  {difficulty === "hard" || difficulty === "extreme" ? (
                    <InfoChip label={`${difficultyLabel} Mode`} theme={theme} dark />
                  ) : (
                    <InfoChip label={difficultyLabel} theme={theme} dark />
                  )}
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
          <View style={s.body}>

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
                          Alert.alert("Error", (e as Error)?.message ?? "Could not start challenge.");
                        }
                      }}
                      onInvite={() => {
                        import("@/lib/share").then(({ inviteToChallenge }) =>
                          inviteToChallenge({ name: challenge.title, id: id ?? "" }, currentUserId)
                        ).catch((err) => {
                          if (__DEV__) console.warn("[challenge] inviteToChallenge failed:", err instanceof Error ? err.message : err);
                        });
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
                <AlertTriangle size={14} color="#B91C1C" />
                <Text style={s.expiredText}>This challenge has expired</Text>
              </View>
            )}

            {/* Progress Section (joined only; hidden when team failed) */}
            {isJoined && !isDaily && !(isTeamChallenge && runStatus === "failed") && (
              <View style={s.progressSection}>
                <View style={s.progressHeader}>
                  <Text style={s.sectionLabel}>Progress</Text>
                  <Text style={s.progressValue}>{userCurrentDay}/{challenge.duration_days}</Text>
                </View>
                <View style={[s.progressBarBg, { backgroundColor: theme.progressBg }]}>
                  <View style={[s.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.progressFill }]} />
                </View>
                <View style={[s.streakAlert, { backgroundColor: theme.warningBg, borderColor: theme.warningBorder }]}>
                  <TrendingUp size={13} color={theme.warningText} />
                  <Text style={[s.streakAlertText, { color: theme.warningText }]}>
                    Complete today to keep streak
                  </Text>
                </View>
                {failCondition && (
                  <View style={[s.failAlert, { backgroundColor: "rgba(185,28,28,0.06)", borderColor: "rgba(185,28,28,0.15)" }]}>
                    <Shield size={13} color="#B91C1C" />
                    <Text style={s.failAlertText}>{failCondition}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Participants summary card */}
            <View style={s.participantStatsCard}>
              <View style={s.socialRow}>
                <SocialAvatars />
                <View style={s.socialTextWrap}>
                  <Text style={s.socialPrimary}>
                    {formatCount(challenge.participants_count ?? 0)} in this challenge
                  </Text>
                  {(challenge.active_today_count ?? 0) > 0 && (
                    <Text style={s.socialSecondary}>
                      {formatCount(challenge.active_today_count ?? 0)} active today
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Progress stats card (two metrics, divider between) */}
            {(() => {
              const items: { value: number; label: string }[] = [];
              if (challenge.hard_pick_rate != null) items.push({ value: challenge.hard_pick_rate, label: "pick Hard Mode" });
              if (challenge.hard_finish_rate != null) items.push({ value: challenge.hard_finish_rate, label: "finish Hard Mode" });
              if (challenge.completion_rate != null && challenge.hard_pick_rate == null) items.push({ value: challenge.completion_rate, label: "completion rate" });
              if (items.length === 0) return null;
              return (
                <View style={s.progressStatsCard}>
                  {items.map((item, i) => (
                    <React.Fragment key={item.label}>
                      {i > 0 && <View style={s.progressStatDivider} />}
                      <View style={s.progressStatItem}>
                        <Text style={s.progressStatValue}>{item.value}%</Text>
                        <Text style={s.progressStatLabel}>{item.label}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              );
            })()}

            {/* Today's Missions (hidden when team failed or shared-goal-only) */}
            {!(isTeamChallenge && runStatus === "failed") && (
            <View style={s.missionsSection}>
              <Text style={s.sectionTitle}>Today&apos;s Missions</Text>
              <View style={s.missionsCard}>
                {allTasks.map((task, index) => {
                  const checkin = todayCheckins.find((c: CheckinFromApi) => c.task_id === task.id);
                  const isCompleted =
                    isJoinedRemote &&
                    todayCheckins.some(
                      (c: CheckinFromApi) => c.task_id === task.id && c.status === "completed"
                    );
                  return (
                    <MissionRow
                      key={task.id}
                      task={task as ChallengeTaskFromApi & { journalPrompt?: string; journalTypes?: string[]; captureMood?: boolean; captureEnergy?: boolean; captureBodyState?: boolean; wordLimitEnabled?: boolean; wordLimitWords?: number | null; timeEnforcementEnabled?: boolean; anchorTimeLocal?: string; verification_method?: string | null }}
                      theme={theme}
                      isCompleted={isCompleted}
                      isLast={index === allTasks.length - 1}
                      onStart={() => handleMissionStart(task)}
                      checkin={checkin}
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
                        } catch {
                          Alert.alert("Verification failed", "No matching Strava activity found for today.");
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
                        <View style={[s.ruleBullet, isWarning && s.ruleBulletWarning]}>
                          {isWarning ? (
                            <AlertTriangle size={12} color="#F44336" />
                          ) : (
                            <Check size={12} color="#4CAF50" />
                          )}
                        </View>
                        <Text style={[s.ruleText, isWarning && s.ruleTextWarning]}>{rule}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* About */}
            {challenge.about && (
              <View style={s.aboutSection}>
                <Text style={s.sectionTitle}>About</Text>
                <Text style={s.aboutText}>{challenge.about}</Text>
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

            <View style={s.bottomSpacer} />
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
                onPress={isJoined ? () => router.push(ROUTES.TABS as never) : user ? () => handleJoin() : async () => { if (id) await setPendingChallengeId(id); showGate("join"); }}
                onPressIn={handleCtaPressIn}
                onPressOut={handleCtaPressOut}
                disabled={joinDisabled}
                activeOpacity={0.85}
                testID="join-challenge-button"
                accessibilityLabel="Join this challenge"
                accessibilityRole="button"
              >
                {isPending ? (
                  <ActivityIndicator color={DS_COLORS.white} />
                ) : (
                  <Text style={s.ctaText}>{ctaLabel}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
          {isJoined && (
            <TouchableOpacity
              style={s.inviteLink}
              onPress={() => {
                track({ name: "invite_shared", challengeId: id ?? undefined, source: "challenge_detail" });
                import("@/lib/share").then(({ inviteToChallenge }) =>
                  inviteToChallenge({ name: challenge.title, id: id ?? "" }, currentUserId)
                ).catch((err) => {
                  if (__DEV__) console.warn("[challenge] invite failed:", err instanceof Error ? err.message : err);
                });
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
        />
        <View style={[s.commitmentCenter, { paddingBottom: insets.bottom + 24 }]}>
          <View style={s.commitmentCard}>
            <TouchableOpacity
              style={s.commitmentClose}
              onPress={() => !commitmentJoining && setShowCommitmentModal(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={s.commitmentCloseText}>✕</Text>
            </TouchableOpacity>
            <View style={s.commitmentShieldWrap}>
              <Shield size={28} color="#E8733A" strokeWidth={2} />
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
                <Text style={[s.commitmentValue, { color: theme.accent, fontWeight: "600" }]}>
                  {difficultyLabel}{difficulty === "hard" || difficulty === "extreme" ? " Mode" : ""}
                </Text>
              </View>
            </View>
            <View style={s.commitmentWarning}>
              <AlertTriangle size={14} color="#E8733A" style={{ marginRight: 8 }} />
              <Text style={s.commitmentWarningText}>One missed day resets progress.</Text>
            </View>
            <TouchableOpacity
              style={[s.commitmentConfirmBtn, commitmentJoining && s.commitmentConfirmDisabled]}
              onPress={handleCommitmentConfirm}
              disabled={commitmentJoining}
              activeOpacity={0.85}
            >
              {commitmentJoining ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.commitmentConfirmText}>Confirm Commitment</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.commitmentCancelBtn}
              onPress={() => !commitmentJoining && setShowCommitmentModal(false)}
              disabled={commitmentJoining}
            >
              <Text style={s.commitmentCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 160 },

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
    paddingBottom: DS_SPACING.xxl + DS_SPACING.lg,
    borderBottomLeftRadius: DS_RADIUS.card,
    borderBottomRightRadius: DS_RADIUS.card,
  },
  heroSafeArea: {
    paddingHorizontal: DS_SPACING.screenHorizontal,
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
  topNavTitle: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.white,
    letterSpacing: 0.5,
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
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: DS_TYPOGRAPHY.pageTitleLarge.fontSize,
    fontWeight: DS_TYPOGRAPHY.pageTitleLarge.fontWeight,
    color: DS_COLORS.white,
    letterSpacing: DS_TYPOGRAPHY.pageTitleLarge.letterSpacing,
    lineHeight: DS_TYPOGRAPHY.pageTitleLarge.lineHeight,
    marginBottom: DS_SPACING.sm,
  },
  heroTagline: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "400" as const,
    color: "rgba(255,255,255,0.8)",
    lineHeight: DS_TYPOGRAPHY.secondary.lineHeight,
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
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingBottom: 140,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },

  countdownCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    paddingHorizontal: DS_SPACING.cardPadding,
    paddingVertical: DS_SPACING.lg,
    marginBottom: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
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
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "500" as const,
    color: DS_COLORS.textSecondary,
  },
  countdownValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    fontVariant: ["tabular-nums"] as const,
    letterSpacing: 0.5,
  },

  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  expiredText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#B91C1C",
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
    color: "#B91C1C",
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
    color: "#fff",
  },

  participantStatsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.lg,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  progressStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
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
    fontSize: DS_TYPOGRAPHY.statValue.fontSize,
    fontWeight: DS_TYPOGRAPHY.statValue.fontWeight,
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
    borderColor: "#FFFFFF",
  },
  socialTextWrap: {
    flex: 1,
  },
  socialPrimary: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    letterSpacing: -0.1,
  },
  socialSecondary: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
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
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
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
    width: 44,
    height: 44,
    borderRadius: 12,
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
    backgroundColor: "#D1C4E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  journalPillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#7E57C2",
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
    color: "#0EA5E9",
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
    color: "#059669",
    fontWeight: "500" as const,
  },
  missionMetaMissed: {
    color: "#DC2626",
    fontWeight: "500" as const,
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
    marginBottom: DS_SPACING.xxl,
  },
  aboutText: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: "400" as const,
    color: DS_COLORS.textSecondary,
    lineHeight: 24,
    letterSpacing: -0.1,
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

  bottomSpacer: {
    height: DS_SPACING.xl,
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
    minHeight: DS_MEASURES.ctaHeight,
    paddingVertical: DS_SPACING.lg,
    borderRadius: DS_RADIUS.button,
    width: Platform.OS === "web" ? 400 : undefined,
    alignSelf: "stretch" as const,
    minWidth: 280,
  },
  ctaText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: DS_TYPOGRAPHY.button.fontWeight,
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
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "400" as const,
    color: DS_COLORS.textMuted,
    marginTop: DS_SPACING.sm,
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
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.xxl,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DS_COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: DS_SPACING.sm,
  },
  commitmentTitle: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginTop: DS_SPACING.xl,
    paddingHorizontal: DS_SPACING.sm,
  },
  commitmentDetails: {
    width: "100%",
    marginTop: DS_SPACING.xl,
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
    backgroundColor: DS_COLORS.accentSoft,
    borderRadius: DS_RADIUS.input / 2,
    padding: DS_SPACING.lg,
    marginTop: DS_SPACING.xl,
    width: "100%",
  },
  commitmentWarningText: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "500",
    color: DS_COLORS.accent,
    flex: 1,
  },
  commitmentConfirmBtn: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.button,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
    width: "100%",
    marginTop: DS_SPACING.xl,
  },
  commitmentConfirmDisabled: {
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
