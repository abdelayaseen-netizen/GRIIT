import React from "react";
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"
import { getDisplayInitials, getFeedAvatarBgFromUserId } from "@/lib/utils";

type Props = {
  url?: string | null;
  name: string;
  size: number;
  /** Used for fallback background when `url` is missing (deterministic color). */
  userId?: string;
  /** Fallback background when `userId` is not provided. */
  bgColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Profile image or initials; uses design tokens only (no raw hex in this file).
 */
export function Avatar({ url, name, size, userId, bgColor, style }: Props) {
  const initialSource = name.trim() || "?";
  const fallbackBg =
    bgColor ?? (userId ? getFeedAvatarBgFromUserId(userId) : DS_COLORS.DISCOVER_CORAL);
  const fontSize = Math.max(10, Math.round(size * 0.36));

  if (url?.trim()) {
    return (
      <View style={style}>
        <Image
          source={{ uri: url }}
          style={[styles.img, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fallbackBg,
        },
        style,
      ]}
    >
      <Text style={[styles.letter, { fontSize }]}>{getDisplayInitials(initialSource)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: {
    backgroundColor: DS_COLORS.photoThumbBg,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_ON_DARK,
  },
});
