/**
 * Preview before Join. 780 high. Does not join until the button is pressed.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import {
  DAY_1_TODAY,
  LIMIT_CAMERA,
  LIMIT_NONE,
  LIMIT_OPTIONAL,
  LIMIT_PLACE,
  LIMIT_TIME,
  NOBODY_YET,
  type FeaturedBuiltin,
  featuredCardLine,
} from "@/lib/featured-catalog";

function limits(item: FeaturedBuiltin): string[] {
  const lines: string[] = [];
  if (item.proof === "camera") lines.push(LIMIT_CAMERA);
  if (item.proof === "optional") lines.push(LIMIT_OPTIONAL);
  if (item.rule.includes("By ")) {
    const time = item.rule.split("By ")[1] ?? "";
    if (time) lines.push(LIMIT_TIME(time.replace(" am", " am")));
  }
  if (item.placeGate) lines.push(LIMIT_PLACE("250 m"));
  if (lines.length === 0) lines.push(LIMIT_NONE);
  return lines;
}

export function ChallengePreviewSheet({
  item,
  members,
  joining,
  onJoin,
  onClose,
}: {
  item: FeaturedBuiltin | null;
  members: number;
  joining?: boolean;
  onJoin: (item: FeaturedBuiltin) => void;
  onClose: () => void;
}) {
  if (!item) return null;
  return (
    <Sheet
      visible
      onDismiss={onClose}
      heading={item.title}
      footer={
        <>
          <Text style={styles.day}>{DAY_1_TODAY}</Text>
          <Button label="Join" onPress={() => onJoin(item)} submitting={joining} />
        </>
      }
    >
      <ScrollView style={styles.scroll}>
        <Text style={styles.meta}>{featuredCardLine(item)} · {item.category}</Text>
        <Text style={styles.section}>Each day</Text>
        <Text style={styles.row}>{item.task}</Text>
        <Text style={styles.rule}>{item.rule}</Text>
        <Text style={styles.section}>Limits</Text>
        {limits(item).map((line) => (
          <Text key={line} style={styles.rule}>{line}</Text>
        ))}
        <Text style={styles.section}>Who's in it</Text>
        <Text style={styles.rule}>{members > 0 ? `${members} people` : NOBODY_YET}</Text>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 420 },
  meta: { fontSize: 15, lineHeight: 20, color: DS_V3.color.textSecondary },
  section: { marginTop: 16, fontSize: 13, lineHeight: 16, fontWeight: "500", color: DS_V3.color.textSecondary },
  row: { marginTop: 8, fontSize: 17, lineHeight: 22, fontWeight: "500", color: DS_V3.color.textPrimary },
  rule: { marginTop: 4, fontSize: 15, lineHeight: 20, color: DS_V3.color.textSecondary },
  day: { textAlign: "center", marginBottom: 8, color: DS_V3.color.textSecondary },
  close: { marginTop: 16, color: DS_V3.color.brandText, fontWeight: "500" },
});
