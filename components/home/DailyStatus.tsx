import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { CheckCircle2, Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";

export type DailyStatusState = "NOT_SECURED" | "SECURED";

interface DailyStatusProps {
  state: DailyStatusState;
  remainingTasksCount?: number;
  onSecureToday?: () => void;
  currentStreak?: number;
  disciplinePointsLabel?: string;
}

export default function DailyStatus({
  state,
  remainingTasksCount = 0,
  onSecureToday,
  currentStreak = 0,
  disciplinePointsLabel,
}: DailyStatusProps) {
  const handleSecurePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSecureToday?.();
  };

  if (state === "SECURED") {
    return (
      <View style={styles.card}>
        <View style={styles.securedRow}>
          <CheckCircle2 size={24} color={DS_COLORS.success} fill={DS_COLORS.success} strokeWidth={0} />
          <View style={styles.securedTextWrap}>
            <Text style={styles.securedTitle}>Day Secured</Text>
            <Text style={styles.securedSub}>Streak continues</Text>
            {disciplinePointsLabel != null && disciplinePointsLabel !== "" && (
              <Text style={styles.securedSub}>{disciplinePointsLabel}</Text>
            )}
            {currentStreak > 0 && (
              <Text style={[styles.streakBadge, { color: DS_COLORS.success }]}>{currentStreak} day streak</Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.notSecuredRow}>
        <View style={styles.amberCircle}>
          <Text style={styles.amberCircleText}>!</Text>
        </View>
        <View style={styles.notSecuredTextWrap}>
          <Text style={styles.notSecuredTitle}>Today is not secured</Text>
          <Text style={styles.notSecuredSub}>
            {remainingTasksCount === 0
              ? "Complete your required tasks to secure today."
              : `${remainingTasksCount} task${remainingTasksCount === 1 ? "" : "s"} remaining`}
          </Text>
        </View>
      </View>
      {onSecureToday && (
        <TouchableOpacity
          style={[styles.secureButton, { backgroundColor: DS_COLORS.black }]}
          onPress={handleSecurePress}
          activeOpacity={0.85}
          testID="daily-status-secure-today"
          accessibilityLabel="Secure your day"
          accessibilityRole="button"
        >
          <Shield size={18} color={DS_COLORS.white} />
          <Text style={styles.secureButtonText}>Secure Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.cardPadding,
    marginBottom: DS_SPACING.md,
    borderWidth: DS_BORDERS.width,
    borderColor: DS_COLORS.border,
  },
  securedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING.md,
  },
  securedTextWrap: { flex: 1 },
  securedTitle: {
    fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  securedSub: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    fontSize: DS_TYPOGRAPHY.metadata.fontSize,
    fontWeight: "600",
    marginTop: DS_SPACING.sm,
  },
  notSecuredRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING.md,
  },
  amberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  amberCircleText: {
    fontSize: 18,
    fontWeight: "800",
    color: DS_COLORS.white,
  },
  notSecuredTextWrap: { flex: 1 },
  notSecuredTitle: {
    fontSize: DS_TYPOGRAPHY.cardTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  notSecuredSub: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: 2,
  },
  secureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING.sm,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.xl,
    borderRadius: DS_RADIUS.button,
    marginTop: DS_SPACING.lg,
  },
  secureButtonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
});
