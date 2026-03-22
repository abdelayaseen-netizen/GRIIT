import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

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

/** Compact skeleton for Home "Today's Goals" block only. */
export function TodaysMissionsSkeleton() {
  return (
    <View style={skeletonStyles.todaysMissionsOuter}>
      <Skeleton width={180} height={18} borderRadius={6} style={skeletonStyles.todaysTitleSkel} />
      <View style={skeletonStyles.todaysCard}>
        <Skeleton width="70%" height={16} borderRadius={4} style={skeletonStyles.todaysLine1} />
        <Skeleton width={100} height={14} borderRadius={4} style={skeletonStyles.todaysLine2} />
        <Skeleton width="100%" height={44} borderRadius={8} style={skeletonStyles.todaysBtnGap} />
        <Skeleton width="100%" height={44} borderRadius={8} />
      </View>
    </View>
  );
}

export function HomeScreenSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <View style={skeletonStyles.headerCenter}>
        <Skeleton width={80} height={32} borderRadius={4} />
        <Skeleton width={160} height={14} borderRadius={4} style={skeletonStyles.homeSkelMarginTop6} />
      </View>

      <View style={skeletonStyles.streakCard}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <Skeleton width={120} height={28} borderRadius={6} style={skeletonStyles.homeSkelMarginTop10} />
        <Skeleton width={80} height={12} borderRadius={4} style={skeletonStyles.homeSkelMarginTop6} />
      </View>

      <View style={skeletonStyles.calendarRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} width={36} height={36} borderRadius={18} />
        ))}
      </View>

      <View style={skeletonStyles.challengeCard}>
        <Skeleton width="60%" height={18} borderRadius={4} />
        <Skeleton width="40%" height={14} borderRadius={4} style={skeletonStyles.homeSkelMarginTop12} />
        <Skeleton width="100%" height={8} borderRadius={4} style={skeletonStyles.homeSkelMarginTop12} />
        <Skeleton width="30%" height={12} borderRadius={4} style={skeletonStyles.homeSkelMarginTop12} />
      </View>

      <Skeleton width="100%" height={52} borderRadius={12} style={skeletonStyles.homeSkelMarginTop16} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  todaysMissionsOuter: { paddingHorizontal: 20, marginBottom: DS_SPACING.lg },
  todaysTitleSkel: { marginBottom: DS_SPACING.md },
  todaysCard: {
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.card,
    padding: DS_SPACING.cardPadding,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  todaysLine1: { marginBottom: DS_SPACING.sm },
  todaysLine2: { marginBottom: DS_SPACING.lg },
  todaysBtnGap: { marginBottom: DS_SPACING.sm },
  homeSkelMarginTop6: { marginTop: 6 },
  homeSkelMarginTop10: { marginTop: 10 },
  homeSkelMarginTop12: { marginTop: 12 },
  homeSkelMarginTop16: { marginTop: 16 },
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
