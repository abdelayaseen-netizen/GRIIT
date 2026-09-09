/**
 * Challenge done, user day not secured — other enrollments still have tasks.
 * Ink, DS_V3, no display face. Nothing earned yet.
 * Remaining count comes from today_state. Next challenge returns to Home.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { challengeDoneLine, challengeDoneTitle } from "@/lib/task-completion-result";
import { useToday } from "@/hooks/useToday";

export default function ChallengeDoneScreen({
  challengeTitle,
  remainingChallenges,
  onNext,
  onDone,
}: {
  challengeTitle: string;
  remainingChallenges?: number;
  onNext: () => void;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const todayQuery = useToday();
  const remaining = todayQuery.data?.remaining_challenges ?? remainingChallenges ?? 0;
  return (
    <View style={styles.root}>
      <View style={[styles.body, { paddingTop: insets.top + DS_V3.space.section }]}>
        <Text style={styles.title}>{challengeDoneTitle(challengeTitle)}</Text>
        <Text style={styles.line}>{challengeDoneLine(remaining)}</Text>
      </View>
      <View style={[styles.footer, { bottom: insets.bottom + DS_V3.space.gutter }]}>
        <Button label="Next challenge" onPress={onNext} />
        <Button label="Done" variant="tertiary" ink onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  body: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  title: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  line: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    position: "absolute",
    left: DS_V3.space.gutter,
    right: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
