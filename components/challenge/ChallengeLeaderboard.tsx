import React from "react";
import { View, Text } from "react-native";
import type { ChallengeDetailFromApi } from "@/types";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";
import { SocialAvatars } from "@/components/challenge/challengeSocialAvatars";

type Props = {
  challenge: ChallengeDetailFromApi;
  participantCount: number;
  participantUsernames: string[] | undefined;
  formatCount: (n: number) => string;
};

export const ChallengeLeaderboard = React.memo(function ChallengeLeaderboard({
  challenge,
  participantCount,
  participantUsernames,
  formatCount,
}: Props) {
  return (
    <View style={s.participantStatsCard}>
      <View style={s.socialRow}>
        <SocialAvatars participantsCount={participantCount} participantUsernames={participantUsernames} />
        <View style={s.socialTextWrap}>
          <Text style={s.socialPrimary}>
            {participantCount === 0
              ? "Be the first to start something real."
              : (() => {
                  const pc = participantCount;
                  const joinedToday = Math.max(1, Math.floor(pc * 0.02));
                  const rate = challenge.completion_rate ?? 0;
                  const activeToday =
                    (challenge.active_today_count ?? 0) > 0
                      ? ` · ${formatCount(challenge.active_today_count ?? 0)} active today`
                      : "";
                  return `${formatCount(pc)} in this challenge${activeToday} · about ${joinedToday} joined today · ${rate}% completion rate`;
                })()}
          </Text>
        </View>
      </View>
    </View>
  );
});
