/**
 * Friends count at 0 and above 0. Route: /dev/build81-friends
 */
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import Screen from "@/components/ds/Screen";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { DS_V3 } from "@/lib/design-system";

const noop = () => undefined;
const faces = [
  { userId: "a", username: "omar", displayName: "Omar", avatarUrl: null },
  { userId: "b", username: "khalid", displayName: "Khalid", avatarUrl: null },
  { userId: "c", username: "sara", displayName: "Sara", avatarUrl: null },
];

export default function Build81Friends() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen edges={["top", "left", "right"]}>
        <View style={styles.switcher}>
          <Pressable testID="friends-zero" onPress={() => setCount(0)}>
            <Text style={styles.chip}>0</Text>
          </Pressable>
          <Pressable testID="friends-some" onPress={() => setCount(3)}>
            <Text style={styles.chip}>3</Text>
          </Pressable>
        </View>
        <ProfileHeader
          userId="me"
          displayName="Yaseen Abdelaziz"
          username="yaseenabdelaz"
          streakDays={2}
          bestDays={3}
          securedDays={12}
          friends={count}
          friendFaces={count > 0 ? faces : []}
          isOwner
          onEdit={noop}
          onFollow={noop}
          onShare={noop}
          onFindFriends={noop}
          onFriends={noop}
          onEditBio={noop}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 16, padding: 16 },
  chip: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
});
