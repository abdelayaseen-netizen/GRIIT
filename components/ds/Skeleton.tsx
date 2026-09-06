/**
 * Skeleton — 01_components.md "Skeleton"
 * Laws: 17 (card recipe, two border bars), 19 (no pulsing animation).
 * `variant: "proof"` is the ProofImage 4:5 frame, still static.
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Card from "./Card";

export type SkeletonVariant = "card" | "proof";

export type SkeletonProps = {
  lines?: number;
  variant?: SkeletonVariant;
};

export default function Skeleton({ lines = 2, variant = "card" }: SkeletonProps) {
  if (variant === "proof") {
    return <View style={styles.proof} />;
  }

  return (
    <Card>
      <View style={styles.stack}>
        {Array.from({ length: lines }).map((_, i) => (
          <View
            key={i}
            style={[styles.bar, i === 0 ? styles.barWide : styles.barNarrow]}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: DS_V3.space.md,
  },
  bar: {
    height: DS_V3.space.lg,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.border,
  },
  barWide: {
    width: "60%",
  },
  barNarrow: {
    width: "40%",
  },
  proof: {
    aspectRatio: 4 / 5,
    borderRadius: DS_V3.radius.card,
    backgroundColor: DS_V3.color.border,
  },
});
