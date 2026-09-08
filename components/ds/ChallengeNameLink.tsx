import React from "react";
import { Pressable, Text, type StyleProp, type TextStyle } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";

export type ChallengeNameLinkProps = {
  challengeId: string;
  activeChallengeId?: string;
  name: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export default function ChallengeNameLink({
  challengeId,
  activeChallengeId,
  name,
  style,
  numberOfLines,
}: ChallengeNameLinkProps) {
  const router = useRouter();
  const href = activeChallengeId
    ? ROUTES.CHALLENGE_ACTIVE(activeChallengeId)
    : challengeId
      ? ROUTES.CHALLENGE_ID(challengeId)
      : null;

  if (!href) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {name}
      </Text>
    );
  }

  return (
    <Pressable
      hitSlop={8}
      onPress={() => router.push(href as never)}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <Text style={style} numberOfLines={numberOfLines}>
        {name}
      </Text>
    </Pressable>
  );
}
