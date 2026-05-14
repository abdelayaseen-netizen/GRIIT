import React from "react";
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

const COL_GAP = 3;
const OVERLAY_BOTTOM = ["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"] as const;
const PILL_BG = "rgba(0,0,0,0.4)";

export type PostsGridProps = {
  posts: Array<{
    id: string;
    imageUrl: string;
    challengeTitle: string;
    dayOfTotal: string;
  }>;
  onSelect: (id: string) => void;
};

export function PostsGrid({ posts, onSelect }: PostsGridProps) {
  const { width } = useWindowDimensions();
  const horizontalPad = DS_SPACING.screenHorizontal * 2;
  const gutter = COL_GAP * 2;
  const tileW = Math.max(96, Math.floor((width - horizontalPad - gutter) / 3));

  return (
    <View style={styles.wrap}>
      <View style={styles.rowWrap}>
        {posts.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`Post from ${p.challengeTitle}, ${p.dayOfTotal}`}
            onPress={() => onSelect(p.id)}
            style={[styles.tile, { width: tileW, aspectRatio: 4 / 5, marginBottom: COL_GAP }]}
          >
            <Image source={{ uri: p.imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <LinearGradient
              pointerEvents="none"
              colors={[...OVERLAY_BOTTOM]}
              style={styles.grad}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0.5 }}
            />
            <View style={styles.pill}>
              <Text style={styles.pillTxt}>{p.dayOfTotal}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {p.challengeTitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 0 },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: COL_GAP,
    justifyContent: "flex-start",
  },
  tile: {
    borderRadius: DS_RADIUS.SM,
    overflow: "hidden",
    backgroundColor: DS_COLORS.BORDER,
    position: "relative",
  },
  grad: {
    ...StyleSheet.absoluteFillObject,
  },
  pill: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: PILL_BG,
  },
  pillTxt: { fontSize: 8, fontWeight: "600", color: DS_COLORS.WHITE },
  title: {
    position: "absolute",
    bottom: 6,
    left: 8,
    right: 8,
    fontSize: 9,
    fontWeight: "600",
    color: DS_COLORS.WHITE,
    lineHeight: 12,
  },
});
