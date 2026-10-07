/**
 * One keyboard-avoiding wrapper. The focused field stays above the keyboard.
 * Number pads share a Done bar that only dismisses the pad.
 */
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type KeyboardEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import { SAFE } from "@/lib/safe-area";

export const NUMBER_PAD_ACCESSORY_ID = "griit-number-done";

export function NumberPadDoneBar() {
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={NUMBER_PAD_ACCESSORY_ID}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Done" onPress={() => Keyboard.dismiss()} hitSlop={8}>
          <Text style={styles.done}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

export default function KeyboardDock({
  children,
  footer,
  style,
  pointerEvents,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pointerEvents?: "box-none" | "none" | "box-only" | "auto";
}) {
  const insets = useSafeAreaInsets();
  const [keyboardOverlap, setKeyboardOverlap] = useState(0);

  useEffect(() => {
    const apply = (e: KeyboardEvent) => {
      const windowHeight = Dimensions.get("window").height;
      const overlap = Math.max(0, windowHeight - (e.endCoordinates?.screenY ?? windowHeight));
      setKeyboardOverlap(overlap);
    };
    if (Platform.OS === "ios") {
      const frame = Keyboard.addListener("keyboardWillChangeFrame", apply);
      return () => frame.remove();
    }
    const show = Keyboard.addListener("keyboardDidShow", apply);
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOverlap(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Screen already pads the home-indicator inset. Lift only the rest of the keyboard.
  const covered = Math.max(insets.bottom, SAFE.bottom);
  const lift = Math.max(0, keyboardOverlap - covered);

  return (
    <View style={[styles.fill, { paddingBottom: lift }, style]} pointerEvents={pointerEvents}>
      {children}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: {
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: DS_V3.color.raised,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_V3.color.border,
  },
  done: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
});
