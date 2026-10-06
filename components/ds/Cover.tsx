import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Dumbbell, Leaf, Moon, Sun, Target } from "lucide-react-native";
import { categoryTint, DS_V3 } from "@/lib/design-system";

export type CoverCategory = keyof typeof categoryTint;

const ICON = {
  Fitness: Dumbbell,
  Faith: Moon,
  Mind: Sun,
  Health: Leaf,
  Discipline: Target,
  Learning: BookOpen,
} as const;

/** Generator cover. Never a proof photo. */
export function Cover({
  category,
  days,
  width,
  height,
}: {
  category: CoverCategory;
  days: number;
  width: number;
  height: number;
}) {
  const Glyph = ICON[category];
  const tint = categoryTint[category];
  const big = width >= 200;
  if (width < 60) {
    return (
      <View style={[styles.box, { width, height, backgroundColor: tint, borderRadius: DS_V3.radius.card }]}>
        <Text style={[styles.days, { fontSize: Math.round(width * 0.42), lineHeight: Math.round(width * 0.42) }]}>{days}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.box, { width, height, backgroundColor: tint, borderRadius: DS_V3.radius.card }]}>
      <View style={{ position: "absolute", left: big ? 16 : 10, top: big ? 14 : 10 }}>
        <Glyph size={big ? 22 : 16} color={DS_V3.color.textPrimary} />
      </View>
      <View style={{ position: "absolute", left: big ? 16 : 10, bottom: big ? 14 : 10 }}>
        <Text style={[styles.days, { fontSize: Math.round(width * 0.3), lineHeight: Math.round(width * 0.3) }]}>{days}</Text>
        <Text style={styles.unit}>days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  days: { fontWeight: DS_V3.displayWeight, color: DS_V3.color.textPrimary },
  unit: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary, opacity: 0.86 },
});
