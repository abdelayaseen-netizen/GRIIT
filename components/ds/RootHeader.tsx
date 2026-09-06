/**
 * RootHeader — 01_components.md "RootHeader"
 * Laws: 8 (root: display title at the gutter, 8pt below the status bar).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";

export type RootHeaderProps = {
  title: string;
  kicker?: string;
  actions?: React.ReactNode;
};

export default function RootHeader({ title, kicker, actions }: RootHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
  },
  copy: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
  },
  kicker: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  title: {
    fontSize: DS_V3.type.display.fontSize,
    lineHeight: DS_V3.type.display.lineHeight,
    fontWeight: DS_V3.type.display.fontWeight,
    letterSpacing: DS_V3.type.display.letterSpacing,
    color: DS_V3.color.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.xs,
  },
});
