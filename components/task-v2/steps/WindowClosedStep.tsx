import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Clock } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import {
  WINDOW_CLOSED_FORBIDDEN,
  WINDOW_CLOSED_TOMORROW,
  windowClosedAtLine,
} from "@/lib/task-ui";

const ICON = DS_V3.space.xs * 6;

type Props = {
  closedAt: string;
  onBack: () => void;
  forbidden?: boolean;
};

export function WindowClosedStep({ closedAt, onBack, forbidden }: Props) {
  return (
    <View style={styles.body}>
      <Card>
        <Clock size={ICON} color={DS_V3.color.textSecondary} />
        <Text style={styles.title}>{windowClosedAtLine(closedAt)}</Text>
        <Text style={styles.bodyText}>{WINDOW_CLOSED_TOMORROW}</Text>
        {forbidden ? <Text style={styles.danger}>{WINDOW_CLOSED_FORBIDDEN}</Text> : null}
      </Card>
      <View style={styles.footer}>
        <Button label="Back" variant="tertiary" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.gutter,
  },
  title: {
    marginTop: DS_V3.space.md,
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  bodyText: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  danger: {
    marginTop: DS_V3.space.md,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: DS_V3.space.section,
  },
});
