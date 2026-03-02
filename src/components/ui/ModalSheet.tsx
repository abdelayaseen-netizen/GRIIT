import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { colors } from "@/src/theme/colors";
import { radius } from "@/src/theme/radius";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { PrimaryButton } from "./PrimaryButton";

type ModalSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryVariant?: "black" | "accent" | "success";
  cancelLabel?: string;
};

export function ModalSheet({
  visible,
  onClose,
  title,
  children,
  primaryLabel,
  onPrimary,
  primaryVariant = "accent",
  cancelLabel = "Cancel",
}: ModalSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        <View style={styles.actions}>
          {primaryLabel && onPrimary ? (
            <PrimaryButton
              title={primaryLabel}
              onPress={onPrimary}
              variant={primaryVariant}
              style={styles.primaryBtn}
            />
          ) : null}
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  body: { maxHeight: 400 },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  primaryBtn: { marginBottom: spacing.sm },
  cancelBtn: { alignItems: "center", paddingVertical: spacing.md },
  cancelText: { ...typography.body, color: colors.textMuted },
});
