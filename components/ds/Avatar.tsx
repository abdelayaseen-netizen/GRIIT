/**
 * G2. Never a blank circle. Two initials from display_name (one if a single
 * word), else username. Tint from a hash of user_id.
 * Sizes: 24 rows, 32 feed and comments, 40 sheets, 80 profile header.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import { initialsFrom, avatarTint } from "@/lib/avatar-initials";

export { initialsFrom };

export type AvatarSize = 24 | 28 | 32 | 40 | 56 | 80 | 96;

export type AvatarProps = {
  userId?: string | null;
  size?: AvatarSize;
  uri?: string | null;
  displayName?: string | null;
  username?: string | null;
  ring?: boolean;
};

const RING = DS_V3.space.xs / 2;

function typeForSize(size: AvatarSize) {
  if (size <= 24) return DS_V3.type.caption;
  if (size <= 32) return DS_V3.type.secondary;
  if (size <= 40) return DS_V3.type.bodyStrong;
  return DS_V3.type.title;
}

export default function Avatar({
  userId,
  size = 32,
  uri,
  displayName,
  username,
  ring,
}: AvatarProps) {
  const initials = initialsFrom(displayName, username);
  const type = typeForSize(size);
  const tint = avatarTint(userId);
  const frame = [
    styles.frame,
    {
      width: size,
      height: size,
      borderWidth: ring ? RING : 0,
      backgroundColor: tint.bg,
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
        accessibilityLabel={displayName || username || "Avatar"}
      />
    );
  }

  return (
    <View style={frame} accessibilityLabel={displayName || username || "Profile"}>
      <Text
        style={{
          fontSize: Math.round(size * 0.38),
          lineHeight: type.lineHeight,
          fontWeight: DS_V3.type.bodyStrong.fontWeight,
          color: tint.fg,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderColor: DS_V3.color.canvas,
  },
});
