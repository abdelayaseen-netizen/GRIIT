/**
 * Build 92 01.1 · port of design/handoff/b92/part0-liquid-glass/src/ds/glass/GlassSheet.tsx.
 * Bottom sheet on dense glass (or the solid fallback), 32 pt top corners, black 35% dim
 * behind. Closes on a tap outside or a swipe down. Content is solid; only the sheet is glass.
 */
import React, { useRef } from "react";
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_RADIUS, GLASS_STATE } from "@/lib/glass";
import { GlassSurface } from "./GlassSurface";

const SWIPE_CLOSE_PT = 48;

export type GlassSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** VoiceOver name of the sheet. */
  label: string;
  /** Title row at the top; the close button sits on its right. */
  title?: string;
  children: React.ReactNode;
  testID?: string;
};

export function GlassSheet({ visible, onClose, label, title, children, testID }: GlassSheetProps) {
  const insets = useSafeAreaInsets();
  const drag = useRef(new Animated.Value(0)).current;
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) drag.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > SWIPE_CLOSE_PT) {
          drag.setValue(0);
          onClose();
        } else {
          Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={styles.dim}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />
      <Animated.View
        style={[styles.lift, { transform: [{ translateY: drag }] }]}
        pointerEvents="box-none"
        {...pan.panHandlers}
      >
        <GlassSurface
          kind="dense"
          hairline="top"
          testID={testID}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, DS_V3.space.md) }]}
          accessibilityViewIsModal
          accessibilityLabel={label}
        >
          <View style={styles.grabber} />
          {title ? (
            <View style={styles.titleRow}>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.close}
                hitSlop={4}
              >
                <X size={22} color={DS_V3.color.textPrimary} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </GlassSurface>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: GLASS_STATE.sheetDim },
  lift: { position: "absolute", left: 0, right: 0, bottom: 0 },
  sheet: {
    borderTopLeftRadius: GLASS_RADIUS.sheetTop,
    borderTopRightRadius: GLASS_RADIUS.sheetTop,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    overflow: "hidden",
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: GLASS_STATE.grabber,
    marginBottom: DS_V3.space.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: DS_V3.space.xs + 2,
  },
  title: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  close: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GlassSheet;
