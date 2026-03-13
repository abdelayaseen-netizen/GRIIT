import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { CheckCircle2, Shield } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { GRIIT_RADII, GRIIT_SHADOWS } from "@/src/theme";

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
          <CheckCircle2 size={24} color={Colors.streak.shield} fill={Colors.streak.shield} strokeWidth={0} />
          <View style={styles.securedTextWrap}>
            <Text style={styles.securedTitle}>Day Secured</Text>
            <Text style={styles.securedSub}>Streak continues</Text>
            {disciplinePointsLabel != null && disciplinePointsLabel !== "" && (
              <Text style={styles.securedSub}>{disciplinePointsLabel}</Text>
            )}
            {currentStreak > 0 && (
              <Text style={styles.streakBadge}>{currentStreak} day streak</Text>
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
          style={styles.secureButton}
          onPress={handleSecurePress}
          activeOpacity={0.85}
          testID="daily-status-secure-today"
          accessibilityLabel="Secure your day"
          accessibilityRole="button"
        >
          <Shield size={18} color="#fff" />
          <Text style={styles.secureButtonText}>Secure Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: GRIIT_RADII.card,
    padding: 16,
    marginBottom: 12,
    ...GRIIT_SHADOWS.card,
  },
  securedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  securedTextWrap: {
    flex: 1,
  },
  securedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  securedSub: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  streakBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.streak.shield,
    marginTop: 6,
  },
  notSecuredRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  amberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  amberCircleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  notSecuredTextWrap: {
    flex: 1,
    marginLeft: 0,
  },
  notSecuredTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  notSecuredSub: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  secureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginTop: 14,
    ...GRIIT_SHADOWS.button,
  },
  secureButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
