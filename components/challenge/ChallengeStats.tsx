import React from "react";
import { View, Text } from "react-native";
import type { ChallengeDetailFromApi } from "@/types";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

type Props = {
  challenge: ChallengeDetailFromApi;
};

export const ChallengeStats = React.memo(function ChallengeStats({ challenge }: Props) {
  return (
    <View style={s.statsRowCard}>
      <View style={s.statsRowCol}>
        <Text style={s.statsRowValue}>
          {challenge.participants_count
            ? Math.round(((challenge.active_today_count ?? 0) / Math.max(1, challenge.participants_count)) * 100)
            : 0}
          %
        </Text>
        <Text style={s.statsRowLabel}>secured today</Text>
      </View>
      <View style={s.statsRowDivider} />
      <View style={s.statsRowCol}>
        <Text style={s.statsRowValue}>{challenge.completion_rate ?? 0}%</Text>
        <Text style={s.statsRowLabel}>completion rate</Text>
      </View>
    </View>
  );
});
