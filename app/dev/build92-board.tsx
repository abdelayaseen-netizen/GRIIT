/**
 * Build 92 chunk 08.5 (dev only): the challenge board with 5 or 10 people (P2-16, P2-17),
 * your row highlighted and labelled "You". Same rankBoard + BoardRow as the live tab.
 * griit://dev/build92-board?n=10
 */
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Screen from "@/components/ds/Screen";
import PushedHeader from "@/components/ds/PushedHeader";
import { BoardRow } from "@/components/activity/LeaderboardTab";
import type { BoardEntry } from "@/components/activity/types";
import { BOARD_RULE, rankBoard } from "@/lib/challenge-board";
import { DS_V3 } from "@/lib/design-system";

const ME = "me";

const FIVE = [
  ["Khalid Noor", 6, 6, "2026-10-17T06:10:00Z"],
  ["You", 5, 4, "2026-10-17T06:30:00Z"],
  ["Omar Siddiqui", 5, 3, "2026-10-17T06:20:00Z"],
  ["Bilal Ahmed", 3, 3, "2026-10-16T06:00:00Z"],
  ["Sara Ibrahim", 2, 0, "2026-10-15T07:00:00Z"],
] as const;

const TEN_EXTRA = [
  ["Abdurrahman Al-Mansouri-Hashemi", 5, 4, "2026-10-17T06:40:00Z"],
  ["Fatima Zahra Benmoussa-Elkhattabi", 4, 4, "2026-10-17T05:50:00Z"],
  ["Mohammed Ibrahim Al-Rashid", 4, 1, "2026-10-17T07:10:00Z"],
  ["Khadija Oluwaseun Adeyemi", 1, 1, "2026-10-13T06:00:00Z"],
  ["Yusuf Abdulkareem Olatunji", 0, 0, ""],
] as const;

export default function Build92BoardDev() {
  const router = useRouter();
  const params = useLocalSearchParams<{ n?: string }>();
  const n = params.n === "10" ? 10 : 5;
  const seed = n === 10 ? [...FIVE, ...TEN_EXTRA] : [...FIVE];
  const ranked = rankBoard(
    seed.map(([name, secured, verified, last], i) => ({
      userId: name === "You" ? ME : `u${i}`,
      displayName: name,
      username: name.toLowerCase().replace(/[^a-z]+/g, ""),
      avatarUrl: null,
      secured,
      verified,
      lastSecuredAt: last || null,
    })),
    ME,
  );
  const entries: BoardEntry[] = ranked.map((r) => ({
    userId: r.userId,
    username: r.username,
    displayName: r.displayName,
    avatarUrl: r.avatarUrl,
    rank: r.rank,
    points: r.secured,
    checkInsThisWeek: r.secured,
    verifiedThisWeek: r.verified ?? 0,
    lastSecuredAt: r.lastSecuredAt ?? null,
    currentStreak: 0,
    progressVsLeader: 0,
    gapToAbove: 0,
  }));
  return (
    <Screen style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PushedHeader title={`Board · ${n} people (dev)`} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.week}>
          <Text style={styles.heading}>This week</Text>
          <Text style={styles.caption}>{BOARD_RULE}</Text>
        </View>
        {entries.map((e, i) => (
          <BoardRow
            key={e.userId}
            entry={e}
            viewerId={ME}
            scope="challenge"
            divider={i < entries.length - 1}
            onPress={() => undefined}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: { paddingBottom: DS_V3.space.section },
  week: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.md, paddingBottom: DS_V3.space.sm, gap: 2 },
  heading: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
