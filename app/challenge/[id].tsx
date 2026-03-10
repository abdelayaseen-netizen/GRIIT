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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
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
  Share2,
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
import { getJoinedStarterIds } from "@/lib/starter-join";
import { useLeaveChallenge } from "@/lib/mutations";
import { formatTRPCError } from "@/lib/api";
import { FLAGS } from "@/lib/feature-flags";
import { ROUTES } from "@/lib/routes";
import { STARTER_CHALLENGES } from "@/mocks/starter-challenges";
import type { StarterChallenge, StarterTask } from "@/mocks/starter-challenges";
import type {
  ChallengeTaskFromApi,
  ChallengeDetailFromApi,
  ActiveChallengeFromApi,
  CheckinFromApi,
} from "@/types";
import Colors from "@/constants/colors";

const AVATAR_URLS = [
  "https://i.pravatar.cc/80?img=10",
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=15",
  "https://i.pravatar.cc/80?img=18",
  "https://i.pravatar.cc/80?img=22",
  "https://i.pravatar.cc/80?img=25",
];

interface DifficultyTheme {
  headerBg: string;
  headerGradientEnd: string;
  accent: string;
  accentLight: string;
  accentSoft: string;
  ctaBg: string;
  ctaText: string;
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
    headerBg: "#4A7FA5",
    headerGradientEnd: "#3A6F95",
    accent: "#4A7FA5",
    accentLight: "rgba(74,127,165,0.08)",
    accentSoft: "rgba(74,127,165,0.12)",
    ctaBg: "#4A7FA5",
    ctaText: "#FFFFFF",
    chipBorder: "rgba(74,127,165,0.25)",
    progressBg: "rgba(74,127,165,0.12)",
    progressFill: "#4A7FA5",
    missionIconBg: "rgba(74,127,165,0.10)",
    warningBg: "rgba(74,127,165,0.06)",
    warningText: "#3A6F95",
    warningBorder: "rgba(74,127,165,0.15)",
  },
  medium: {
    headerBg: "#4D8B6A",
    headerGradientEnd: "#3D7B5A",
    accent: "#4D8B6A",
    accentLight: "rgba(77,139,106,0.08)",
    accentSoft: "rgba(77,139,106,0.12)",
    ctaBg: "#4D8B6A",
    ctaText: "#FFFFFF",
    chipBorder: "rgba(77,139,106,0.25)",
    progressBg: "rgba(77,139,106,0.12)",
    progressFill: "#4D8B6A",
    missionIconBg: "rgba(77,139,106,0.10)",
    warningBg: "rgba(77,139,106,0.06)",
    warningText: "#3D7B5A",
    warningBorder: "rgba(77,139,106,0.15)",
  },
  hard: {
    headerBg: "#C86A3A",
    headerGradientEnd: "#B85A2A",
    accent: "#E87D4F",
    accentLight: "rgba(232,125,79,0.08)",
    accentSoft: "rgba(232,125,79,0.12)",
    ctaBg: "#E87D4F",
    ctaText: "#FFFFFF",
    chipBorder: "rgba(232,125,79,0.25)",
    progressBg: "rgba(232,125,79,0.12)",
    progressFill: "#E87D4F",
    missionIconBg: "rgba(232,125,79,0.10)",
    warningBg: "rgba(232,125,79,0.06)",
    warningText: "#C86A3A",
    warningBorder: "rgba(232,125,79,0.15)",
  },
  extreme: {
    headerBg: "#1C1C1E",
    headerGradientEnd: "#141414",
    accent: "#E87D4F",
    accentLight: "rgba(232,125,79,0.08)",
    accentSoft: "rgba(232,125,79,0.14)",
    ctaBg: "#E87D4F",
    ctaText: "#FFFFFF",
    chipBorder: "rgba(232,125,79,0.30)",
    progressBg: "rgba(232,125,79,0.15)",
    progressFill: "#E87D4F",
    missionIconBg: "rgba(232,125,79,0.12)",
    warningBg: "rgba(232,125,79,0.08)",
    warningText: "#E87D4F",
    warningBorder: "rgba(232,125,79,0.20)",
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

function InfoChip({ label, theme }: { label: string; theme: DifficultyTheme }) {
  return (
    <View style={[s.infoChip, { borderColor: theme.chipBorder, backgroundColor: "rgba(255,255,255,0.12)" }]}>
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
  task: StarterTask;
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
    windowStartOffsetMin: task.windowStartOffsetMin ?? 0,
    windowEndOffsetMin: task.windowEndOffsetMin ?? 60,
    hardWindowStartOffsetMin: null,
    hardWindowEndOffsetMin: null,
    timezoneMode: "USER_LOCAL",
    challengeTimezone: null,
  }) : null;

  return (
    <View style={[s.missionRow, !isLast && s.missionRowBorder]}>
      <View style={[s.missionIcon, { backgroundColor: isCompleted ? Colors.successLight : isJournal ? "rgba(99,102,241,0.10)" : theme.missionIconBg }]}>
        {isCompleted ? (
          <Check size={16} color={Colors.success} />
        ) : (
          <IconComp size={16} color={isJournal ? "#6366F1" : theme.accent} />
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
          <Check size={12} color={Colors.success} />
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
        >
          <Text style={[s.startActionText, { color: isJournal ? "#6366F1" : theme.accent }]}>Start</Text>
          <ChevronRight size={14} color={isJournal ? "#6366F1" : theme.accent} />
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
  useAuthGate(); // Join when guest → onboarding-questions; when logged in → handleJoin
  const { activeChallenge, todayCheckins, refetchTodayCheckins, refetchAll } = useApp();
  const currentUserId = user?.id ?? undefined;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ctaScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const isStarter = (id?.startsWith("starter-") || id?.startsWith("daily-")) ?? false;

  const starterChallenge = useMemo((): StarterChallenge | null => {
    if (!isStarter) return null;
    return STARTER_CHALLENGES.find((c) => c.id === id) ?? null;
  }, [id, isStarter]);

  const queryClient = useQueryClient();
  const challengeQuery = useQuery({
    queryKey: ["challenge", id],
    queryFn: () => trpcQuery("challenges.getById", { id: id! }),
    enabled: !!id && !isStarter,
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
  const referrerLabel = ref ? "Invited by a friend" : null;

  useEffect(() => {
    if (!ref || !currentUserId || !id || isStarter) return;
    trpcMutate("referrals.recordOpen", { referrerUserId: ref, challengeId: id }).catch((err) => {
      if (__DEV__) console.warn("[challenge] referrals.recordOpen failed:", err instanceof Error ? err.message : err);
    });
  }, [ref, currentUserId, id, isStarter]);

  const [starterJoined, setStarterJoined] = useState(false);
  const [joiningStarter] = useState(false);

  useEffect(() => {
    if (!isStarter || !id) return;
    getJoinedStarterIds().then((ids) => {
      if (ids.includes(id)) setStarterJoined(true);
    });
  }, [isStarter, id]);

  const challenge = useMemo(() => {
    if (isStarter && starterChallenge) {
      return {
        id: starterChallenge.id,
        title: starterChallenge.title,
        description: starterChallenge.description,
        short_hook: starterChallenge.short_hook,
        about: starterChallenge.about ?? starterChallenge.description,
        duration_type: starterChallenge.duration_type,
        duration_days: starterChallenge.duration_days,
        difficulty: starterChallenge.difficulty,
        theme_color: starterChallenge.theme_color,
        participants_count: starterChallenge.participants_count,
        active_today_count: starterChallenge.active_today_count ?? Math.floor(starterChallenge.participants_count * 0.4),
        hard_pick_rate: starterChallenge.hard_pick_rate ?? null,
        hard_finish_rate: starterChallenge.hard_finish_rate ?? null,
        completion_rate: starterChallenge.completion_rate ?? null,
        rules: starterChallenge.rules ?? [],
        fail_condition: starterChallenge.fail_condition ?? null,
        rules_text: null as string | null,
        visibility: starterChallenge.visibility ?? "public",
        is_daily: starterChallenge.is_daily,
        ends_at: starterChallenge.ends_at,
        category: starterChallenge.category,
        tasks: starterChallenge.tasks.map((t) => ({
          ...t,
          required: true,
        })),
      };
    }
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
  }, [isStarter, starterChallenge, remoteChallenge]);

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

  const isLoading = !isStarter && remoteLoading;
  const isJoinedRemote = activeChallenge?.challenge_id === id;
  const isJoined = isJoinedRemote || (isStarter && starterJoined);

  const userCurrentDay = useMemo(() => {
    if (!isJoined) return 0;
    if (isStarter) return 1;
    return (activeChallenge as ActiveChallengeFromApi | null)?.current_day_index ?? 1;
  }, [isJoined, isStarter, activeChallenge]);

  const userStreak = useMemo(() => {
    if (!isJoined) return 0;
    return Math.max(userCurrentDay, 1);
  }, [isJoined, userCurrentDay]);

  const handleJoin = useCallback(() => {
    if (!challenge || !id) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: ROUTES.COMMITMENT,
      params: {
        challengeId: id,
        isStarter: isStarter ? "1" : "0",
        title: challenge.title,
        duration: String(challenge.duration_days ?? 0),
        difficulty: challenge.difficulty ?? "medium",
      },
    } as never);
  }, [challenge, id, isStarter, router]);

  const handleCtaPressIn = useCallback(() => {
    Animated.spring(ctaScaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [ctaScaleAnim]);

  const handleCtaPressOut = useCallback(() => {
    Animated.spring(ctaScaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [ctaScaleAnim]);

  const handleMissionStart = useCallback((task: StarterTask) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const apiTask = task as ChallengeTaskFromApi;
    const needsPhotoProof = apiTask.require_photo_proof === true;

    if (task.type === "journal") {
      const params: Record<string, string> = { taskId: task.id };
      if (task.journalPrompt) params.prompt = task.journalPrompt;
      if (task.journalTypes && task.journalTypes.length > 0) params.types = JSON.stringify(task.journalTypes);
      params.captureMood = task.captureMood !== false ? "true" : "false";
      params.captureEnergy = task.captureEnergy !== false ? "true" : "false";
      params.captureBody = task.captureBodyState === true ? "true" : "false";
      if (task.wordLimitEnabled && task.wordLimitWords) {
        params.wordLimit = task.wordLimitWords.toString();
      }
      params.requirePhotoProof = needsPhotoProof ? "true" : "false";
      router.push({ pathname: ROUTES.TASK_JOURNAL, params } as never);
      return;
    }

    if (apiTask.type === "manual" && needsPhotoProof) {
      router.push({ pathname: ROUTES.TASK_PHOTO, params: { taskId: task.id } } as never);
      return;
    }
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
    const routeMap: Record<string, string> = {
      run: "/task/run",
      timer: "/task/timer",
      photo: "/task/photo",
    };
    const route = routeMap[task.type];
    if (route) {
      const params: Record<string, string> = { taskId: task.id };
      if (needsPhotoProof) params.requirePhotoProof = "true";
      router.push({ pathname: route, params } as never);
    }
  }, [router]);

  const allTasks = (challenge?.tasks ?? []) as StarterTask[];
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
      if (id && !isStarter && (isTeamChallenge || isSharedGoal)) {
        challengeQuery.refetch();
      }
    }, [id, isStarter, isJoined, isTeamChallenge, isSharedGoal, refetchTodayCheckins, challengeQuery])
  );

  const onRefresh = useCallback(async () => {
    if (!id) return;
    if (!isStarter) await challengeQuery.refetch();
    if (isJoined) await refetchTodayCheckins();
  }, [id, isStarter, isJoined, refetchTodayCheckins, challengeQuery]);

  const handleLeave = useCallback(() => {
    if (!id || isStarter || leavePending) return;
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
  }, [id, isStarter, leavePending, leaveMutation, refetchAll, refetchTodayCheckins, router]);

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

  if (remoteLoadError && !isStarter) {
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
          <TouchableOpacity onPress={() => router.back()} style={s.emptyBtn}>
            <Text style={s.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = isStarter ? joiningStarter : joinPending;
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
  const headerGradientColors = isDaily ? ["#2D6B4E", "#1A4A35"] as const : ["#1A1A1A", "#2D2D2D"] as const;
  const ctaBgColor = isDaily && !expired ? themeColors.success : theme.ctaBg;
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
          {/* HERO HEADER: green gradient 24h, dark gradient standard */}
          <LinearGradient colors={headerGradientColors} style={s.heroHeader}>
            <SafeAreaView edges={["top"]} style={s.heroSafeArea}>
              {/* Top Nav */}
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
                  <ChevronLeft size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={s.topNavTitle}>Challenge</Text>
                <TouchableOpacity
                  style={s.morePill}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => {
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
                  }}
                  accessible
                  accessibilityLabel="Share challenge"
                  accessibilityRole="button"
                >
                  <Share2 size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.morePill, { marginLeft: 8 }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => {
                    Alert.alert("Challenge", undefined, [
                      { text: "Cancel", style: "cancel" },
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
                  accessibilityLabel="More options"
                  accessibilityRole="button"
                >
                  <MoreHorizontal size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Title Block */}
              <View style={s.heroContent}>
                {isDaily && (
                  <View style={s.dailyLabel}>
                    <Zap size={11} color="rgba(255,255,255,0.9)" />
                    <Text style={s.dailyLabelText}>24-HOUR CHALLENGE</Text>
                  </View>
                )}
                <Text style={s.heroTitle}>{challenge.title}</Text>
                <Text style={s.heroTagline}>{challenge.short_hook || challenge.description}</Text>
                {referrerLabel ? (
                  <Text style={s.referrerLabel}>{referrerLabel}</Text>
                ) : null}

                {/* Info Chips */}
                <View style={s.chipRow}>
                  <InfoChip label={durationLabel} theme={theme} />
                  {isJoined && !isDaily && (
                    <>
                      <InfoChip label={`${userStreak}-day streak`} theme={theme} />
                      <InfoChip label={`Day ${userCurrentDay} / ${challenge.duration_days}`} theme={theme} />
                    </>
                  )}
                  {difficulty === "hard" || difficulty === "extreme" ? (
                    <InfoChip label={`${difficultyLabel} Mode`} theme={theme} />
                  ) : (
                    <InfoChip label={difficultyLabel} theme={theme} />
                  )}
                  {visibilityLabel && (
                    <View style={[s.infoChip, s.visibilityChip, { borderColor: theme.chipBorder }]}>
                      {visibilityIcon}
                      <Text style={s.infoChipText}>{visibilityLabel}</Text>
                    </View>
                  )}
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* BODY */}
          <View style={s.body}>

            {/* Team / Shared Goal sections (remote only) */}
            {!isStarter && id && (isTeamChallenge || isSharedGoal) && (
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

            {/* Social Proof */}
            <View style={s.socialSection}>
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

            {/* Stats Row */}
            {(challenge.hard_pick_rate != null || challenge.completion_rate != null) && (
              <View style={s.statsRow}>
                {challenge.hard_pick_rate != null && (
                  <View style={s.statItem}>
                    <Text style={[s.statNumber, { color: theme.accent }]}>{challenge.hard_pick_rate}%</Text>
                    <Text style={s.statLabel}>pick Hard Mode</Text>
                  </View>
                )}
                {challenge.hard_finish_rate != null && (
                  <View style={s.statItem}>
                    <Text style={[s.statNumber, { color: theme.accent }]}>{challenge.hard_finish_rate}%</Text>
                    <Text style={s.statLabel}>finish Hard Mode</Text>
                  </View>
                )}
                {challenge.completion_rate != null && !challenge.hard_pick_rate && (
                  <View style={s.statItem}>
                    <Text style={[s.statNumber, { color: theme.accent }]}>{challenge.completion_rate}%</Text>
                    <Text style={s.statLabel}>completion rate</Text>
                  </View>
                )}
              </View>
            )}

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
                      task={task}
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
                        <View style={[s.ruleBullet, isWarning && { backgroundColor: "rgba(185,28,28,0.10)" }]}>
                          {isWarning ? (
                            <AlertTriangle size={12} color="#B91C1C" />
                          ) : (
                            <Check size={12} color={theme.accent} />
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

            {isJoined && !isStarter && id && (
              <TouchableOpacity
                style={[s.leaveBtn, { borderWidth: 1, borderColor: themeColors.border, borderRadius: 12 }]}
                onPress={handleLeave}
                disabled={leavePending}
                activeOpacity={0.7}
                accessibilityLabel="Leave challenge"
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
        <View style={s.stickyFooter}>
          {isDaily && expired ? (
            <View style={s.disabledCta}>
              <Text style={s.disabledCtaText}>Expired</Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: ctaScaleAnim }] }}>
              <TouchableOpacity
                style={[s.ctaButton, { backgroundColor: ctaBgColor }]}
                onPress={isJoined ? () => router.push(ROUTES.TABS as never) : user ? () => handleJoin() : () => router.push({ pathname: ROUTES.ONBOARDING_QUESTIONS, params: id ? { challengeId: id } : undefined } as never)}
                onPressIn={handleCtaPressIn}
                onPressOut={handleCtaPressOut}
                disabled={joinDisabled}
                activeOpacity={0.85}
                testID="join-challenge-button"
              >
                {isPending ? (
                  <ActivityIndicator color={theme.ctaText} />
                ) : (
                  <Text style={[s.ctaText, { color: theme.ctaText }]}>{ctaLabel}</Text>
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
    </View>
  );
}

const SCREEN_BG = "#FAF8F6";

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  skeletonHeader: {
    height: 260,
    backgroundColor: "#E0E0E0",
  },
  skeletonBody: {
    padding: 20,
  },
  skeletonChipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    marginTop: 16,
  },
  skeletonChip: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ECECEC",
  },
  skeletonBlock: {
    height: 80,
    borderRadius: 14,
    backgroundColor: "#ECECEC",
    marginBottom: 20,
  },
  skeletonMission: {
    height: 64,
    borderRadius: 12,
    backgroundColor: "#ECECEC",
    marginBottom: 12,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 10,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFF",
  },

  heroHeader: {
    paddingBottom: 28,
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
    paddingTop: 8,
    marginBottom: 20,
  },
  backPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  topNavTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.3,
  },
  morePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContent: {
    paddingTop: 4,
  },
  dailyLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  dailyLabelText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 6,
  },
  heroTagline: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 21,
    marginBottom: 18,
  },
  referrerLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  visibilityChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  infoChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  infoChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  countdownCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  countdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
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
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  progressValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    fontVariant: ["tabular-nums"] as const,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 10,
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
    color: Colors.text.secondary,
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

  socialSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    letterSpacing: -0.1,
  },
  socialSecondary: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: Colors.text.secondary,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    textAlign: "center" as const,
  },

  missionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  missionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  missionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  missionIcon: {
    width: 40,
    height: 40,
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
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  journalPillText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#6366F1",
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
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    letterSpacing: -0.1,
  },
  missionTitleDone: {
    color: Colors.text.tertiary,
    textDecorationLine: "line-through" as const,
  },
  missionMeta: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: Colors.text.tertiary,
    marginTop: 3,
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
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.success,
  },

  rulesSection: {
    marginBottom: 24,
  },
  rulesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  ruleRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  ruleBullet: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(77,139,106,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  ruleText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text.primary,
    flex: 1,
  },
  ruleTextWarning: {
    color: "#B91C1C",
    fontWeight: "600" as const,
  },

  aboutSection: {
    marginBottom: 24,
  },
  aboutText: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: Colors.text.secondary,
    lineHeight: 23,
    letterSpacing: -0.1,
  },

  leaveBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  leaveBtnText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#B91C1C",
    opacity: 0.7,
  },

  bottomSpacer: {
    height: 20,
  },

  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "web" ? 28 : 16,
    backgroundColor: SCREEN_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
  },
  ctaButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingVertical: 17,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    width: Platform.OS === "web" ? 400 : undefined,
    alignSelf: "stretch" as const,
    minWidth: 320,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700" as const,
    letterSpacing: -0.1,
  },
  inviteLink: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  inviteLinkText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  ctaMicro: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  disabledCta: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    borderRadius: 14,
    backgroundColor: "#ECECEC",
    alignSelf: "stretch" as const,
  },
  disabledCtaText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text.muted,
  },
});
