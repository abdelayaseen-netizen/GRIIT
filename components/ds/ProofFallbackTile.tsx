import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
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

function ProofShimmer() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.fill, styles.shimmer, { opacity }]} />;
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
  const [loaded, setLoaded] = useState(false);
  // A signed URL rotates hourly. A failed first paint must not stick to the next one.
  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
  }, [uri]);
  if (!uri || attempt > 3) {
    return <ProofFallbackTile taskName={taskName} style={styles.fill} />;
  }
  return (
    <View style={style as StyleProp<ViewStyle>}>
      {loaded ? null : <ProofShimmer />}
      <Image
        key={`${uri}:${attempt}`}
        source={{ uri }}
        style={styles.fill}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={180}
        onLoad={() => setLoaded(true)}
        onError={() => setAttempt((n) => n + 1)}
      />
    </View>
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
  shimmer: {
    backgroundColor: DS_V3.color.hairline,
  },
});

/** Same tile. The handoff name is ImageFallback. */
export const ImageFallback = ProofFallbackTile;
