import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import {
  SELF_REPORT_RECORDS_HEADING,
  SELF_REPORT_RECORDS_ROWS,
  SIMPLE_ASK_CTA,
  SIMPLE_ASK_HEADING,
  SIMPLE_ASK_HONESTY,
  SIMPLE_ASK_NOT_YET,
} from "@/lib/simple-log";

type Props = {
  taskName: string;
  loading?: boolean;
  onDidIt: () => void;
  onNotYet: () => void;
};

export function AskStep({ taskName, loading, onDidIt, onNotYet }: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{SIMPLE_ASK_HEADING}</Text>
      <Text style={styles.task}>{taskName}</Text>
      <Text style={styles.honesty}>{SIMPLE_ASK_HONESTY}</Text>
      <Text style={styles.recordsHeading}>{SELF_REPORT_RECORDS_HEADING}</Text>
      <Card>
        <View style={styles.rows}>
          {SELF_REPORT_RECORDS_ROWS.map((row) => (
            <Text key={row} style={styles.row}>
              {row}
            </Text>
          ))}
        </View>
      </Card>
      <View style={styles.footer}>
        <Button label={SIMPLE_ASK_CTA} loading={loading} onPress={onDidIt} />
        <Text style={styles.caption}>{SELF_REPORT_RECORDS_ROWS[1]}</Text>
        <Button
          label={SIMPLE_ASK_NOT_YET}
          variant="tertiary"
          ink
          disabled={loading}
          onPress={onNotYet}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  task: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  honesty: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  recordsHeading: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  rows: {
    gap: DS_V3.space.md,
  },
  row: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  footer: {
    marginTop: "auto" as const,
    gap: DS_V3.space.sm,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
