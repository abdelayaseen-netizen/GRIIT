/**
 * Profile → Challenges. Running / Finished. Port of
 * design/handoff/src/components/ProfileChallenges.tsx on DS_V3.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import {
  detailLine,
  statusLine,
  type ChallengeRow,
} from "@/lib/profile-challenges";

export const FINISHED_PREDATE_CAPTION =
  "Runs that ended before this version shipped are here too, without an end screen.";

export function ProfileChallenges({
  challenges,
  formatDate,
  onOpen,
}: {
  challenges: ChallengeRow[];
  formatDate: (iso: string) => string;
  onOpen?: (row: ChallengeRow) => void;
}) {
  const running = challenges.filter((c) => c.status === "active");
  const finished = challenges
    .filter((c) => c.status !== "active")
    .sort((a, b) => (b.ended_at ?? "").localeCompare(a.ended_at ?? ""));

  return (
    <View>
      {running.length ? (
        <>
          <Text style={styles.section}>Running</Text>
          <View style={styles.gutter}>
            {running.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 ? <View style={styles.rule} /> : null}
                <Row c={c} fmt={formatDate} onPress={() => onOpen?.(c)} />
              </React.Fragment>
            ))}
          </View>
        </>
      ) : null}

      {finished.length ? (
        <>
          <Text style={styles.section}>Finished</Text>
          <View style={styles.gutter}>
            {finished.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 ? <View style={styles.rule} /> : null}
                <Row c={c} fmt={formatDate} onPress={() => onOpen?.(c)} />
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.foot}>{FINISHED_PREDATE_CAPTION}</Text>
        </>
      ) : null}
    </View>
  );
}

function Row({
  c,
  fmt,
  onPress,
}: {
  c: ChallengeRow;
  fmt: (iso: string) => string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${c.title} challenge`}
      style={styles.row}
    >
      <View style={styles.col}>
        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.caption}>{detailLine(c, fmt)}</Text>
      </View>
      <Text style={styles.caption}>{statusLine(c)}</Text>
      <ChevronRight size={18} color={DS_V3.color.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: 14,
    paddingBottom: 2,
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  gutter: { paddingHorizontal: DS_V3.space.gutter },
  rule: { height: 1, backgroundColor: DS_V3.color.border },
  row: {
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  col: { flex: 1, gap: 1 },
  title: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  foot: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: 14,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
