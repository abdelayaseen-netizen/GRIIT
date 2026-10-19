/**
 * Build 92 10.4 (P3-19): today's "started" events as one quiet line. Not likeable, not
 * commentable; tap opens the list of who started what.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import Sheet from "@/components/ds/Sheet";
import { DS_V3 } from "@/lib/design-system";
import { startedLine, type StartedDayGroup, type StartedEntry } from "@/lib/feed-fold";

export default function StartedDayRow({ group, onPress }: { group: StartedDayGroup; onPress: () => void }) {
  const line = startedLine(group);
  return (
    <Pressable
      testID="feed-started-day"
      accessibilityRole="button"
      accessibilityLabel={line}
      onPress={onPress}
      style={styles.row}
    >
      <Text style={styles.line} numberOfLines={2}>
        {line}
      </Text>
      <ChevronRight size={16} color={DS_V3.color.textTertiary} />
    </Pressable>
  );
}

export function StartedDaySheet({
  group,
  onClose,
  onOpenChallenge,
}: {
  group: StartedDayGroup | null;
  onClose: () => void;
  onOpenChallenge: (entry: StartedEntry) => void;
}) {
  return (
    <Sheet visible={group != null} onDismiss={onClose} heading={group ? startedLine(group) : ""}>
      <View style={styles.list} testID="feed-started-list">
        {(group?.entries ?? []).map((e) => (
          <Pressable
            key={`${e.userId}-${e.challengeId ?? ""}`}
            accessibilityRole="button"
            accessibilityLabel={`${e.name || "Someone"}, ${e.challengeName}`}
            onPress={() => onOpenChallenge(e)}
            style={styles.entry}
          >
            <Text style={styles.name} numberOfLines={1}>
              {e.name || "Someone"}
            </Text>
            <Text style={styles.challenge} numberOfLines={1}>
              {e.challengeName}
            </Text>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: DS_V3.space.md,
  },
  line: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
  list: { gap: DS_V3.space.xs },
  entry: { paddingVertical: DS_V3.space.sm, gap: 2 },
  name: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  challenge: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
});
