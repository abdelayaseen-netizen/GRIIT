import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { trpcQuery } from "@/lib/trpc";

type PublicProfile = {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_days_secured: number;
  tier: string;
  active_streak: number;
};

/**
 * Deep link: /profile/[username]
 * Shows public profile for the given username.
 */
export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const decoded = username ? decodeURIComponent(username) : "";

  useEffect(() => {
    if (!decoded) {
      router.replace("/(tabs)" as any);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    trpcQuery("profiles.getPublicByUsername", { username: decoded })
      .then((data) => {
        if (!cancelled) setProfile(data as PublicProfile | null);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [decoded, router]);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text.secondary }]}>Profile not found</Text>
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text.secondary }]}>Could not load profile</Text>
        </View>
      </>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;
  if (isOwnProfile) {
    router.replace("/(tabs)/profile" as any);
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: profile.display_name || profile.username || "Profile",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.displayName, { color: colors.text.primary }]}>
          {profile.display_name || profile.username}
        </Text>
        <Text style={[styles.username, { color: colors.text.secondary }]}>@{profile.username}</Text>
        <View style={styles.stats}>
          <Text style={[styles.statValue, { color: colors.accent }]}>{profile.active_streak}</Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>day streak</Text>
        </View>
        <View style={styles.stats}>
          <Text style={[styles.statValue, { color: colors.text.primary }]}>{profile.total_days_secured}</Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>days secured</Text>
        </View>
        <Text style={[styles.tier, { color: colors.text.tertiary }]}>{profile.tier} tier</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    padding: 8,
  },
  text: {
    fontSize: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 24,
  },
  stats: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
  },
  tier: {
    fontSize: 14,
    marginTop: 8,
  },
});
