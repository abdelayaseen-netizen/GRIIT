import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Spinner from "@/components/ds/Spinner";

const CAPTION = "Nothing is secured until the server says so.";

export function TaskVerifying({
  line = "Posting your proof…",
}: {
  line?: string;
}) {
  return (
    <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel={line}>
      <View style={styles.takeover} accessibilityElementsHidden>
        <Spinner size={44} />
      </View>
      <View style={styles.footer}>
        <Button label={line} loading />
        <Text style={styles.caption}>{CAPTION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    justifyContent: "flex-end",
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
  },
  takeover: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: DS_V3.size.button * 2,
  },
  footer: {
    gap: DS_V3.space.sm,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
