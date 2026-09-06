/**
 * AvatarStack — 01_components.md "AvatarStack"
 * Laws: 16 (max 3, 2pt surface ring, never overlapping text).
 * Overlap is marginLeft -12 (spec), not 8 (session prompt). Fixed width block.
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "./Avatar";

const OVERLAP = DS_V3.space.md;
const AVATAR = DS_V3.size.avatar.sm;

export type AvatarStackPerson = {
  uri?: string;
  displayName?: string;
};

export type AvatarStackProps = {
  people: AvatarStackPerson[];
};

export default function AvatarStack({ people }: AvatarStackProps) {
  const shown = people.slice(0, 3);
  const width =
    shown.length === 0
      ? 0
      : AVATAR + (shown.length - 1) * (AVATAR - OVERLAP);

  return (
    <View style={[styles.row, { width }]} accessibilityLabel="People">
      {shown.map((p, i) => (
        <View key={`${p.displayName ?? ""}-${i}`} style={i === 0 ? null : styles.overlap}>
          <Avatar size={AVATAR} uri={p.uri} displayName={p.displayName} ring />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginRight: DS_V3.space.md,
  },
  overlap: {
    marginLeft: -OVERLAP,
  },
});
