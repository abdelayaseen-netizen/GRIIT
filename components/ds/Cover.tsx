import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Dumbbell, Leaf, Moon, Target } from "lucide-react-native";
import { categoryTint, DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import { CATEGORY_MOTIF, type MotifTexture } from "@/lib/discover-card";

export type CoverCategory = keyof typeof categoryTint;

const ICON = {
  Fitness: Dumbbell,
  Faith: Moon,
  Mind: BookOpen,
  Health: Leaf,
  Discipline: Target,
  Learning: BookOpen,
} as const;

const COVER_RADIUS = 14;
const INK = DS_V3.color.textPrimary;
const TEXTURE_OPACITY = 0.08;
const STEP = 14;

/** Build 92 10.1: the category texture, drawn in textPrimary at 8% on the ink ground. */
function Texture({ kind, width, height }: { kind: MotifTexture; width: number; height: number }) {
  const lines: React.ReactNode[] = [];
  if (kind === "hatch-135") {
    const span = Math.ceil((width + height) / STEP);
    for (let i = 0; i < span; i++) {
      lines.push(
        <View
          key={i}
          style={[styles.hatch, { left: i * STEP - height, height: height * 1.6, top: -height * 0.3 }]}
        />,
      );
    }
  } else if (kind === "ruled-lines") {
    for (let y = STEP; y < height; y += STEP) lines.push(<View key={y} style={[styles.rule, { top: y }]} />);
  } else if (kind === "square-grid") {
    for (let y = STEP; y < height; y += STEP) lines.push(<View key={`h${y}`} style={[styles.rule, { top: y }]} />);
    for (let x = STEP; x < width; x += STEP) lines.push(<View key={`v${x}`} style={[styles.col, { left: x }]} />);
  } else if (kind === "dot-grid") {
    for (let y = STEP / 2; y < height; y += STEP) {
      for (let x = STEP / 2; x < width; x += STEP) {
        lines.push(<View key={`${x}-${y}`} style={[styles.dot, { left: x, top: y }]} />);
      }
    }
  } else {
    const c = Math.max(width, height);
    for (let r = STEP * 2; r < c * 1.4; r += STEP * 1.5) {
      lines.push(
        <View
          key={r}
          style={[styles.ring, { width: r * 2, height: r * 2, borderRadius: r, right: -r + width * 0.18, top: -r + height * 0.22 }]}
        />,
      );
    }
  }
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: TEXTURE_OPACITY }]}>
      {lines}
    </View>
  );
}

/**
 * v49.1 option 1a — title on the cover. Build 92 10.1: category motif and texture on ink,
 * no gradient, no photo; the day count stays tabular.
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
  const name = (title ?? "").trim();
  const iconOnly = width < 72 || !name;
  const pad = width >= 280 ? 16 : 12;
  const titleSize = width >= 280 ? 28 : width >= 160 ? 19 : 15;
  const motif = Math.round(Math.min(width, height) * 0.42);

  return (
    <View style={[styles.box, { width, height, borderRadius: iconOnly && width < 72 ? 10 : COVER_RADIUS }]}>
      {iconOnly ? null : <Texture kind={CATEGORY_MOTIF[category].texture} width={width} height={height} />}
      {iconOnly ? (
        <View style={styles.center}>
          <Glyph size={width < 72 ? 20 : 16} color={INK} />
        </View>
      ) : (
        <>
          <View pointerEvents="none" style={[styles.motif, { right: pad, top: pad + 18 }]}>
            <Glyph size={motif} color={INK} strokeWidth={1.25} />
          </View>
          <View style={[styles.tag, { left: pad, top: pad, right: pad }]}>
            <Glyph size={14} color={INK} />
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
  box: {
    overflow: "hidden",
    backgroundColor: DS_V3.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.hairline,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hatch: { position: "absolute", width: 1, backgroundColor: INK, transform: [{ rotate: "-45deg" }] },
  rule: { position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth * 2, backgroundColor: INK },
  col: { position: "absolute", top: 0, bottom: 0, width: StyleSheet.hairlineWidth * 2, backgroundColor: INK },
  dot: { position: "absolute", width: 2, height: 2, borderRadius: 1, backgroundColor: INK },
  ring: { position: "absolute", borderWidth: 1, borderColor: INK },
  motif: { position: "absolute", opacity: 0.16 },
  tag: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 6 },
  tagLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "600",
    letterSpacing: 0.66,
    textTransform: "uppercase",
    color: INK,
  },
  bottom: { position: "absolute", gap: 8 },
  title: {
    fontWeight: "600",
    letterSpacing: -0.2,
    color: INK,
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
    color: INK,
  },
});
