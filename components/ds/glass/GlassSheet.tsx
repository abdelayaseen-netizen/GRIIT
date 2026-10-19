/**
 * Build 92 01.1 · port of design/handoff/b92/part0-liquid-glass/src/ds/glass/GlassSheet.tsx.
 * Bottom sheet on dense glass (or the solid fallback), 32 pt top corners, black 35% dim
 * behind. Closes on a tap outside or a swipe down. Content is solid; only the sheet is glass.
 */
import React, { useEffect, useRef } from "react";
import { Animated, Keyboard, Modal, PanResponder, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_RADIUS, GLASS_STATE } from "@/lib/glass";
import { sheetKeyboardLift, sheetOutsideAction } from "@/lib/sheet-keyboard";
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
  /** testID for the title-row close control (defaults to none). */
  closeTestID?: string;
  /**
   * Draw inside the current screen instead of a Modal. Needed when the sheet must open in
   * the same frame another iOS Modal closes (two Modals cannot present together).
   */
  inline?: boolean;
  /**
   * The sheet holds a text field: it rides up with the keyboard, and while the keyboard is open a tap
   * outside or a swipe down only drops the keyboard. The close button always closes.
   */
  avoidKeyboard?: boolean;
};

export function GlassSheet({ visible, onClose, label, title, children, testID, closeTestID, inline = false, avoidKeyboard = false }: GlassSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, DS_V3.space.md);
  const drag = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const keyboardOpen = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!avoidKeyboard || !visible) return;
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", (e) => {
      keyboardOpen.current = true;
      Animated.timing(lift, {
        toValue: -sheetKeyboardLift(e.endCoordinates.height, bottomPad, DS_V3.space.sm),
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", (e) => {
      keyboardOpen.current = false;
      Animated.timing(lift, { toValue: 0, duration: e?.duration || 250, useNativeDriver: true }).start();
    });
    return () => {
      show.remove();
      hide.remove();
      keyboardOpen.current = false;
      lift.setValue(0);
    };
  }, [avoidKeyboard, visible, bottomPad, lift]);

  const outside = () => {
    if (sheetOutsideAction(keyboardOpen.current || Keyboard.isVisible(), avoidKeyboard) === "dismiss-keyboard") {
      Keyboard.dismiss();
      return true;
    }
    return false;
  };
  const outsideRef = useRef(outside);
  outsideRef.current = outside;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) drag.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > SWIPE_CLOSE_PT && !outsideRef.current()) {
          drag.setValue(0);
          onCloseRef.current();
        } else {
          Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  const body = (
    <>
      <Pressable
        style={styles.dim}
        onPress={() => {
          if (!outside()) onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />
      <Animated.View
        style={[styles.lift, { transform: [{ translateY: Animated.add(drag, lift) }] }]}
        pointerEvents="box-none"
        {...pan.panHandlers}
      >
        <GlassSurface
          kind="dense"
          hairline="top"
          testID={testID}
          style={[styles.sheet, { paddingBottom: bottomPad }]}
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
                testID={closeTestID}
              >
                <X size={22} color={DS_V3.color.textPrimary} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </GlassSurface>
      </Animated.View>
    </>
  );
  if (inline) {
    if (!visible) return null;
    return <View style={StyleSheet.absoluteFill}>{body}</View>;
  }
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {body}
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
