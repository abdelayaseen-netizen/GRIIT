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
  Swords,
  Share2,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
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
  sublabel,
  index,
  onPress,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  sublabel: string;
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
        <Text style={styles.statSublabel}>{sublabel}</Text>
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

function ChallengeCard({
  title,
  count,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  count: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
      style={styles.challengeCardTouch}
    >
      <Animated.View
        style={[styles.challengeCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.challengeCardTop}>
          <View style={[styles.challengeCardIcon, { backgroundColor: color + "12" }]}>
            {icon}
          </View>
          <ChevronRight size={14} color={Colors.text.muted} />
        </View>
        <Text style={styles.challengeCardCount}>{count}</Text>
        <Text style={styles.challengeCardTitle}>{title}</Text>
        <Text style={styles.challengeCardSubtitle}>{subtitle}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
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
        message: `Check out @${profile?.username || "user"} on GRIT — the discipline app. Join me!`,
      });
    } catch {
      console.log("[Profile] Share cancelled or failed");
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
        id: "first_challenge",
        title: "First Challenge",
        icon: <Star size={16} color={Colors.milestone.gold} />,
        earned: activeChallenges > 0 || completedChallenges > 0,
        color: Colors.milestone.gold,
      },
      {
        id: "7_day_streak",
        title: "7-Day Streak",
        icon: <Flame size={16} color={Colors.streak.fire} />,
        earned: bestStreak >= 7,
        color: Colors.streak.fire,
      },
      {
        id: "10_checkins",
        title: "10 Check-ins",
        icon: <CheckCircle2 size={16} color={Colors.success} />,
        earned: bestStreak >= 10,
        color: Colors.success,
      },
      {
        id: "30_day_streak",
        title: "30-Day Streak",
        icon: <ShieldCheck size={16} color={Colors.streak.shield} />,
        earned: bestStreak >= 30,
        color: Colors.streak.shield,
      },
      {
        id: "consistency_king",
        title: "Consistency King",
        icon: <Trophy size={16} color={Colors.milestone.gold} />,
        earned: completedChallenges >= 3,
        color: Colors.milestone.gold,
      },
    ],
    [activeChallenges, completedChallenges, bestStreak]
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

  const streakMicro =
    currentStreak === 0
      ? "No active streak yet."
      : `🔥 ${currentStreak}-day streak. Keep going.`;

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
                  {profile.username.charAt(0).toUpperCase()}
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
              <Pencil size={13} color={Colors.text.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={13} color={Colors.text.primary} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <View style={styles.bioSection}>
          {bioText ? (
            <TouchableOpacity
              onPress={() => bioIsLong && setBioExpanded(!bioExpanded)}
              activeOpacity={bioIsLong ? 0.7 : 1}
            >
              <Text style={styles.bioText}>{displayBio}</Text>
              {bioIsLong && (
                <Text style={styles.bioSeeMore}>
                  {bioExpanded ? "See less" : "See more"}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/edit-profile" as any)}
              activeOpacity={0.7}
              style={styles.addBioButton}
            >
              <Text style={styles.addBioText}>Add a bio</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Flame size={18} color={Colors.streak.fire} />}
            value={currentStreak}
            label="Streak"
            sublabel="days"
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
            icon={<Trophy size={18} color={Colors.milestone.gold} />}
            value={bestStreak}
            label="Best"
            sublabel="days"
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
            icon={<Target size={18} color={Colors.streak.shield} />}
            value={activeChallenges}
            label="Active"
            sublabel={activeChallenges === 1 ? "challenge" : "challenges"}
            color={Colors.streak.shield}
            index={2}
          />
          <StatCard
            icon={<Zap size={18} color={Colors.accent} />}
            value={completedChallenges}
            label="Done"
            sublabel="completed"
            color={Colors.accent}
            index={3}
          />
        </View>

        <Text
          style={[
            styles.streakMicro,
            currentStreak > 0 && styles.streakMicroActive,
          ]}
        >
          {streakMicro}
        </Text>

        <View style={styles.sectionHeader}>
          <Swords size={15} color={Colors.text.secondary} />
          <Text style={styles.sectionTitle}>My Challenges</Text>
        </View>
        <View style={styles.challengeCards}>
          <ChallengeCard
            title="Active"
            count={activeChallenges}
            subtitle={
              activeChallenges === 0
                ? "Join one to start"
                : `${activeChallenges} in progress`
            }
            icon={<Target size={16} color={Colors.streak.shield} />}
            color={Colors.streak.shield}
            onPress={() => {
              router.push("/(tabs)");
            }}
          />
          <ChallengeCard
            title="Completed"
            count={completedChallenges}
            subtitle={
              completedChallenges === 0
                ? "Finish your first"
                : `${completedChallenges} conquered`
            }
            icon={<Award size={16} color={Colors.milestone.gold} />}
            color={Colors.milestone.gold}
          />
        </View>

        {activeChallenges === 0 && completedChallenges === 0 && (
          <TouchableOpacity
            style={styles.joinCTA}
            onPress={() => router.push("/(tabs)/discover" as any)}
            activeOpacity={0.7}
          >
            <TrendingUp size={15} color="#fff" />
            <Text style={styles.joinCTAText}>Discover a Challenge</Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Trophy size={15} color={Colors.text.secondary} />
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

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Alert.alert("Coming Soon", "Settings will be available soon!");
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Settings size={17} color={Colors.text.secondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.menuSubtext}>Notifications, privacy, account</Text>
            </View>
            <ChevronRight size={15} color={Colors.text.muted} />
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
            <LogOut size={14} color="#B91C1C" />
            <Text style={styles.signOutText}>Sign Out</Text>
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

  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 40,
  },

  bioSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: "center" as const,
  },
  bioSeeMore: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
    marginTop: 4,
    textAlign: "center" as const,
  },
  addBioButton: {
    paddingVertical: 4,
  },
  addBioText: {
    fontSize: 14,
    color: Colors.text.muted,
    fontStyle: "italic" as const,
  },

  statsGrid: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingTop: 4,
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
    color: Colors.text.secondary,
    fontWeight: "600" as const,
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
  },
  statSublabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: "400" as const,
    marginTop: 1,
  },

  streakMicro: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: "center" as const,
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
  streakMicroActive: {
    color: Colors.success,
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

  challengeCards: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  challengeCardTouch: {
    flex: 1,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 110,
  },
  challengeCardTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
  },
  challengeCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  challengeCardCount: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  challengeCardTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  challengeCardSubtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 3,
  },

  joinCTA: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 13,
    borderRadius: 14,
  },
  joinCTAText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#fff",
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#B91C1C",
  },

  bottomSpacer: {
    height: 20,
  },
});
