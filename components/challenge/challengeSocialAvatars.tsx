import React from "react";
import { View } from "react-native";
import { InitialCircle } from "@/src/components/ui";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

export function SocialAvatars({
  participantsCount,
  participantUsernames,
}: {
  participantsCount: number;
  participantUsernames?: string[];
}) {
  const showAvatars = participantsCount > 0 && participantUsernames && participantUsernames.length > 0;
  if (!showAvatars) return null;
  return (
    <View style={s.avatarStack}>
      {(participantUsernames ?? []).slice(0, 5).map((username, i) => (
        <View key={username + i} style={[s.stackAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i }]}>
          <InitialCircle username={username} size={32} />
        </View>
      ))}
    </View>
  );
}
