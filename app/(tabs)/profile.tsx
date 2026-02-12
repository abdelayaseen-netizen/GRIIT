import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/colors";
import { ProfileScreenSkeleton } from "@/components/SkeletonLoader";

const LOADING_TIMEOUT_MS = 10000;

function StatCard({
  icon,
  value,
  label,
  color,
  index,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: color + "12" }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  if (stillLoading && !loadingTimedOut) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (
    loadingTimedOut ||
    ((isError || profileMissing) && !profile)
  ) {
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
              {loadingTimedOut ? "Taking too long" : autoCreateError ? "Profile Setup Issue" : "Connection Issue"}
            </Text>
            <Text style={styles.errorSubtitle}>
              {errorMsg}
            </Text>
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
          <ProfileScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentStreak = stats?.activeStreak || 0;
  const bestStreak = stats?.longestStreak || 0;

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
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.username.charAt(0).toUpperCase()}
              </Text>
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

          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

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
            <Pencil size={13} color={Colors.text.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Flame size={22} color={Colors.streak.fire} />}
            value={currentStreak}
            label="Streak"
            color={Colors.streak.fire}
            index={0}
          />
          <StatCard
            icon={<Trophy size={22} color={Colors.milestone.gold} />}
            value={bestStreak}
            label="Best"
            color={Colors.milestone.gold}
            index={1}
          />
          <StatCard
            icon={<Target size={22} color={Colors.streak.shield} />}
            value={stats?.activeChallenges || 0}
            label="Active"
            color={Colors.streak.shield}
            index={2}
          />
          <StatCard
            icon={<Zap size={22} color={Colors.accent} />}
            value={stats?.completedChallenges || 0}
            label="Done"
            color={Colors.accent}
            index={3}
          />
        </View>

        {currentStreak >= 7 && (
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Shield size={20} color={Colors.streak.shield} fill={Colors.streak.shield} />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>
                {currentStreak >= 30
                  ? "Discipline Machine"
                  : currentStreak >= 14
                  ? "Two Weeks Strong"
                  : "Week Warrior"}
              </Text>
              <Text style={styles.achievementDesc}>
                {currentStreak} day streak — top consistency
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
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
            <Text style={styles.menuText}>Settings</Text>
            <ChevronRight size={16} color={Colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              handleLogout();
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#DC262610" }]}>
              <LogOut size={18} color="#DC2626" />
            </View>
            <Text style={[styles.menuText, { color: "#DC2626" }]}>Sign Out</Text>
            <ChevronRight size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    textAlign: "center",
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
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
    textDecorationLine: "underline",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: 14,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#fff",
  },
  streakBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.streak.fire,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  displayName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: "600" as const,
    marginTop: 2,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.streak.shield + "08",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.streak.shield + "20",
  },
  achievementIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.streak.shield + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.streak.shield,
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.text.secondary,
  },
  section: {
    paddingHorizontal: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text.primary,
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
