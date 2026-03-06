import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  RefreshControl,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Flame,
  Trophy,
  Target,
  LogOut,
  Settings,
  Pencil,
  Shield,
  Zap,
  ChevronRight,
  Lock,
  Award,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Star,
  TrendingUp,
  Globe,
  UserCheck,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { useAuthGate, useIsGuest } from "@/contexts/AuthGateContext";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/colors";
import { Skeleton } from "@/components/SkeletonLoader";

const LOADING_TIMEOUT_MS = 10000;

interface Achievement {
  id: string;
  title: string;
  icon: React.ReactNode;
  earned: boolean;
  color: string;
}

function StatCard({
  icon,
  value,
  label,
  index,
  onPress,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  index: number;
  onPress?: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={styles.statCardTouch}
    >
      <Animated.View
        style={[
          styles.statCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.statIconWrap}>{icon}</View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function AchievementBadge({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View
      style={[
        styles.achievementBadge,
        !achievement.earned && styles.achievementBadgeLocked,
        { opacity: fadeAnim },
      ]}
    >
      <View
        style={[
          styles.achievementBadgeIcon,
          {
            backgroundColor: achievement.earned
              ? achievement.color + "14"
              : "#F0EEEB",
          },
        ]}
      >
        {achievement.earned ? (
          achievement.icon
        ) : (
          <Lock size={16} color={Colors.text.muted} />
        )}
      </View>
      <Text
        style={[
          styles.achievementBadgeText,
          !achievement.earned && styles.achievementBadgeTextLocked,
        ]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
    </Animated.View>
  );
}

function DisciplineScoreCard({
  score,
  tier,
  daysSecured,
}: {
  score: number;
  tier: string;
  daysSecured: number;
}) {
  return (
    <View style={styles.disciplineScoreCard}>
      <View style={styles.disciplineScoreHeader}>
        <Text style={styles.disciplineScoreLabel}>DISCIPLINE SCORE</Text>
        <View style={styles.disciplineScoreTierBadge}>
          <View style={styles.disciplineScoreTierDot} />
          <Text style={styles.disciplineScoreTierText}>{tier}</Text>
        </View>
      </View>
      <Text style={styles.disciplineScoreValue}>{score}</Text>
      <Text style={styles.disciplineScoreDaysValue}>{daysSecured}</Text>
      <Text style={styles.disciplineScoreDaysLabel}>DAYS SECURED</Text>
      <Text style={styles.disciplineScoreTierFooter}>{tier} tier</Text>
    </View>
  );
}

function TierProgress({ tier, ptsToNext, nextTierName }: { tier: string; ptsToNext: number; nextTierName: string | null }) {
  const nextLabel = nextTierName ? `pts to ${nextTierName}` : "max tier";
  const denom = 7;
  const progress = nextTierName && ptsToNext > 0 ? Math.min(1, (denom - Math.min(ptsToNext / 10, denom)) / denom) : 1;
  return (
    <View style={styles.tierProgressWrap}>
      <View style={styles.tierPill}>
        <Flame size={14} color={Colors.accent} />
        <Text style={styles.tierPillText}>{tier}</Text>
      </View>
      <View style={styles.tierBarTrack}>
        <View style={[styles.tierBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.tierPtsToNext}>{nextTierName && ptsToNext > 0 ? `${ptsToNext} ${nextLabel}` : nextLabel}</Text>
    </View>
  );
}

function ActivityCalendar({ daysSecured }: { daysSecured: number }) {
  const months = ["Dec", "Jan", "Feb"];
  const totalCells = 7 * 12; // ~12 weeks, 7 days
  const filledCount = Math.min(daysSecured, totalCells);
  return (
    <View style={styles.activitySection}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>Activity</Text>
        <Text style={styles.activitySubtitle}>{daysSecured} day{daysSecured !== 1 ? "s" : ""} secured</Text>
      </View>
      <View style={styles.activityGrid}>
        <View style={styles.activityGridMonths}>
          {months.map((m) => (
            <Text key={m} style={styles.activityGridMonthLabel}>{m}</Text>
          ))}
        </View>
        <View style={styles.activityGridCells}>
          {Array.from({ length: totalCells }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.activityCell,
                i < filledCount && styles.activityCellFilled,
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.activityLegend}>
        <Text style={styles.activityLegendText}>Less</Text>
        <View style={styles.activityLegendSquares}>
          {["22", "44", "88", "E8"].map((alpha, i) => (
            <View
              key={i}
              style={[styles.activityLegendSquare, { backgroundColor: Colors.success + alpha }]}
            />
          ))}
        </View>
        <Text style={styles.activityLegendText}>More</Text>
      </View>
    </View>
  );
}

function DisciplineGrowthCard({ score, previousScore }: { score: number; previousScore: number }) {
  const change = score - previousScore;
  const trendPositive = change >= 0;
  return (
    <View style={styles.disciplineGrowthCard}>
      <View style={styles.disciplineGrowthHeader}>
        <View style={styles.disciplineGrowthTitleRow}>
          <TrendingUp size={18} color={Colors.text.primary} />
          <Text style={styles.disciplineGrowthTitle}>Discipline Growth</Text>
        </View>
        <View style={styles.disciplineGrowthPill}>
          <Text style={styles.disciplineGrowthPillText}>30 days</Text>
        </View>
      </View>
      <View style={styles.disciplineGrowthMetrics}>
        <View style={styles.disciplineGrowthCol}>
          <Text style={styles.disciplineGrowthLabel}>30 DAYS AGO</Text>
          <Text style={styles.disciplineGrowthValue}>{previousScore}</Text>
        </View>
        <TrendingUp size={20} color={Colors.success} style={{ marginHorizontal: 8 }} />
        <View style={styles.disciplineGrowthCol}>
          <Text style={styles.disciplineGrowthLabel}>CURRENT</Text>
          <View style={styles.disciplineGrowthCurrentRow}>
            <Text style={styles.disciplineGrowthValue}>{score}</Text>
            {change !== 0 && (
              <View style={[styles.disciplineGrowthChangePill, trendPositive && styles.disciplineGrowthChangePillPositive]}>
                <Text style={[styles.disciplineGrowthChangeText, trendPositive && styles.disciplineGrowthChangeTextPositive]}>
                  {trendPositive ? "+" : ""}{change}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.disciplineGrowthBarTrack}>
        <View style={[styles.disciplineGrowthBarFill, { width: `${Math.min(100, (score / 100) * 100)}%` }]} />
      </View>
    </View>
  );
}

function StreakAtRiskAlert({ daysMissed }: { daysMissed: number }) {
  return (
    <View style={styles.streakAtRiskCard}>
      <View style={styles.streakAtRiskDot} />
      <View style={styles.streakAtRiskContent}>
        <Text style={styles.streakAtRiskTitle}>Streak at risk</Text>
        <Text style={styles.streakAtRiskSubtitle}>
          {daysMissed} day{daysMissed !== 1 ? "s" : ""} missed. Secure today to recover.
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const isGuest = useIsGuest();
  const { showGate } = useAuthGate();
  const {
    profile,
    profileLoading,
    profileMissing,
    autoCreateError,
    stats,
    isLoading,
    isError,
    initialFetchDone,
    refetchAll,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerFade = useRef(new Animated.Value(0)).current;

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.guestIdentityCard}>
            <Lock size={32} color={Colors.text.tertiary} style={{ marginBottom: 12 }} />
            <Text style={styles.guestIdentityTitle}>Create your identity</Text>
            <Text style={styles.guestIdentitySub}>Sign up to build your profile, track streaks, and earn ranks.</Text>
            <TouchableOpacity
              style={styles.guestIdentityCta}
              onPress={() => showGate("other")}
              activeOpacity={0.85}
            >
              <Text style={styles.guestIdentityCtaText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const stillLoading =
    (isLoading && !initialFetchDone) || (profileLoading && !profile);

  useEffect(() => {
    if (stillLoading) {
      timeoutRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
      }, LOADING_TIMEOUT_MS);
    } else {
      setLoadingTimedOut(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stillLoading]);

  useEffect(() => {
    if (profile) {
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [profile, headerFade]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setLoadingTimedOut(false);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const handleLogout = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }, []);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({
        message: `Check out @${profile?.username || "user"} on GRIIT — the discipline app. Join me!`,
      });
    } catch {
      // Share cancelled or failed — no user feedback needed
    }
  }, [profile?.username]);

  const currentStreak = stats?.activeStreak || 0;
  const bestStreak = stats?.longestStreak || 0;
  const activeChallenges = stats?.activeChallenges || 0;
  const completedChallenges = stats?.completedChallenges || 0;

  const joinedDate = useMemo(() => {
    if (!profile?.created_at) return "";
    const d = new Date(profile.created_at);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [profile?.created_at]);

  const achievements: Achievement[] = useMemo(
    () => [
      {
        id: "0_day_streak",
        title: "0-Day Streak",
        icon: <Flame size={16} color={Colors.streak.fire} />,
        earned: bestStreak > 0,
        color: Colors.streak.fire,
      },
      {
        id: "75_day_legend",
        title: "75-Day Legend",
        icon: <Trophy size={16} color={Colors.milestone.gold} />,
        earned: bestStreak >= 75,
        color: Colors.milestone.gold,
      },
      {
        id: "consistent",
        title: "Consistent",
        icon: <CheckCircle2 size={16} color={Colors.success} />,
        earned: bestStreak >= 7,
        color: Colors.success,
      },
      {
        id: "elite",
        title: "Elite",
        icon: <ShieldCheck size={16} color={Colors.streak.shield} />,
        earned: bestStreak >= 30,
        color: Colors.streak.shield,
      },
      {
        id: "challenge_done",
        title: "Challenge Done",
        icon: <Award size={16} color={Colors.accent} />,
        earned: completedChallenges > 0,
        color: Colors.accent,
      },
    ],
    [completedChallenges, bestStreak]
  );

  const avatarRingColor = useMemo(() => {
    if (currentStreak >= 30) return Colors.streak.fire;
    if (currentStreak >= 7) return Colors.streak.shield;
    if (currentStreak > 0) return Colors.accent;
    return Colors.border;
  }, [currentStreak]);

  if (stillLoading && !loadingTimedOut) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loadingTimedOut || ((isError || profileMissing) && !profile)) {
    const errorMsg = autoCreateError
      ? `Profile setup failed: ${autoCreateError}`
      : loadingTimedOut
      ? "Server is taking too long to respond. Pull down to retry."
      : "Network error. Can't reach server. Pull down to retry.";

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.errorScrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
        >
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Shield size={28} color={Colors.text.muted} strokeWidth={1.5} />
            </View>
            <Text style={styles.errorTitle}>
              {loadingTimedOut
                ? "Taking too long"
                : autoCreateError
                ? "Profile Setup Issue"
                : "Connection Issue"}
            </Text>
            <Text style={styles.errorSubtitle}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onRefresh();
              }}
              activeOpacity={0.7}
              testID="profile-retry-button"
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutLink}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleLogout();
              }}
              activeOpacity={0.7}
              testID="profile-signout-button"
            >
              <Text style={styles.signOutLinkText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const bioText = profile.bio || "";
  const bioIsLong = bioText.length > 80;
  const displayBio = bioExpanded || !bioIsLong ? bioText : bioText.slice(0, 80) + "...";

  const totalDaysSecured = (stats as any)?.totalDaysSecured ?? 0;
  const disciplineScore = totalDaysSecured;
  const daysSecured = totalDaysSecured;
  const tierName = (stats as any)?.tier ?? "Starter";
  const ptsToNext = (stats as any)?.pointsToNextTier ?? 0;
  const nextTierName = (stats as any)?.nextTierName ?? null;

  const showStreakAtRisk = currentStreak === 0 && daysSecured > 0;
  const daysMissedForAlert = 2; // TODO: backend needs to provide days_missed for streak-at-risk

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        <Animated.View style={[styles.headerSection, { opacity: headerFade }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarRing, { borderColor: avatarRingColor }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            {currentStreak >= 7 && (
              <View style={styles.streakBadge}>
                <Flame size={11} color="#fff" fill="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.displayName}>
            {profile.display_name || profile.username}
          </Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {bioText ? (
            <View style={styles.taglinePill}>
              <Text style={styles.taglinePillText}>{displayBio}</Text>
            </View>
          ) : null}
          <View style={styles.statusBadgeRow}>
            <View style={styles.statusBadgeDot} />
            <Text style={styles.statusBadgeText}>{tierName}</Text>
          </View>
          {joinedDate ? (
            <Text style={styles.joinedDate}>Joined {joinedDate}</Text>
          ) : null}

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push("/edit-profile" as any);
              }}
              activeOpacity={0.7}
              testID="edit-profile-button"
            >
              <Pencil size={14} color={Colors.text.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={14} color={Colors.text.primary} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.cardSection}>
          <DisciplineScoreCard
            score={disciplineScore}
            tier={tierName}
            daysSecured={daysSecured}
          />
        </View>

        <View style={styles.cardSection}>
          <TierProgress tier={tierName} ptsToNext={ptsToNext} nextTierName={nextTierName} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Flame size={20} color={Colors.streak.fire} />}
            value={currentStreak}
            label="STREAK"
            color={Colors.streak.fire}
            index={0}
            onPress={() => {
              Alert.alert(
                "Streak History",
                `Current streak: ${currentStreak} days\nBest streak: ${bestStreak} days`
              );
            }}
          />
          <StatCard
            icon={<Trophy size={20} color={Colors.milestone.gold} />}
            value={bestStreak}
            label="BEST"
            color={Colors.milestone.gold}
            index={1}
            onPress={() => {
              Alert.alert(
                "Best Streak",
                `Your longest streak ever: ${bestStreak} days`
              );
            }}
          />
          <StatCard
            icon={<Target size={20} color={Colors.streak.shield} />}
            value={daysSecured}
            label="SECURED"
            color={Colors.streak.shield}
            index={2}
          />
          <StatCard
            icon={<UserCheck size={20} color={Colors.accent} />}
            value={completedChallenges}
            label="DONE"
            color={Colors.accent}
            index={3}
          />
        </View>

        <View style={styles.cardSection}>
          <ActivityCalendar daysSecured={daysSecured} />
        </View>

        <View style={styles.cardSection}>
          <DisciplineGrowthCard score={disciplineScore} previousScore={0} />
        </View>

        <View style={styles.sectionHeader}>
          <Trophy size={18} color={Colors.text.primary} />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {achievements.map((a, i) => (
            <AchievementBadge key={a.id} achievement={a} index={i} />
          ))}
        </ScrollView>

        {showStreakAtRisk && (
          <View style={styles.cardSection}>
            <StreakAtRiskAlert daysMissed={daysMissedForAlert} />
          </View>
        )}

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/edit-profile" as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Globe size={18} color={Colors.text.secondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Profile: Public</Text>
              <Text style={styles.menuSubtext}>Activity: Public</Text>
            </View>
            <Text style={styles.menuEditLabel}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 10 }]}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/settings" as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Settings size={18} color={Colors.text.secondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.menuSubtext}>Privacy, notifications, consequences</Text>
            </View>
            <ChevronRight size={18} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              handleLogout();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>→ Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileSkeleton() {
  return (
    <View>
      <View style={skeletonStyles.header}>
        <Skeleton width={92} height={92} borderRadius={46} />
        <Skeleton width={130} height={20} borderRadius={4} style={{ marginTop: 14 }} />
        <Skeleton width={90} height={14} borderRadius={4} style={{ marginTop: 6 }} />
        <Skeleton width={70} height={11} borderRadius={4} style={{ marginTop: 6 }} />
        <View style={skeletonStyles.buttonRow}>
          <Skeleton width={110} height={36} borderRadius={20} />
          <Skeleton width={90} height={36} borderRadius={20} />
        </View>
      </View>
      <View style={skeletonStyles.bioArea}>
        <Skeleton width={180} height={14} borderRadius={4} />
      </View>
      <View style={skeletonStyles.statsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={skeletonStyles.statItem}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <Skeleton width={32} height={22} borderRadius={4} style={{ marginTop: 8 }} />
            <Skeleton width={40} height={10} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>
      <View style={skeletonStyles.cards}>
        <Skeleton width="48%" height={100} borderRadius={14} />
        <Skeleton width="48%" height={100} borderRadius={14} />
      </View>
      <Skeleton
        width="90%"
        height={50}
        borderRadius={14}
        style={{ marginTop: 16, alignSelf: "center" as const }}
      />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  bioArea: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cards: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
    justifyContent: "space-between",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F4",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  guestIdentityCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 28,
    marginHorizontal: 20,
    marginTop: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestIdentityTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  guestIdentitySub: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  guestIdentityCta: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  guestIdentityCtaText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#fff",
  },
  errorScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    textAlign: "center" as const,
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center" as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },
  signOutLink: {
    paddingVertical: 8,
  },
  signOutLinkText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.tertiary,
    textDecorationLine: "underline" as const,
  },

  headerSection: {
    alignItems: "center" as const,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 12,
    position: "relative" as const,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2.5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: Colors.text.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#fff",
  },
  streakBadge: {
    position: "absolute" as const,
    bottom: 0,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.streak.fire,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2.5,
    borderColor: "#F8F7F4",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 3,
  },
  joinedDate: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    width: 130,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#fff",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  shareButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    width: 130,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#fff",
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },

  statsGrid: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 16,
    gap: 8,
  },
  statCardTouch: {
    flex: 1,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.pill,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontWeight: "600" as const,
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
  },

  cardSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  disciplineScoreCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  disciplineScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  disciplineScoreLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  disciplineScoreTierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  disciplineScoreTierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text.tertiary,
  },
  disciplineScoreTierText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  disciplineScoreValue: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -1,
    marginBottom: 4,
  },
  disciplineScoreDaysValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  disciplineScoreDaysLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginTop: 2,
  },
  disciplineScoreTierFooter: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  tierProgressWrap: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.pill,
    marginBottom: 10,
  },
  tierPillText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  tierBarTrack: {
    height: 6,
    backgroundColor: Colors.pill,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  tierBarFill: {
    height: "100%",
    backgroundColor: Colors.text.tertiary,
    borderRadius: 3,
  },
  tierPtsToNext: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  activitySection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  activityGrid: {
    marginBottom: 12,
  },
  activityGridMonths: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  activityGridMonthLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  activityGridCells: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  activityCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.pill,
  },
  activityCellFilled: {
    backgroundColor: Colors.success,
  },
  activityLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  activityLegendText: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  activityLegendSquares: {
    flexDirection: "row",
    gap: 4,
  },
  activityLegendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  disciplineGrowthCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disciplineGrowthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  disciplineGrowthTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disciplineGrowthTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text.primary,
  },
  disciplineGrowthPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.pill,
  },
  disciplineGrowthPillText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },
  disciplineGrowthMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  disciplineGrowthCol: {
    alignItems: "flex-start",
  },
  disciplineGrowthLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  disciplineGrowthValue: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text.primary,
  },
  disciplineGrowthCurrentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disciplineGrowthChangePill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.pill,
  },
  disciplineGrowthChangePillPositive: {
    backgroundColor: Colors.successLight,
  },
  disciplineGrowthChangeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text.secondary,
  },
  disciplineGrowthChangeTextPositive: {
    color: Colors.success,
  },
  disciplineGrowthBarTrack: {
    height: 6,
    backgroundColor: Colors.pill,
    borderRadius: 3,
    overflow: "hidden",
  },
  disciplineGrowthBarFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  streakAtRiskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  streakAtRiskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  streakAtRiskContent: {
    flex: 1,
  },
  streakAtRiskTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accent,
    marginBottom: 2,
  },
  streakAtRiskSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  taglinePill: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.pill,
    marginBottom: 8,
  },
  taglinePillText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 4,
  },
  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text.tertiary,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  menuEditLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
  },

  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    letterSpacing: -0.1,
  },

  achievementsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 8,
  },
  achievementBadge: {
    width: 80,
    alignItems: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementBadgeLocked: {
    opacity: 0.45,
  },
  achievementBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 6,
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 13,
  },
  achievementBadgeTextLocked: {
    color: Colors.text.muted,
  },

  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.pill,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  menuSubtext: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 1,
  },

  dangerSection: {
    paddingHorizontal: 16,
    paddingTop: 28,
    alignItems: "center" as const,
  },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#B91C1C",
  },

  bottomSpacer: {
    height: 20,
  },
});
