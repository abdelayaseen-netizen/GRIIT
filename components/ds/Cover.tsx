import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Dumbbell, Leaf, Moon, Sun, Target } from "lucide-react-native";
import { categoryTint, DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";

export type CoverCategory = keyof typeof categoryTint;

const ICON = {
  Fitness: Dumbbell,
  Faith: Moon,
  Mind: Sun,
  Health: Leaf,
  Discipline: Target,
  Learning: BookOpen,
} as const;

const COVER_RADIUS = 14;

/**
 * v49.1 option 1a — title on the cover.
 * Category tag top-left, day-count chip, no giant numeral.
 * Omit `title` only for the 48×60 search thumb (icon alone).
 */
export function Cover({
  category,
  days,
  width,
  height,
  title,
}: {
  category: CoverCategory;
  days: number;
  width: number;
  height: number;
  title?: string | null;
}) {
  const Glyph = ICON[category];
  const tint = categoryTint[category];
  const name = (title ?? "").trim();
  const iconOnly = width < 72 || !name;
  const pad = width >= 280 ? 16 : 12;
  const titleSize = width >= 280 ? 28 : width >= 160 ? 19 : 15;

  return (
    <View style={[styles.box, { width, height, borderRadius: iconOnly && width < 72 ? 10 : COVER_RADIUS }]}>
      <LinearGradient
        colors={[tint, DS_V3.color.canvas]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {iconOnly ? (
        <View style={styles.center}>
          <Glyph size={width < 72 ? 20 : 16} color={DS_V3.color.textPrimary} />
        </View>
      ) : (
        <>
          <View style={[styles.tag, { left: pad, top: pad, right: pad }]}>
            <Glyph size={14} color={DS_V3.color.textPrimary} />
            <Text style={styles.tagLabel}>{category}</Text>
          </View>
          <View style={[styles.bottom, { left: pad, right: pad, bottom: pad }]}>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.12) }]} numberOfLines={3}>
              {name}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{formatDays(days)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: "hidden" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  tag: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 6 },
  tagLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "600",
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: DS_V3.color.textPrimary,
  },
  bottom: { position: "absolute", gap: 8 },
  title: {
    fontWeight: "600",
    letterSpacing: -0.2,
    color: DS_V3.color.textPrimary,
  },
  chip: {
    alignSelf: "flex-start",
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: DS_V3.color.coverChip,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
});
