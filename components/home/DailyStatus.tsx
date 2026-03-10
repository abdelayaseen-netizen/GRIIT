import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { CheckCircle2, Shield, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { designTokens } from "@/lib/design-tokens";

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
        <AlertCircle size={24} color={Colors.warning} />
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
    borderRadius: designTokens.cardRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
  notSecuredTextWrap: {
    flex: 1,
  },
  notSecuredTitle: {
    fontSize: 18,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 14,
  },
  secureButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
