/**
 * ChallengeCard — 01_components.md "ChallengeCard", frame 02.
 * Screen component. ds primitives only.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import { catalogCoverCategory } from "@/lib/catalog-cover";
import Button from "@/components/ds/Button";
import { Cover } from "@/components/ds/Cover";

export type ChallengeCardProps = {
  title: string;
  coverUri?: string | null;
  coverLabel?: string | null;
  category?: string | null;
  days: number;
  difficulty: string;
  featured?: boolean;
  proofType?: string;
  joined?: boolean;
  onStart?: () => void;
  onPress?: () => void;
};

function dayPhrase(n: number): string {
  return formatDays(n);
}

export default function ChallengeCard({
  title,
  coverLabel,
  category,
  days,
  difficulty,
  featured,
  proofType,
  joined,
  onStart,
  onPress,
}: ChallengeCardProps) {
  const gridMeta = `${dayPhrase(days)} · ${difficulty}`;
  const featuredMeta = proofType ? `${dayPhrase(days)} · ${proofType}` : gridMeta;
  const meta = featured ? featuredMeta : gridMeta;
  const [width, setWidth] = React.useState(0);
  const coverH = featured ? 168 : 110;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title || coverLabel || "Challenge"}
      onPress={onPress}
      style={styles.wrap}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next > 0 && next !== width) setWidth(next);
      }}
    >
      {width > 0 ? (
        <Cover
          category={catalogCoverCategory(category)}
          days={days}
          width={width}
          height={coverH}
        />
      ) : (
        <View style={{ height: coverH }} />
      )}
      <Text style={styles.featuredTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.gridMeta}>{meta}</Text>
      {featured ? (
        <Button
          label={joined ? "Joined" : "Start"}
          variant={joined ? "secondary" : "primary"}
          size="small"
          onPress={joined ? onPress : (onStart ?? onPress)}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: DS_V3.space.sm,
  },
  featuredTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  gridMeta: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
