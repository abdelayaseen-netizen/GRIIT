/**
 * Discover grid card. v49.1 option 1a: title lives on the cover.
 * Tap opens the preview sheet. No Start button. Build 92 10.1: says what you do and how it is
 * proven, "New" under 5 people, and "Joined" once you are in (tap then opens the challenge).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { catalogCoverCategory } from "@/lib/catalog-cover";
import { Cover } from "@/components/ds/Cover";
import { DISCOVER_JOINED, peopleLabel } from "@/lib/discover-card";

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
  /** "Run 3 mi · Strava" from the first task. */
  does?: string | null;
  onStart?: () => void;
  onPress?: () => void;
  testID?: string;
};

export default function ChallengeCard({
  title,
  category,
  days,
  difficulty,
  people,
  joined,
  does,
  onPress,
  testID,
}: ChallengeCardProps) {
  const [width, setWidth] = React.useState(0);
  const coverH = width > 0 ? Math.round(width * 1.25) : 0;
  const doesText = (does ?? "").trim();
  const hard = difficulty.trim().toLowerCase() === "hard";

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={joined ? `${title || "Challenge"}, ${DISCOVER_JOINED}` : title || "Challenge"}
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
      {doesText ? (
        <Text style={styles.does} numberOfLines={2}>
          {doesText}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        {people != null ? <Text style={styles.meta}>{peopleLabel(people)}</Text> : null}
        {joined ? (
          <View testID={testID ? `${testID}-joined` : undefined} style={styles.joined}>
            <Text style={styles.joinedText}>{DISCOVER_JOINED}</Text>
          </View>
        ) : null}
      </View>
      {hard ? (
        <View style={styles.hard}>
          <Text style={styles.hardText}>Strict</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  does: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  joined: {
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.raised,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  joinedText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
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
