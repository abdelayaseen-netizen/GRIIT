/**
 * Frame 126. One cell for the week strip and the proofs calendar.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { ImageOff, Lock, Shield, Snowflake } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { dayCellBorderWidth, dayCellLabel, type DayCellKind } from "@/lib/day-cell";

export type DayCellProps = {
  kind: DayCellKind;
  size?: number;
  coverUrl?: string | null;
  lock?: boolean;
  dateNum?: number;
  onPress?: () => void;
  accessibilityPrefix?: string;
};

export default function DayCell({
  kind,
  size = 44,
  coverUrl,
  lock = false,
  dateNum,
  onPress,
  accessibilityPrefix,
}: DayCellProps) {
  const label = [accessibilityPrefix, dayCellLabel(kind)].filter(Boolean).join(", ");
  const tappable = Boolean(onPress);
  const showPhoto = (kind === "camera" || kind === "private") && Boolean(coverUrl);
  const icon = size * 0.32;
  const inner = (
    <View
      style={[
        styles.base,
        { width: size, height: size, opacity: kind === "future" || kind === "before" || kind === "na" ? 0.35 : 1 },
        fillStyle(kind),
      ]}
    >
      {showPhoto ? (
        <Image
          source={{ uri: coverUrl! }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : null}
      {dateNum != null ? (
        <Text
          style={[
            styles.num,
            {
              color:
                kind === "self"
                  ? DS_V3.color.canvas
                  : kind === "camera" || kind === "private" || kind === "today"
                    ? DS_V3.color.textPrimary
                    : DS_V3.color.textSecondary,
              textShadowColor: kind === "camera" || kind === "private" ? "rgba(0,0,0,0.9)" : undefined,
              textShadowOffset: kind === "camera" || kind === "private" ? { width: 0, height: 1 } : undefined,
              textShadowRadius: kind === "camera" || kind === "private" ? 2 : undefined,
            },
          ]}
        >
          {dateNum}
        </Text>
      ) : null}
      {kind === "photo_missing" ? (
        <ImageOff size={icon} color={DS_V3.color.textSecondary} strokeWidth={2} />
      ) : null}
      {kind === "freeze" ? (
        <Snowflake size={icon} color={DS_V3.color.textPrimary} strokeWidth={2} />
      ) : null}
      {kind === "last_stand" ? (
        <Shield size={icon} color={DS_V3.color.brandText} strokeWidth={2} />
      ) : null}
      {lock ? (
        <View style={styles.lockDisc} accessibilityElementsHidden>
          <Lock size={9} color={DS_V3.color.textPrimary} strokeWidth={2.4} />
        </View>
      ) : null}
    </View>
  );

  if (tappable) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }
  return (
    <View accessibilityLabel={label} accessible>
      {inner}
    </View>
  );
}

function fillStyle(kind: DayCellKind) {
  switch (kind) {
    case "self":
      return { backgroundColor: DS_V3.color.brand };
    case "camera":
    case "private":
      return { backgroundColor: DS_V3.color.surface };
    case "photo_missing":
    case "freeze":
    case "last_stand":
      return {
        backgroundColor: DS_V3.color.surface,
        borderWidth: kind === "last_stand" ? 1.5 : 1,
        borderColor: kind === "last_stand" ? DS_V3.color.brand : DS_V3.color.border,
      };
    case "missed":
      return { borderWidth: dayCellBorderWidth(kind), borderColor: DS_V3.color.textSecondary };
    case "today":
      return { borderWidth: dayCellBorderWidth(kind), borderColor: DS_V3.color.brand };
    case "future":
    case "before":
      return { borderWidth: dayCellBorderWidth(kind), borderColor: DS_V3.color.border };
    case "na":
      return { backgroundColor: "transparent" };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  num: {
    position: "absolute",
    left: 4,
    top: 3,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  lockDisc: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(15,15,15,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
});
