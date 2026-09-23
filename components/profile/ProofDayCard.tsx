import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Lock } from "lucide-react-native";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import type { ProofDay } from "@/lib/day-state";
import { proofsDateLabel } from "@/lib/proofs-grid";

const SCRIM = "rgba(15,15,15,0.8)";
const LOCK_DISC = "rgba(15,15,15,0.72)";

export function proofDayA11y(day: ProofDay, dateLabel: string, isOwner: boolean): string {
  const n = day.photoCount;
  const photos = `${n} photo${n === 1 ? "" : "s"}`;
  const priv = isOwner && day.hasPrivate ? ", includes private" : "";
  return `${dateLabel}, ${photos}${priv}`;
}

export function ProofDayCard({
  day,
  isOwner,
  onPress,
}: {
  day: ProofDay & { coverUri?: string | null };
  isOwner: boolean;
  onPress?: (dateKey: string) => void;
}) {
  const label = proofsDateLabel(day.dateKey);
  const n = day.photoCount;
  return (
    <Pressable
      onPress={() => onPress?.(day.dateKey)}
      accessibilityRole="button"
      accessibilityLabel={proofDayA11y(day, label, isOwner)}
      style={styles.card}
    >
      {day.coverUri ? (
        <Image source={{ uri: day.coverUri }} style={styles.cover} contentFit="cover" cachePolicy="memory-disk" />
      ) : (
        <View style={styles.cover} />
      )}
      <View style={styles.scrim} />
      <Text style={styles.date} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.count, day.hasPrivate && isOwner ? styles.countInset : null]}>
        {n} photo{n === 1 ? "" : "s"}
      </Text>
      {isOwner && day.hasPrivate ? (
        <View style={styles.lock} accessibilityElementsHidden importantForAccessibility="no">
          <Lock size={9} color={DS_V3.color.textPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 116,
    height: 116,
    borderRadius: DS_V3.radius.input,
    overflow: "hidden",
    backgroundColor: DS_V3.color.surface,
  },
  cover: { ...StyleSheet.absoluteFillObject },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "58%",
    backgroundColor: SCRIM,
  },
  date: {
    position: "absolute",
    left: 7,
    right: 7,
    bottom: 20,
    ...DS_V3.type.caption,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  count: {
    position: "absolute",
    left: 7,
    right: 7,
    bottom: 5,
    ...DS_V3.type.label,
    letterSpacing: 0,
    textTransform: "none",
    color: DS_V3.color.textSecondary,
  },
  countInset: { right: 24 },
  lock: {
    position: "absolute",
    right: 5,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: LOCK_DISC,
    alignItems: "center",
    justifyContent: "center",
  },
});
