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
  /** Profile uses Title (20/25/600). Other roots stay display. */
  titleSize?: "display" | "title";
};

export default function RootHeader({ title, kicker, actions, titleSize = "display" }: RootHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        <Text style={titleSize === "title" ? styles.titleMd : styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: DS_V3.space.sm,
    paddingBottom: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    backgroundColor: DS_V3.color.canvas,
    zIndex: 2,
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
    color: DS_V3.color.textPrimary,
  },
  titleMd: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.xs,
  },
});
