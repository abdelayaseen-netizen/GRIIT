/**
 * Frame 114 / B3. 252pt non-camera share card.
 * FinishMoment preview and Story sticker for every type that is not camera.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { FINISH_TEXT_CARD_H } from "@/lib/share-sticker";

export type FinishTextCardProps = {
  challengeTitle: string;
  title: string;
  dayN: number;
  durationDays: number;
  gateLine: string;
  height?: number;
};

export default function FinishTextCard({
  challengeTitle,
  title,
  dayN,
  durationDays,
  gateLine,
  height = FINISH_TEXT_CARD_H,
}: FinishTextCardProps) {
  return (
    <View style={[styles.card, { height }]}>
      <Text style={styles.eyebrow}>{challengeTitle}</Text>
      <View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.dayRow}>
          <Text style={styles.dayN}>Day {dayN}</Text>
          <Text style={styles.of}>of {durationDays}</Text>
        </View>
      </View>
      <Text style={styles.caption}>{gateLine}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: DS_V3.radius.card,
    backgroundColor: DS_V3.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.border,
    padding: 18,
    justifyContent: "space-between",
  },
  eyebrow: { ...DS_V3.type.label, color: DS_V3.color.textSecondary },
  title: { ...DS_V3.type.title, color: DS_V3.color.textPrimary },
  dayRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  dayN: {
    fontFamily: DS_V3.type.number.fontFamily,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  of: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
