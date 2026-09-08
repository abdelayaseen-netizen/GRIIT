/**
 * ChallengeCard — 01_components.md "ChallengeCard", frame 02.
 * Screen component. ds primitives only.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ProofImage from "@/components/ds/ProofImage";

export type ChallengeCardProps = {
  title: string;
  coverUri?: string | null;
  days: number;
  difficulty: string;
  featured?: boolean;
  proofType?: string;
  joined?: boolean;
  onStart?: () => void;
  onPress?: () => void;
};

function dayPhrase(n: number): string {
  return n === 1 ? "1 day" : `${n} days`;
}

function httpsCover(uri?: string | null): string | null {
  if (typeof uri !== "string") return null;
  const t = uri.trim();
  return /^https:\/\//i.test(t) ? t : null;
}

export default function ChallengeCard({
  title,
  coverUri,
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
  const size = featured ? "feed" : "card";
  const cover = httpsCover(coverUri);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={styles.wrap}
    >
      <View>
        <ProofImage
          uri={cover}
          size={size}
          scrim
          title={featured ? undefined : title}
        />
        {featured ? (
          <View style={styles.featuredRow} pointerEvents="box-none">
            <View style={styles.featuredCopy}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.featuredMeta}>{featuredMeta}</Text>
            </View>
            <Button
              label={joined ? "Joined" : "Start"}
              variant={joined ? "secondary" : "primary"}
              size="small"
              disabled={joined}
              onPress={onStart ?? onPress}
            />
          </View>
        ) : null}
      </View>
      {featured ? null : <Text style={styles.gridMeta}>{gridMeta}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: DS_V3.space.sm,
  },
  featuredRow: {
    position: "absolute",
    left: DS_V3.space.lg,
    right: DS_V3.space.lg,
    bottom: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
  },
  featuredCopy: {
    flex: 1,
    gap: DS_V3.space.xs,
  },
  featuredTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  featuredMeta: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  gridMeta: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
