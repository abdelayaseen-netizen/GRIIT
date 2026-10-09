/**
 * Dev harness for v50 feed frames 1226–1228. Route: /dev/build80
 */
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import Screen from "@/components/ds/Screen";
import WeekStrip from "@/components/ds/WeekStrip";
import FeedPostV3 from "@/components/feed/FeedPostV3";
import FeedEvent from "@/components/feed/FeedEvent";
import ShareImage from "@/components/share/ShareImage";
import { ChallengePreviewSheet } from "@/components/discover/ChallengePreviewSheet";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import type { FeedEventGroup } from "@/lib/feed-join";
import { DONE_FOR_TODAY } from "@/lib/challenge-today-copy";
import { DS_V3 } from "@/lib/design-system";
import { SECTION_DONE } from "@/lib/g2a-home";

const book = Image.resolveAssetSource(
  require("../../design/handoff/v50/handoff/GRIIT-v50-handoff/atlas/assets/proofs/book1.jpg"),
).uri;

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const noop = () => undefined;

function photoPost(respects: number, liked: boolean): LiveFeedPost {
  return {
    id: "photo",
    userId: "khalid",
    username: "khalid",
    displayName: "Khalid Noor",
    avatarUrl: null,
    streakCount: 12,
    challengeId: "read",
    challengeName: "Read 30",
    taskName: "Read",
    currentDay: 15,
    totalDays: 30,
    eventType: "task_completed",
    isCompleted: false,
    hasProof: true,
    photoUrl: book,
    proofPhotoUrl: book,
    verified: true,
    caption: "Before work. Chapter 9.",
    createdAt: ago(12 * 60 * 1000),
    respectCount: respects,
    reactedByMe: liked,
    commentCount: 3,
    visibility: "public",
  };
}

const finished: LiveFeedPost = {
  id: "finished",
  userId: "abdurrahman",
  username: "abdurrahman",
  displayName: "Abdurrahman Al-Faisal Rahimullah",
  avatarUrl: null,
  streakCount: 30,
  challengeId: "fajr",
  challengeName: "Fajr 30",
  currentDay: 30,
  totalDays: 30,
  securedDays: 30,
  longestStreak: 30,
  heldDays: 0,
  startedLabel: "Sep 6",
  eventType: "completed_challenge",
  isCompleted: true,
  hasProof: false,
  photoUrl: null,
  verified: false,
  caption: "Thirty mornings. Some of them were ugly. Still here.",
  createdAt: ago(3 * 60 * 60 * 1000),
  respectCount: 41,
  reactedByMe: false,
  commentCount: 12,
  visibility: "public",
};

const started: FeedEventGroup = {
  kind: "join",
  verb: "started",
  id: "start",
  challengeId: "up",
  challengeName: "Up by 5",
  names: ["Bilal", "Zayd"],
  others: 2,
  createdAt: ago(60 * 60 * 1000),
  memberIds: ["b", "z", "s"],
  avatars: [
    { userId: "b", username: "bilal", displayName: "Bilal Ahmed" },
    { userId: "z", username: "zayd", displayName: "Zayd Rahman" },
    { userId: "s", username: "sara", displayName: "Sara Hassan" },
  ],
  dayN: 1,
  dayOf: 7,
  secured: 0,
};

export default function Build80Preview() {
  const [liked, setLiked] = useState(false);
  const [respects, setRespects] = useState(12);
  const [sheet, setSheet] = useState(false);
  const [opened, setOpened] = useState("Still on the feed");
  const [onDetail, setOnDetail] = useState(false);

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <Screen>
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Text testID="build80-opened" style={styles.opened}>
        {opened}
      </Text>
      {opened === "comments" ? <Text testID="comments-open">Comments</Text> : null}
      <Text testID="build80-photo" style={styles.tag}>1226</Text>
      <FeedPostV3
        post={photoPost(respects, liked)}
        onLike={() => {
          setLiked(true);
          setRespects(13);
        }}
        onComment={() => setOpened("comments")}
        onShare={() => setOpened("share")}
        onOpenPost={() => setOpened("post")}
        onOpenPhoto={() => setOpened("photo")}
        onMenu={noop}
      />
      {respects === 13 ? <Text testID="respect-13">13 respects</Text> : null}
      <View testID="build80-started">
        <FeedEvent group={started} onPress={() => setSheet(true)} />
      </View>
      <Text testID="build80-finished" style={styles.tag}>1227</Text>
      <FeedPostV3
        post={finished}
        onLike={noop}
        onComment={() => setOpened("comments")}
        onShare={() => setOpened("share")}
        onOpenPost={() => setOpened("post")}
        onMenu={noop}
      />
      <Text testID="build80-finish-end" style={styles.tag}>finish end</Text>
      <Text style={styles.tag}>Week strip</Text>
      <View testID="build80-week">
      <WeekStrip
        todayIndex={2}
        days={[
          { letter: "M", filled: true, state: "secured" },
          { letter: "T", filled: false, state: "missed" },
          { letter: "W", filled: false, state: "missed" },
          { letter: "T", filled: false, state: "future" },
          { letter: "F", filled: false, state: "future" },
          { letter: "S", filled: false, state: "future" },
          { letter: "S", filled: false, state: "future" },
        ]}
      />
      </View>
      <Text style={styles.tag}>Share squares</Text>
      <View testID="build80-share" style={styles.shareClip}>
        <View style={styles.shareScale}>
          <ShareImage
            input={{
              style: "D",
              colour: "ink",
              challenge: "Read 30",
              durationDays: 7,
              secured: 2,
              cells: ["secured", "missed", "secured", "missed", "today", "future", "future"],
            }}
          />
        </View>
      </View>
      <Text testID="build80-home" style={styles.tag}>Home</Text>
      <Text>{SECTION_DONE}</Text>
      <Text testID="build80-open" onPress={() => setOnDetail(true)} accessibilityRole="button">
        Open the challenge
      </Text>
      {onDetail ? (
        <View>
          <Text testID="build80-detail" style={styles.tag}>Challenge detail</Text>
          <Text>{DONE_FOR_TODAY}</Text>
        </View>
      ) : null}
      <Text style={styles.tag}>1228</Text>
      <View style={styles.previewHost}>
        <FeedEvent group={started} onPress={() => setSheet(true)} />
        <ChallengePreviewSheet
          item={
            sheet
              ? {
                  id: "up",
                  title: "Up by 5",
                  category: "Discipline",
                  days: 7,
                  people: 77,
                  description: "Out of bed by 5 am, seven days running.",
                  modeLine: "Self-reported",
                  day1Line: "Bilal, Zayd and 2 others started today",
                  tasks: [{ title: "Out of bed", gate: "Self-reported" }],
                }
              : null
          }
          onClose={() => setSheet(false)}
          onJoin={noop}
          onDetails={noop}
        />
      </View>
    </ScrollView>
    </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DS_V3.color.canvas },
  scroll: { paddingBottom: 48 },
  tag: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, padding: 16 },
  opened: { ...DS_V3.type.caption, color: DS_V3.color.textTertiary, paddingHorizontal: 16 },
  previewHost: { minHeight: 80 },
  shareClip: { height: 460, overflow: "hidden", alignItems: "center" },
  shareScale: { transform: [{ scale: 0.24 }], transformOrigin: "top" },
});
