/**
 * Avatar — 01_components.md "Avatar"
 * Laws: 12 (initials from display name on border, else person glyph; never from user_),
 * 16 (32 / 40 / 56 / 96, one fallback).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { User } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { initialsFrom } from "@/lib/avatar-initials";

export { initialsFrom };

const RING = DS_V3.space.xs / 2;
const ICON = DS_V3.space.xs * 6;

export type AvatarSize = 32 | 40 | 56 | 96;

export type AvatarProps = {
  size?: AvatarSize;
  uri?: string | null;
  displayName?: string | null;
  ring?: boolean;
};

function typeForSize(size: AvatarSize) {
  if (size === DS_V3.size.avatar.xs) return DS_V3.type.caption;
  if (size === DS_V3.size.avatar.sm) return DS_V3.type.secondary;
  if (size === DS_V3.size.avatar.md) return DS_V3.type.bodyStrong;
  return DS_V3.type.title;
}

export default function Avatar({
  size = DS_V3.size.avatar.sm,
  uri,
  displayName,
  ring,
}: AvatarProps) {
  const initials = initialsFrom(displayName);
  const type = typeForSize(size);
  const frame = [
    styles.frame,
    {
      width: size,
      height: size,
      borderWidth: ring ? RING : 0,
    },
  ];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={frame}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={uri}
        accessibilityLabel={displayName ?? "Avatar"}
      />
    );
  }

  return (
    <View style={frame} accessibilityLabel={displayName ?? "Avatar"}>
      {initials ? (
        <Text
          style={{
            fontSize: type.fontSize /* DS_V3 via typeForSize */,
            lineHeight: type.lineHeight,
            fontWeight: DS_V3.type.bodyStrong.fontWeight,
            color: DS_V3.color.textPrimary,
          }}
        >
          {initials}
        </Text>
      ) : (
        <User
          size={ICON}
          color={DS_V3.color.textPrimary}
          accessibilityLabel={displayName || undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.border,
    borderColor: DS_V3.color.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
