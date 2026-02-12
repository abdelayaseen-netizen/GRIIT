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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
  Calendar,
  Lock,
  Award,
  CheckCircle2,
  Swords,
  Share2,
  Bell,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
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
  color,
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
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
        <View style={[styles.statIconWrap, { backgroundColor: color + "14" }]}>
          {icon}
        </View>
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
              ? achievement.color + "18"
              : "#F0EEEB",
          },
        ]}
      >
        {achievement.earned ? (
          achievement.icon
        ) : (
          <Lock size={18} color={Colors.text.muted} />
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

function MotivationBanner({ streak }: { streak: number }) {
  const message =
    streak === 0
      ? "Start today. One win is enough."
      : streak < 7
      ? "Keep it alive. Don't break the chain."
      : streak < 30
      ? "Momentum is building. Stay locked in."
      : "You're a machine. Keep dominating.";

  const bgColor =
    streak === 0 ? Colors.text.primary : streak < 7 ? "#1A1A1A" : Colors.streak.fire;

  return (
    <View style={[styles.motivationBanner, { backgroundColor: bgColor }]}>
      <Flame size={14} color="#fff" />
      <Text style={styles.motivationText}>{message}</Text>
    </View>
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
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[styles.challengeCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.challengeCardTop}>
          <View style={[styles.challengeCardIcon, { backgroundColor: color + "14" }]}>
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
        duration: 600,
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
        icon: <Star size={18} color={Colors.milestone.gold} />,
        earned: activeChallenges > 0 || completedChallenges > 0,
        color: Colors.milestone.gold,
      },
      {
        id: "7_day_streak",
        title: "7-Day Streak",
        icon: <Flame size={18} color={Colors.streak.fire} />,
        earned: bestStreak >= 7,
        color: Colors.streak.fire,
      },
      {
        id: "10_checkins",
        title: "10 Check-ins",
        icon: <CheckCircle2 size={18} color={Colors.success} />,
        earned: bestStreak >= 10,
        color: Colors.success,
      },
      {
        id: "30_day_streak",
        title: "30-Day Streak",
        icon: <ShieldCheck size={18} color={Colors.streak.shield} />,
        earned: bestStreak >= 30,
        color: Colors.streak.shield,
      },
      {
        id: "consistency_king",
        title: "Consistency King",
        icon: <Trophy size={18} color={Colors.milestone.gold} />,
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
        <Animated.View style={{ opacity: headerFade }}>
          <LinearGradient
            colors={["#1A1A1A", "#2A2A2A", "#1A1A1A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroHeader}
          >
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
                  <Flame size={12} color="#fff" fill="#fff" />
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
                  router.push("/edit-profile");
                }}
                activeOpacity={0.7}
                testID="edit-profile-button"
              >
                <Pencil size={13} color="#fff" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={13} color="#fff" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <MotivationBanner streak={currentStreak} />
        </Animated.View>

        {/* Bio Section */}
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
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.7}
              style={styles.addBioButton}
            >
              <Pencil size={14} color={Colors.text.muted} />
              <Text style={styles.addBioText}>Add a bio to tell your story</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Flame size={20} color={Colors.streak.fire} />}
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
            icon={<Trophy size={20} color={Colors.milestone.gold} />}
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
            icon={<Target size={20} color={Colors.streak.shield} />}
            value={activeChallenges}
            label="Active"
            sublabel={activeChallenges === 1 ? "challenge" : "challenges"}
            color={Colors.streak.shield}
            index={2}
          />
          <StatCard
            icon={<Zap size={20} color={Colors.accent} />}
            value={completedChallenges}
            label="Done"
            sublabel="completed"
            color={Colors.accent}
            index={3}
          />
        </View>

        {/* My Challenges Section */}
        <View style={styles.sectionHeader}>
          <Swords size={16} color={Colors.text.primary} />
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
            icon={<Target size={18} color={Colors.streak.shield} />}
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
            icon={<Award size={18} color={Colors.milestone.gold} />}
            color={Colors.milestone.gold}
          />
        </View>

        {activeChallenges === 0 && completedChallenges === 0 && (
          <TouchableOpacity
            style={styles.joinCTA}
            onPress={() => router.push("/(tabs)/discover")}
            activeOpacity={0.7}
          >
            <TrendingUp size={16} color="#fff" />
            <Text style={styles.joinCTAText}>Discover a Challenge</Text>
          </TouchableOpacity>
        )}

        {/* Achievements */}
        <View style={styles.sectionHeader}>
          <Trophy size={16} color={Colors.text.primary} />
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

        {/* Settings Menu */}
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
              <Settings size={18} color={Colors.text.secondary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuText}>Settings</Text>
              <Text style={styles.menuSubtext}>Notifications, privacy, account</Text>
            </View>
            <ChevronRight size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Sign Out - Separated */}
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
            <LogOut size={16} color="#B91C1C" />
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
      <View style={skeletonStyles.heroHeader}>
        <Skeleton width={96} height={96} borderRadius={48} />
        <Skeleton
          width={140}
          height={22}
          borderRadius={4}
          style={{ marginTop: 14 }}
        />
        <Skeleton
          width={100}
          height={14}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
        <Skeleton
          width={80}
          height={12}
          borderRadius={4}
          style={{ marginTop: 6 }}
        />
        <View style={skeletonStyles.buttonRow}>
          <Skeleton width={100} height={34} borderRadius={20} />
          <Skeleton width={80} height={34} borderRadius={20} />
        </View>
      </View>
      <Skeleton
        width="100%"
        height={36}
        borderRadius={0}
        style={{ marginBottom: 0 }}
      />
      <View style={skeletonStyles.statsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={skeletonStyles.statItem}>
            <Skeleton width={36} height={36} borderRadius={18} />
            <Skeleton
              width={36}
              height={24}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
            <Skeleton
              width={50}
              height={10}
              borderRadius={4}
              style={{ marginTop: 4 }}
            />
          </View>
        ))}
      </View>
      <View style={skeletonStyles.cards}>
        <Skeleton width="48%" height={110} borderRadius={16} />
        <Skeleton width="48%" height={110} borderRadius={16} />
      </View>
      <Skeleton
        width="100%"
        height={52}
        borderRadius={14}
        style={{ marginTop: 16, marginHorizontal: 16 }}
      />
      <Skeleton
        width="100%"
        height={52}
        borderRadius={14}
        style={{ marginTop: 8, marginHorizontal: 16 }}
      />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  heroHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#1A1A1A",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cards: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    justifyContent: "space-between",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
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

  heroHeader: {
    alignItems: "center" as const,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 14,
    position: "relative" as const,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#333",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#fff",
  },
  streakBadge: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.streak.fire,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 3,
    borderColor: "#1A1A1A",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#fff",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 4,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },
  shareButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
  },

  motivationBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  motivationText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#fff",
    letterSpacing: 0.2,
  },

  bioSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  bioSeeMore: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
    marginTop: 4,
  },
  addBioButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingVertical: 6,
  },
  addBioText: {
    fontSize: 14,
    color: Colors.text.muted,
    fontStyle: "italic" as const,
  },

  statsGrid: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: "700" as const,
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  statSublabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: "500" as const,
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text.primary,
    letterSpacing: -0.2,
  },

  challengeCards: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  challengeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeCardTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  challengeCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  challengeCardCount: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  challengeCardTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  challengeCardSubtitle: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 4,
  },

  joinCTA: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 14,
  },
  joinCTAText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
  },

  achievementsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  achievementBadge: {
    width: 90,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
  },
  achievementBadgeLocked: {
    opacity: 0.5,
  },
  achievementBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 8,
  },
  achievementBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 14,
  },
  achievementBadgeTextLocked: {
    color: Colors.text.muted,
  },

  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
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
    width: 36,
    height: 36,
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
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 1,
  },

  dangerSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: "center" as const,
  },
  signOutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
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
