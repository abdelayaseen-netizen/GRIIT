// LEGACY: consider migrating to task/complete.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import { useInlineError } from "@/hooks/useInlineError";
import { InlineError } from "@/components/InlineError";
import { captureError } from "@/lib/sentry";
import { ROUTES } from "@/lib/routes";

/**
 * Manual / simple task completion: user taps "Mark as Complete" with no proof.
 * Used for task_type 'manual' or 'simple' when photo proof is not required.
 */
export default function ManualTaskScreen() {
  const router = useRouter();
  const { taskId, taskName, taskDescription } = useLocalSearchParams<{
    taskId: string;
    taskName?: string;
    taskDescription?: string;
  }>();
  const { activeChallenge, completeTask } = useApp();
  const [loading, setLoading] = useState(false);
  const { error, showError, clearError } = useInlineError();

  const title = taskName?.trim() || "Task";
  const description = taskDescription?.trim() || "Did you complete this task?";

  const handleMarkComplete = async () => {
    if (!activeChallenge?.id || !taskId) {
      showError("No active challenge or task found.");
      return;
    }
    setLoading(true);
    try {
      await completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
      });
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
    } catch (err: unknown) {
      captureError(err, "ManualTaskComplete");
      showError(err instanceof Error ? err.message : "Couldn't save. Tap to retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        <InlineError message={error} onDismiss={clearError} />
        <View style={styles.iconWrap}>
          <CircleCheck size={56} color={DS_COLORS.success} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
        <Text style={styles.honorText}>This is honor-based. Only you know.</Text>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
          onPress={handleMarkComplete}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityLabel="Mark task as complete"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={DS_COLORS.white} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Mark as Complete</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    flex: 1,
    padding: DS_SPACING.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    marginBottom: DS_SPACING.xxl,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.sectionTitle.fontSize,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: DS_SPACING.md,
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: DS_SPACING.lg,
  },
  honorText: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    color: DS_COLORS.textMuted,
    textAlign: "center",
    marginBottom: DS_SPACING.xxxl,
  },
  primaryButton: {
    alignSelf: "stretch",
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.cardAlt,
    padding: DS_SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
});
