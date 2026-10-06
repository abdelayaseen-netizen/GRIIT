/**
 * One keyboard-avoiding wrapper. The focused field stays above the keyboard.
 * Number pads share a Done bar that only dismisses the pad.
 */
import React from "react";
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { DS_V3 } from "@/lib/design-system";

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
  return (
    <KeyboardAvoidingView
      style={[styles.fill, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      pointerEvents={pointerEvents}
    >
      {children}
      {footer}
    </KeyboardAvoidingView>
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
