import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image, type ImageStyle } from "expo-image";
import { Camera } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

/** Task name and a camera icon on surface. Used when a proof image is missing or fails. */
export function ProofFallbackTile({
  taskName,
  style,
}: {
  taskName?: string | null;
  style?: StyleProp<ViewStyle>;
}) {
  const name = taskName?.trim() || "Task";
  return (
    <View style={[styles.tile, style]} accessibilityLabel={name}>
      <Camera size={20} color={DS_V3.color.textSecondary} />
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

export function ProofPhoto({
  uri,
  taskName,
  style,
}: {
  uri?: string | null;
  taskName?: string | null;
  style?: StyleProp<ImageStyle>;
}) {
  const [attempt, setAttempt] = useState(0);
  // A signed URL rotates hourly. A failed first paint must not stick to the next one.
  useEffect(() => {
    setAttempt(0);
  }, [uri]);
  if (!uri || attempt > 1) {
    return <ProofFallbackTile taskName={taskName} style={styles.fill} />;
  }
  return (
    <Image
      key={`${uri}:${attempt}`}
      source={{ uri }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
      allowDownscaling={false}
      recyclingKey={uri}
      onError={() => setAttempt((n) => n + 1)}
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.xs,
    padding: DS_V3.space.sm,
    backgroundColor: DS_V3.color.surface,
  },
  name: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});

/** Same tile. The handoff name is ImageFallback. */
export const ImageFallback = ProofFallbackTile;
