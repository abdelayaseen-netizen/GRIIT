import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { captureError } from "@/lib/sentry";

interface LogProgressModalProps {
  visible: boolean;
  unit: string;
  onClose: () => void;
  onSubmit: (amount: number, note: string) => Promise<void>;
}

export default function LogProgressModal({ visible, unit, onClose, onSubmit }: LogProgressModalProps) {
  const { colors } = useTheme();
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amount = parseFloat(amountStr);
  const isValid = Number.isFinite(amount) && amount > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(amount, note.trim());
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAmountStr("");
      setNote("");
      onClose();
    } catch (e: unknown) {
      captureError(e, "LogProgressModalSubmit");
      setError((e as Error)?.message ?? "Failed to log. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setAmountStr("");
      setNote("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss log progress"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} accessible={false}>
            <View style={[styles.dialog, { backgroundColor: colors.card }]}>
              <Text style={[styles.title, { color: colors.text.primary }]}>Log {unit}</Text>
              <Text style={[styles.label, { color: colors.text.secondary }]}>How many {unit}?</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="decimal-pad"
                accessibilityLabel={`Amount in ${unit}`}
              />
              <Text style={[styles.label, { color: colors.text.secondary, marginTop: 12 }]}>Add a note (optional)</Text>
              <TextInput
                style={[styles.input, styles.noteInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text.primary }]}
                placeholder="e.g. Morning run"
                placeholderTextColor={colors.text.tertiary}
                value={note}
                onChangeText={setNote}
                multiline
                accessibilityLabel="Progress note"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={handleClose}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel logging progress"
                >
                  <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.logBtn, { backgroundColor: colors.accent }]}
                  onPress={handleSubmit}
                  disabled={!isValid || submitting}
                  accessibilityRole="button"
                  accessibilityLabel={`Submit log for ${unit}`}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={DS_COLORS.white} />
                  ) : (
                    <Text style={styles.logBtnText}>Log</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS.OVERLAY_BLACK_40,
    justifyContent: "center",
    padding: 24,
  },
  keyboard: {
    justifyContent: "center",
  },
  dialog: {
    borderRadius: DS_RADIUS.LG,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: DS_RADIUS.MD,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  noteInput: {
    minHeight: 72,
  },
  errorText: {
    fontSize: 13,
color: DS_COLORS.dangerDark,
  marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  logBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: DS_RADIUS.MD,
    alignItems: "center",
  },
  logBtnText: {
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.white,
  },
});
