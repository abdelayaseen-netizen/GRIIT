/**
 * Badges — 01_components.md "Badges"
 * Two column stamp grid on the canvas. No cards, no icons, no circles.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

const STROKE = (DS_V3.space.xs * 3) / 8;

export type BadgeItem = {
  label: string;
  earnedOn?: string;
  requirement: string;
};

export type BadgesProps = {
  badges: BadgeItem[];
  footnote: string;
};

export default function Badges({ badges, footnote }: BadgesProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {badges.map((b) => {
          const earned = Boolean(b.earnedOn);
          const color = earned ? DS_V3.color.brandText : DS_V3.color.textSecondary;
          const stroke = earned ? DS_V3.color.brandText : DS_V3.color.border;
          return (
            <View key={b.label} style={styles.cell}>
              <View style={[styles.stamp, { borderColor: stroke }]}>
                <Text style={[styles.stampLabel, { color }]}>{b.label.toUpperCase()}</Text>
              </View>
              <Text style={[styles.caption, { color }]}>
                {earned ? b.earnedOn : b.requirement}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.foot}>{footnote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: DS_V3.space.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.md,
  },
  cell: {
    width: "47%",
    gap: DS_V3.space.xs,
  },
  stamp: {
    alignSelf: "flex-start",
    borderWidth: STROKE,
    borderRadius: DS_V3.radius.input,
    paddingVertical: DS_V3.space.xs * 1.5,
    paddingHorizontal: DS_V3.space.xs * 2.5,
  },
  stampLabel: {
    fontSize: DS_V3.type.stamp.fontSize,
    lineHeight: DS_V3.type.stamp.lineHeight,
    fontWeight: DS_V3.type.stamp.fontWeight,
    fontFamily: DS_V3.type.stamp.fontFamily,
    letterSpacing: DS_V3.type.stamp.letterSpacing,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
  },
  foot: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
