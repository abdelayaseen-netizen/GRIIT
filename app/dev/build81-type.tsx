/**
 * Type scale and a shared self-reported post. Route: /dev/build81-type
 */
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import Screen from "@/components/ds/Screen";
import FeedPostV3 from "@/components/feed/FeedPostV3";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { DS_V3 } from "@/lib/design-system";

const noop = () => undefined;

const selfPost: LiveFeedPost = {
  id: "self",
  userId: "omar",
  username: "omar",
  displayName: "Omar Siddiqui",
  avatarUrl: null,
  streakCount: 2,
  challengeId: "gym",
  challengeName: "Gym once a day",
  taskName: "Workout",
  currentDay: 5,
  totalDays: 7,
  eventType: "task_completed",
  isCompleted: false,
  hasProof: false,
  photoUrl: null,
  verified: false,
  caption: "Legs. Slow, but done.",
  createdAt: new Date().toISOString(),
  respectCount: 4,
  reactedByMe: false,
  commentCount: 1,
  visibility: "public",
};

export default function Build81Type() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen edges={["top", "left", "right"]} style={styles.screen}>
        <ScrollView>
          <View testID="type-scale" style={styles.block}>
            <Text style={styles.headline}>Headline 17/22</Text>
            <Text style={styles.body}>Body 17/22. The day is still open.</Text>
            <Text style={styles.secondary}>Secondary 15/20. Thursday, Oct 8</Text>
            <Text testID="type-caption" style={styles.caption}>Caption 13/18</Text>
          </View>
          <View testID="self-post">
            <FeedPostV3
              post={selfPost}
              onLike={noop}
              onComment={noop}
              onShare={noop}
              onOpenPost={noop}
              onMenu={noop}
            />
          </View>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DS_V3.color.canvas },
  block: { padding: 24, gap: 12 },
  headline: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  body: { ...DS_V3.type.body, color: DS_V3.color.textPrimary },
  secondary: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
