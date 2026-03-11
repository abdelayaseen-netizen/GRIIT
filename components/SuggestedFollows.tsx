import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/ThemeContext";
import { track } from "@/lib/analytics";

export interface SuggestedUser {
  userId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  currentStreak?: number;
  securedDaysThisWeek?: number;
}

interface SuggestedFollowsProps {
  title?: string;
  users: SuggestedUser[];
  currentUserId?: string | null;
  onUserPress?: (user: SuggestedUser) => void;
}

export function SuggestedFollows({
  title = "People to follow",
  users,
  currentUserId,
  onUserPress,
}: SuggestedFollowsProps) {
  const { colors } = useTheme();
  const filtered = users.filter((u) => u.userId !== currentUserId).slice(0, 5);
  if (filtered.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
      {filtered.map((user) => (
        <TouchableOpacity
          key={user.userId}
          style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onUserPress?.(user)}
          activeOpacity={0.85}
        >
          <Image
            source={user.avatarUrl ? { uri: user.avatarUrl } : undefined}
            style={[styles.avatar, { backgroundColor: colors.pill }]}
          />
          <View style={styles.info}>
            <Text style={[styles.username, { color: colors.text.primary }]} numberOfLines={1}>
              @{user.username}
            </Text>
            <Text style={[styles.streak, { color: colors.text.muted }]} numberOfLines={1}>
              {user.currentStreak != null && user.currentStreak > 0
                ? `${user.currentStreak} day streak`
                : user.securedDaysThisWeek != null && user.securedDaysThisWeek > 0
                  ? `${user.securedDaysThisWeek} days this week`
                  : "New"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, { borderColor: colors.accent }]}
            onPress={() => {
              track({ name: "follow_suggested_click", username: user.username });
              onUserPress?.(user);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.followBtnText, { color: colors.accent }]}>Follow</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  streak: {
    fontSize: 13,
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
