import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system";

export default function EmptyChallengesCard() {
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(ROUTES.TABS_DISCOVER as never);
  };

  return (
    <View style={styles.card}>
      <Target size={40} color={DS_COLORS.textMuted} />
      <Text style={styles.title}>You have no active challenges</Text>
      <Text style={styles.subtitle}>Join a challenge to get started.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.85}
        testID="empty-challenges-discover-button"
        accessibilityRole="button"
        accessibilityLabel="Discover challenges to join"
      >
        <Text style={styles.buttonText}>Discover challenges ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.xxl,
    marginBottom: DS_SPACING.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginTop: DS_SPACING.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textSecondary,
    marginTop: DS_SPACING.xs,
    textAlign: "center",
  },
  button: {
    backgroundColor: DS_COLORS.accent,
    paddingVertical: DS_SPACING.lg,
    paddingHorizontal: DS_SPACING.xxxl,
    borderRadius: DS_RADIUS.buttonPill,
    marginTop: DS_SPACING.lg,
    alignItems: "center",
    ...DS_SHADOWS.button,
  },
  buttonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
});
