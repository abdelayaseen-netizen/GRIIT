import React from "react";
import { View, Text } from "react-native";
import { DS_COLORS } from "@/lib/design-system";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

export function InfoChip({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <View
      style={[
        s.infoChip,
        {
          borderColor: DS_COLORS.DISCOVER_HERO_AVATAR_RING,
          backgroundColor: dark ? DS_COLORS.CHIP_BG_DARK_ON_LIGHT : DS_COLORS.OVERLAY_WHITE_18,
        },
      ]}
    >
      <Text style={s.infoChipText}>{label}</Text>
    </View>
  );
}
