/**
 * Discover grid card. v49.1 option 1a: title lives on the cover.
 * Tap opens the preview sheet. No Start button.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { catalogCoverCategory } from "@/lib/catalog-cover";
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
  people?: number;
  joined?: boolean;
  onStart?: () => void;
  onPress?: () => void;
};

function caption(people: number | undefined, gate: string): string {
  const g = gate.trim();
  if (people == null) return g;
  const n = Math.max(0, Math.floor(people));
  const who = n === 1 ? "1 person" : `${n.toLocaleString("en-US")} people`;
  return g ? `${who} · ${g}` : who;
}

export default function ChallengeCard({
  title,
  category,
  days,
  difficulty,
  proofType,
  people,
  onPress,
}: ChallengeCardProps) {
  const [width, setWidth] = React.useState(0);
  const coverH = width > 0 ? Math.round(width * 1.25) : 0;
  const gate = (proofType ?? "").trim();
  const hard = difficulty.trim().toLowerCase() === "hard";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title || "Challenge"}
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
          title={title}
          days={days}
          width={width}
          height={coverH}
        />
      ) : (
        <View style={{ aspectRatio: 4 / 5 }} />
      )}
      {caption(people, gate) ? (
        <Text style={styles.meta} numberOfLines={2}>
          {caption(people, gate)}
        </Text>
      ) : null}
      {hard ? (
        <View style={styles.hard}>
          <Text style={styles.hardText}>Hard</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: DS_V3.color.textSecondary,
  },
  hard: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.hairline,
    borderRadius: DS_V3.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hardText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: DS_V3.color.textSecondary,
  },
});
