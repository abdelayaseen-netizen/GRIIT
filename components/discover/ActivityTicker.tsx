import React from "react";
import { View, FlatList, Text, Pressable, Image, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

export type RecentCompletionItem = {
  id: string;
  completedAt: string;
  userName: string;
  avatarUrl: string | null;
  challengeTitle: string;
  challengeId: string;
  currentDay: number;
};

export function ActivityTicker() {
  const router = useRouter();

  const { data: completions } = useQuery({
    queryKey: ["discover", "recentCompletions"],
    queryFn: () => trpcQuery(TRPC.feed.getRecentCompletions) as Promise<RecentCompletionItem[]>,
    staleTime: 30 * 1000,
  });

  if (!completions || completions.length === 0) return null;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.liveDot} />
        <Text style={styles.headerText}>Happening now</Text>
      </View>
      <FlatList
        horizontal
        data={completions.slice(0, 10)}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(ROUTES.CHALLENGE_ID(item.challengeId) as never)}
            accessibilityRole="button"
            accessibilityLabel={`${item.userName} completed day ${item.currentDay} of ${item.challengeTitle}, ${timeAgo(item.completedAt)}`}
            style={styles.item}
          >
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{item.userName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.body}>
              <Text style={styles.text} numberOfLines={2}>
                <Text style={styles.textBold}>{item.userName}</Text>
                {` completed Day ${item.currentDay} of `}
                <Text style={styles.textHighlight}>{item.challengeTitle}</Text>
              </Text>
              <Text style={styles.time}>{timeAgo(item.completedAt)}</Text>
            </View>
          </Pressable>
        )}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.DISCOVER_GREEN,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  scroll: {
    gap: 8,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "stretch",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: DS_COLORS.SURFACE,
    borderRadius: 12,
    padding: 8,
    paddingRight: 12,
    minWidth: 220,
    maxWidth: 280,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    backgroundColor: DS_COLORS.BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 10,
    fontWeight: "600",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    fontSize: 11,
    color: DS_COLORS.TEXT_PRIMARY,
    lineHeight: 15,
  },
  textBold: {
    fontWeight: "600",
  },
  textHighlight: {
    color: DS_COLORS.PRIMARY,
    fontWeight: "500",
  },
  time: {
    fontSize: 9,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});
