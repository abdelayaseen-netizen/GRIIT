import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, ShieldOff, Users } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import {
  SELF_REPORT_RECORDS_HEADING,
  SELF_REPORT_RECORDS_ROWS,
  SIMPLE_ASK_CAPTION,
  SIMPLE_ASK_CTA,
  SIMPLE_ASK_HONESTY,
  SIMPLE_ASK_NOT_YET,
  SIMPLE_ASK_SAVING,
} from "@/lib/simple-log";

const ICON = DS_V3.space.gutter;
const ROW_ICONS = [Check, Users, ShieldOff] as const;

type Props = {
  taskName: string;
  loading?: boolean;
  footerCaption?: string;
  footerBrand?: boolean;
  onDidIt: () => void;
  onNotYet: () => void;
};

export function AskStep({
  taskName,
  loading,
  footerCaption = SIMPLE_ASK_CAPTION,
  footerBrand,
  onDidIt,
  onNotYet,
}: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{taskName}</Text>
      <Text style={styles.honesty}>{SIMPLE_ASK_HONESTY}</Text>
      <Text style={styles.recordsLabel}>{SELF_REPORT_RECORDS_HEADING}</Text>
      <Card>
        <View style={styles.rows}>
          {SELF_REPORT_RECORDS_ROWS.map((row, i) => {
            const Icon = ROW_ICONS[i] ?? Check;
            return (
              <View key={row} style={styles.row}>
                <Icon size={ICON} color={DS_V3.color.textSecondary} />
                <Text style={styles.rowText}>{row}</Text>
              </View>
            );
          })}
        </View>
      </Card>
      <View style={styles.footer}>
        <Button label={loading ? SIMPLE_ASK_SAVING : SIMPLE_ASK_CTA} loading={loading} onPress={onDidIt} />
        <Text style={[styles.caption, footerBrand ? styles.captionBrand : null]}>{footerCaption}</Text>
        <Button
          label={SIMPLE_ASK_NOT_YET}
          variant="secondary"
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
    marginTop: DS_V3.space.section,
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  honesty: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  recordsLabel: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  rows: {
    gap: DS_V3.space.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  rowText: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
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
    textAlign: "center",
  },
  captionBrand: {
    color: DS_V3.color.brandText,
  },
});
