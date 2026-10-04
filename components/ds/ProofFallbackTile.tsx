import React, { useState } from "react";
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
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return <ProofFallbackTile taskName={taskName} style={styles.fill} />;
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit="cover"
      onError={() => setFailed(true)}
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
