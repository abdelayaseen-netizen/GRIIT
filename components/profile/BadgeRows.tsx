import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

export type BadgeRowItem = {
  label: string;
  earnedOn?: string;
  requirement: string;
};

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five"] as const;

export const BADGES_FOOTNOTE =
  "Five marks, each earned by verified days only. Nothing here can be bought or awarded.";

export function badgeRowsA11y(b: BadgeRowItem): string {
  return b.earnedOn ? `${b.label}, earned ${b.earnedOn}` : `${b.label}, locked. ${b.requirement}`;
}

export function BadgeRows({
  badges,
  footnote = BADGES_FOOTNOTE,
}: {
  badges: BadgeRowItem[];
  footnote?: string;
}) {
  const earnedCount = badges.filter((b) => !!b.earnedOn).length;
  const word = WORDS[earnedCount] ?? String(earnedCount);
  return (
    <View style={styles.wrap}>
      <Text style={styles.meta}>{word} of {badges.length} earned.</Text>
      {badges.map((b, i) => {
        const earned = !!b.earnedOn;
        return (
          <View key={b.label}>
            {i > 0 ? <View style={styles.rule} /> : null}
            <View style={styles.row} accessibilityLabel={badgeRowsA11y(b)}>
              <View style={[styles.stamp, earned ? styles.stampEarned : styles.stampLocked]}>
                <Text style={[styles.stampText, earned ? styles.earnedInk : styles.lockedInk]}>{b.label}</Text>
              </View>
              <Text style={styles.body}>{earned ? `Earned ${b.earnedOn}` : b.requirement}</Text>
              <Text style={[styles.trail, earned ? styles.earnedInk : styles.lockedInk]}>
                {earned ? "Earned" : "Locked"}
              </Text>
            </View>
          </View>
        );
      })}
      <Text style={styles.meta}>{footnote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: DS_V3.space.lg },
  meta: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  rule: { height: 1, backgroundColor: DS_V3.color.border },
  row: {
    minHeight: 44,
    paddingVertical: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  stamp: {
    borderWidth: 1.5,
    borderRadius: DS_V3.radius.input,
    paddingHorizontal: DS_V3.space.sm,
    paddingVertical: DS_V3.space.xs,
  },
  stampEarned: { borderColor: DS_V3.color.brandText },
  stampLocked: { borderColor: DS_V3.color.border },
  stampText: {
    fontFamily: "BarlowCondensed_600SemiBold",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.96,
    textTransform: "uppercase",
  },
  body: { flex: 1, ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  trail: { ...DS_V3.type.label, letterSpacing: 0, textTransform: "none" },
  earnedInk: { color: DS_V3.color.brandText },
  lockedInk: { color: DS_V3.color.textSecondary },
});
