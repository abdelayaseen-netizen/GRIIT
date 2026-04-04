import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"

export interface ProfileCompletionCardProps {
  bioAdded: boolean;
  joinedChallenge: boolean;
  secured7Days: boolean;
  invitedFriend: boolean;
}

export default function ProfileCompletionCard({
  bioAdded,
  joinedChallenge,
  secured7Days,
  invitedFriend,
}: ProfileCompletionCardProps) {
  const items = [
    { done: bioAdded, label: "Add a bio" },
    { done: joinedChallenge, label: "Join a challenge" },
    { done: secured7Days, label: "Secure 7 days" },
    { done: invitedFriend, label: "Invite a friend" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile completion</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.list}>
        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            {item.done ? (
              <CheckCircle2 size={20} color={DS_COLORS.success} fill={DS_COLORS.success} strokeWidth={0} />
            ) : (
              <Circle size={20} color={DS_COLORS.border} strokeWidth={2} />
            )}
            <Text style={[styles.label, !item.done && styles.labelMuted]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    marginHorizontal: DS_SPACING.screenHorizontalAlt,
    marginBottom: DS_SPACING.lg,
    padding: DS_SPACING.lg,
    borderRadius: DS_RADIUS.cardAlt,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_SPACING.sm,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.textPrimary,
  },
  percent: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.accent,
  },
  barTrack: {
    height: 6,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: DS_RADIUS.SM,
    overflow: "hidden",
    marginBottom: DS_SPACING.lg,
  },
  barFill: {
    height: "100%",
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.SM,
  },
  list: {
    gap: DS_SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.sm,
  },
  label: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    color: DS_COLORS.textPrimary,
  },
  labelMuted: {
    color: DS_COLORS.textMuted,
  },
});
