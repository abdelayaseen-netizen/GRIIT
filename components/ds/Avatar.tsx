/**
 * G2. Never a blank circle. Two initials from display_name (one if a single
 * word), else username. Tint from a hash of user_id.
 * Sizes: 24 rows, 28 grouped events, 32 feed and comments, 40 sheets, 80 profile.
 */
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import {
  initialsFrom,
  avatarTint,
  avatarShowsPhoto,
  avatarPhotoLooksValid,
} from "@/lib/avatar-initials";

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
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [readyUri, setReadyUri] = useState<string | null>(null);
  const initials = initialsFrom(displayName, username);
  const type = typeForSize(size);
  const tint = avatarTint(userId);
  const trimmed = (uri ?? "").trim();
  const showPhoto = avatarShowsPhoto(trimmed, failedUri);
  const photoReady = readyUri === trimmed;
  const frame = [
    styles.frame,
    {
      width: size,
      height: size,
      borderWidth: ring ? RING : 0,
      backgroundColor: tint.bg,
    },
  ];

  const letters = (
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
  );

  if (!showPhoto) {
    return (
      <View style={frame} accessibilityLabel={displayName || username || "Profile"}>
        {letters}
      </View>
    );
  }

  return (
    <View style={frame} accessibilityLabel={displayName || username || "Avatar"}>
      {letters}
      <Image
        source={{ uri: trimmed }}
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: 999,
            backgroundColor: "transparent",
            opacity: photoReady ? 1 : 0,
          },
        ]}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={trimmed}
        onLoad={(e) => {
          const src = (e as { source?: { width?: number; height?: number } }).source;
          if (!avatarPhotoLooksValid(src?.width, src?.height)) {
            setFailedUri(trimmed);
            setReadyUri(null);
            return;
          }
          setReadyUri(trimmed);
        }}
        onError={() => {
          setFailedUri(trimmed);
          setReadyUri(null);
        }}
      />
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
