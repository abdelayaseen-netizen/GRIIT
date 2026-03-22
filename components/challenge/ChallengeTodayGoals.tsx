import React from "react";
import { View, Text } from "react-native";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

type Props = {
  children: React.ReactNode;
};

export const ChallengeTodayGoals = React.memo(function ChallengeTodayGoals({ children }: Props) {
  return (
    <View style={s.missionsSection}>
      <Text style={s.sectionTitle}>Today&apos;s Goals</Text>
      <View style={s.missionsCard}>{children}</View>
    </View>
  );
});
