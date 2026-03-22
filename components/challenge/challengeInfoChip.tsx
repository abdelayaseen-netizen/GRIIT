import React from "react";
import { View, Text } from "react-native";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

export function InfoChip({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <View
      style={[
        s.infoChip,
        { borderColor: "rgba(255,255,255,0.35)", backgroundColor: dark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.18)" },
      ]}
    >
      <Text style={s.infoChipText}>{label}</Text>
    </View>
  );
}
