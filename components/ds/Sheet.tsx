/**
 * Sheet — frame 42 / 46 bottom sheet.
 * 60% ink scrim, surface ground, radius.card×1.2 top corners, 34pt bottom inset.
 * Scrim stays full-screen so the dim is even; only the panel lifts with the keyboard.
 */
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import KeyboardDock from "@/components/ds/KeyboardDock";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import { SAFE } from "@/lib/safe-area";

const SHEET_RADIUS = DS_V3.radius.card * 1.2;

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
  const insets = useSafeAreaInsets();
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
        <KeyboardDock style={styles.lift} pointerEvents="box-none">
          <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, SAFE.bottom) }]} pointerEvents="box-none">
            <Text style={styles.heading}>{heading}</Text>
            <View style={footer ? styles.body : undefined}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardDock>
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
    maxHeight: "88%",
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
    marginBottom: DS_V3.space.gutter,
  },
  body: {
    paddingBottom: SAFE.stickyGap,
  },
  footer: {
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
