import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { DS_COLORS, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"

interface StreakFreezeModalProps {
  visible: boolean;
  streakCount: number;
  freezesRemaining: number;
  onUseFreeze: () => void;
  onLetReset: () => void;
}

export function StreakFreezeModal({
  visible,
  streakCount,
  freezesRemaining,
  onUseFreeze,
  onLetReset,
}: StreakFreezeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Flame size={36} color={GRIIT_COLORS.primary} style={styles.icon} />
          <Text style={styles.title}>You missed yesterday</Text>
          <Text style={styles.body}>
            Your {streakCount}-day streak will reset unless you use a streak freeze.
          </Text>

          {freezesRemaining > 0 ? (
            <TouchableOpacity
              style={styles.freezeButton}
              onPress={onUseFreeze}
              accessibilityLabel={`Use last stand to save your streak, ${freezesRemaining} remaining this week`}
              accessibilityRole="button"
            >
              <Text style={styles.freezeButtonText}>
                Use streak freeze ({freezesRemaining} remaining)
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noFreezeBox}>
              <Text style={styles.noFreezeText}>
                No freezes left this week — upgrade to Premium for more
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={onLetReset}
            accessibilityLabel="Let my streak reset to zero"
            accessibilityRole="button"
          >
            <Text style={styles.resetText}>Let it reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: DS_COLORS.modalBackdrop,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: DS_RADIUS.XL,
    padding: 24,
    alignItems: "center",
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },
  freezeButton: {
    backgroundColor: GRIIT_COLORS.primary,
    borderRadius: DS_RADIUS.joinCta,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
  },
  freezeButtonText: {
    color: DS_COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  noFreezeBox: {
    backgroundColor: DS_COLORS.surfaceMuted,
    borderRadius: DS_RADIUS.MD,
    padding: 12,
    marginBottom: 4,
    width: "100%",
  },
  noFreezeText: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  resetButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  resetText: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
});
