import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { DS_COLORS } from "@/lib/design-system";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: DS_COLORS.skeletonBg,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function HomeScreenSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.headerCenter}>
        <Skeleton width={80} height={32} borderRadius={4} />
        <Skeleton width={160} height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      <View style={skeletonStyles.streakCard}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <Skeleton width={120} height={28} borderRadius={6} style={{ marginTop: 10 }} />
        <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      <View style={skeletonStyles.calendarRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={36} height={36} borderRadius={18} />
        ))}
      </View>

      <View style={skeletonStyles.challengeCard}>
        <Skeleton width="60%" height={18} borderRadius={4} />
        <Skeleton width="40%" height={14} borderRadius={4} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: 12 }} />
        <Skeleton width="30%" height={12} borderRadius={4} style={{ marginTop: 12 }} />
      </View>

      <Skeleton width="100%" height={52} borderRadius={12} style={{ marginTop: 16 }} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerCenter: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  streakCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DS_COLORS.skeletonBg,
    marginBottom: 16,
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: DS_COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: DS_COLORS.skeletonBg,
  },
});
