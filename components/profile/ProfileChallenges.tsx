/**
 * Profile → Challenges. Running / Finished. ChallengeCard, no footnote.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { ChallengeCard } from "@/components/profile/ChallengeCard";
import {
  cardChip,
  cardDue,
  cardLine,
  type ChallengeRow,
} from "@/lib/profile-challenges";

export function ProfileChallenges({
  challenges,
  formatDate,
  onOpen,
}: {
  challenges: ChallengeRow[];
  formatDate: (iso: string) => string;
  onOpen?: (row: ChallengeRow) => void;
}) {
  void formatDate;
  const running = challenges.filter((c) => c.status === "active");
  const left = challenges
    .filter((c) => c.status === "abandoned")
    .sort((a, b) => (b.ended_at ?? "").localeCompare(a.ended_at ?? ""));
  const finished = challenges
    .filter((c) => c.status === "completed" || c.status === "failed")
    .sort((a, b) => (b.ended_at ?? "").localeCompare(a.ended_at ?? ""));

  return (
    <View>
      {running.length ? (
        <>
          <Text style={styles.section}>Running</Text>
          <View style={styles.gutter}>
            {running.map((c) => (
              <View key={c.id} style={styles.cardWrap}>
                <ChallengeCard
                  title={c.title}
                  status={c.status}
                  line={cardLine(c)}
                  todayChip={cardChip(c)}
                  days={c.segs ?? []}
                  secured={c.secured_days}
                  due={cardDue(c)}
                  onPress={() => onOpen?.(c)}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      {finished.length ? (
        <>
          <Text style={styles.section}>Finished</Text>
          <View style={styles.gutter}>
            {finished.map((c) => (
              <View key={c.id} style={styles.cardWrap}>
                <ChallengeCard
                  title={c.title}
                  status={c.status}
                  line={cardLine(c)}
                  days={c.segs ?? []}
                  onPress={() => onOpen?.(c)}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      {left.length ? (
        <>
          <Text style={styles.section}>Left</Text>
          <View style={styles.gutter}>
            {left.map((c) => (
              <View key={c.id} style={styles.cardWrap}>
                <ChallengeCard
                  title={c.title}
                  status={c.status}
                  line={cardLine(c)}
                  days={c.segs ?? []}
                  onPress={() => onOpen?.(c)}
                />
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: 14,
    paddingBottom: 8,
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  gutter: { paddingHorizontal: DS_V3.space.gutter, gap: 10 },
  cardWrap: {},
});
