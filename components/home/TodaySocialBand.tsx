/**
 * v48.2 option C. None is one text line. A photo row only when someone posted.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { TODAY_BAND_NONE, todayBandCopy, type TodayPoster } from "@/lib/today-band";

export default function TodaySocialBand({
  posters,
  pending,
  onPress,
}: {
  posters: TodayPoster[];
  pending: boolean;
  onPress: () => void;
}) {
  if (pending) return null;
  if (posters.length === 0) {
    return <Text style={styles.none}>{TODAY_BAND_NONE}</Text>;
  }
  const copy = todayBandCopy(posters);
  const newest = [...posters].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copy}
      onPress={onPress}
      style={styles.card}
    >
      {newest?.photoUrl ? (
        <Image source={{ uri: newest.photoUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.thumb} />
      )}
      <Text style={styles.copy} numberOfLines={2}>{copy}</Text>
      <ChevronRight size={18} color={DS_V3.color.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  none: {
    ...DS_V3.type.secondary,
    color: DS_V3.color.textSecondary,
    minHeight: 44,
    textAlignVertical: "center",
  },
  card: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 14,
    backgroundColor: DS_V3.color.surface,
  },
  thumb: {
    width: 44,
    height: 55,
    borderRadius: 8,
    backgroundColor: DS_V3.color.raised,
  },
  copy: {
    ...DS_V3.type.secondary,
    color: DS_V3.color.textSecondary,
    flex: 1,
  },
});
