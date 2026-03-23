import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel = "Cancel",
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss dialog" />
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onCancel} accessibilityRole="button">
              <Text style={styles.btnSecondaryText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, destructive && styles.btnDestructive]}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text style={[styles.btnPrimaryText, destructive && styles.btnDestructiveText]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: DS_SPACING.lg,
    backgroundColor: DS_COLORS.modalBackdrop,
  },
  card: {
    zIndex: 1,
    backgroundColor: DS_COLORS.card,
    borderRadius: DS_RADIUS.LG,
    padding: DS_SPACING.xl,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    color: DS_COLORS.textSecondary,
    marginBottom: DS_SPACING.xl,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: DS_SPACING.md,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: DS_SPACING.md,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    alignItems: "center",
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: DS_SPACING.md,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.accent,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: DS_COLORS.textPrimary,
  },
  btnDestructive: {
    backgroundColor: DS_COLORS.dangerLight,
    borderWidth: 1,
    borderColor: DS_COLORS.alertRedBorder,
  },
  btnDestructiveText: {
    color: DS_COLORS.dangerDark,
  },
});
