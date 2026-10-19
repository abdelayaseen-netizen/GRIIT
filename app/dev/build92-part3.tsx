/**
 * Dev-only. Route: /dev/build92-part3?frame=feed|error
 * Build 92 chunk 10 frames with fixed data: P3-19 (feed: proofs lead, one folded started line)
 * and P3-18 (Home's save error with the real reason and no retry).
 */
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import Screen from "@/components/ds/Screen";
import { DS_V3 } from "@/lib/design-system";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { syntheticPosts } from "@/lib/dev-synthetic-posts";
import ProofPost from "@/components/feed/ProofPost";
import StartedDayRow, { StartedDaySheet } from "@/components/feed/StartedDayRow";
import { FEED_CAPTION, foldStartedLines, isStartedDay, type StartedDayGroup } from "@/lib/feed-fold";
import { groupFeedJoins } from "@/lib/feed-join";
import { getDeviceIanaTimeZone } from "@/lib/iana-timezone";
import { getTodayDateKey } from "@/lib/date-utils";
import { homeSaveError } from "@/lib/home-done";

function param(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : Array.isArray(v) ? (v[0] ?? "") : "";
}

function startedPost(i: number, name: string, challenge: string): LiveFeedPost {
  const base = syntheticPosts(1)[0]!;
  return {
    ...base,
    id: `dev-started-${i}`,
    userId: `dev-user-${i}`,
    username: name.toLowerCase(),
    displayName: name,
    challengeId: `dev-ch-${i}`,
    challengeName: challenge,
    eventType: "joined_challenge",
    hasProof: false,
    photoUrl: null,
    proofPhotoUrl: null,
    caption: null,
    createdAt: new Date().toISOString(),
  };
}

export default function Build92Part3Dev() {
  const params = useLocalSearchParams<{ frame?: string }>();
  const frame = param(params.frame) || "feed";
  const [open, setOpen] = useState<StartedDayGroup | null>(null);
  const rows = useMemo(() => {
    const now = new Date().toISOString();
    const proofs = syntheticPosts(3).map((p, i) => ({
      ...p,
      id: `dev-proof-${i}`,
      displayName: ["Sara", "Omar", "Yaseen"][i]!,
      createdAt: now,
    }));
    const feed: LiveFeedPost[] = [
      startedPost(1, "Bilal", "Fajr Before Sunrise"),
      startedPost(2, "Zayd", "7K Steps"),
      proofs[0]!,
      startedPost(3, "Hana", "Show Up 7"),
      proofs[1]!,
      proofs[2]!,
    ];
    const tz = getDeviceIanaTimeZone();
    return foldStartedLines(groupFeedJoins(feed, "dev-viewer"), { todayKey: getTodayDateKey(tz), timeZone: tz });
  }, []);
  if (!__DEV__) return null;

  if (frame === "error") {
    const err = homeSaveError("Window closed.", "7:00 am");
    return (
      <Screen edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.pad} testID="dev-p3-error">
          <Text style={styles.heading}>Today</Text>
          <Text style={styles.row}>Pray Fajr</Text>
          <Text style={styles.caption}>{err.message}</Text>
          <Text style={styles.caption}>{err.retry ? "Retry offered" : "No retry (it cannot work)"}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView testID="dev-p3-feed" contentContainerStyle={styles.list}>
        <Text style={styles.heading}>Following</Text>
        <Text style={styles.caption}>{FEED_CAPTION.following(3)}</Text>
        {rows.map((item) =>
          isStartedDay(item) ? (
            <StartedDayRow key={item.id} group={item} onPress={() => setOpen(item)} />
          ) : "kind" in item ? null : (
            <ProofPost
              key={item.id}
              post={item}
              viewerUserId="dev-viewer"
              comments={[]}
              onLike={() => undefined}
              onComment={() => undefined}
              onShare={() => undefined}
            />
          ),
        )}
      </ScrollView>
      <StartedDaySheet group={open} onClose={() => setOpen(null)} onOpenChallenge={() => setOpen(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { padding: DS_V3.space.gutter, gap: DS_V3.space.sm },
  list: { paddingVertical: DS_V3.space.md, gap: DS_V3.space.md },
  heading: {
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  row: { fontSize: DS_V3.type.body.fontSize, color: DS_V3.color.textPrimary },
  caption: {
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    color: DS_V3.color.textSecondary,
  },
});
