/**
 * Sheet — frame 42 / 46 bottom sheet.
 * 60% ink scrim, surface ground, radius.card×1.2 top corners, 34pt bottom inset.
 * Scrim stays full-screen so the dim is even; only the panel lifts with the keyboard.
 */
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DS_V3 } from "@/lib/design-system";

const SHEET_RADIUS = DS_V3.radius.card * 1.2;
const SHEET_INSET = DS_V3.space.xs * 8.5;

export type SheetProps = {
  visible: boolean;
  onDismiss: () => void;
  heading: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Sheet({
  visible,
  onDismiss,
  heading,
  children,
  footer,
}: SheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onDismiss}
          style={styles.scrim}
        />
        <KeyboardAvoidingView
          style={styles.lift}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
        >
          <View style={styles.panel} pointerEvents="box-none">
            <Text style={styles.heading}>{heading}</Text>
            {children}
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: DS_V3.color.canvas,
    opacity: 0.6,
  },
  lift: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 1,
  },
  panel: {
    zIndex: 1,
    elevation: 4,
    backgroundColor: DS_V3.color.surface,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    paddingBottom: SHEET_INSET,
    maxHeight: "88%",
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    marginBottom: DS_V3.space.gutter,
  },
  footer: {
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
