import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

type Props = {
  message: string;
  onRetry?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function ErrorState({ message, onRetry, containerStyle }: Props) {
  return (
    <View style={[s.wrap, containerStyle]} accessibilityLabel="Error state">
      <Text style={s.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} style={s.btn} accessibilityLabel="Try again" accessibilityRole="button">
          <Text style={s.btnText}>Try Again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: DS_RADIUS.card,
    backgroundColor: DS_COLORS.DANGER_BG,
    padding: DS_SPACING.lg,
    alignItems: "center",
  },
  message: {
    color: DS_COLORS.DANGER,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    textAlign: "center",
  },
  btn: {
    marginTop: DS_SPACING.md,
    borderRadius: DS_RADIUS.joinCta,
    backgroundColor: DS_COLORS.WHITE,
    paddingHorizontal: DS_SPACING.lg,
    paddingVertical: DS_SPACING.sm,
  },
  btnText: {
    color: DS_COLORS.TEXT_PRIMARY,
    fontWeight: "700",
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
  },
});

