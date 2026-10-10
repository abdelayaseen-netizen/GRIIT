import { Tabs, useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate } from "@/lib/trpc";
import { clearOptimisticFeedPost, optimisticTaskPost, publishOptimisticFeedPost } from "@/lib/optimistic-feed";
import { useIsGuest } from "@/contexts/AuthGateContext";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import * as Sentry from "@sentry/react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { DS_V3, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system";
import TabBar, { type TabBarTab } from "@/components/ds/TabBar";
import { ROUTES } from "@/lib/routes";
import TaskCompleteToast from "@/components/task-v2/TaskCompleteToast";
import ShareSystemSheet from "@/components/share/ShareSystemSheet";
import { useApp } from "@/contexts/AppContext";
import type { TaskCompleteToast as TaskToast } from "@/lib/task-complete-toast";

function routeToTab(name: string | undefined): TabBarTab {
  if (name === "discover") return "discover";
  if (name === "activity") return "activity";
  if (name === "profile") return "profile";
  return "home";
}

function useActivityUnread(): boolean {
  const { user } = useAuth();
  const isGuest = useIsGuest();
  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-dot", user?.id ?? ""],
    queryFn: () => trpcQuery(TRPC.notifications.getAll) as Promise<{ unread: unknown[] }>,
    staleTime: 30 * 1000,
    enabled: !isGuest && !!user?.id,
  });
  return (unreadQuery.data?.unread.length ?? 0) > 0;
}

function GritTabBar({ state }: BottomTabBarProps) {
  const router = useRouter();
  const activityUnread = useActivityUnread();
  const current = state.routes[state.index]?.name;
  if (current === "create") return null;
  return (
    <TabBar
      active={routeToTab(current)}
      activityUnread={activityUnread}
      onTab={(tab) => {
        if (tab === "home") router.push(ROUTES.TABS_HOME as never);
        else if (tab === "discover") router.push(ROUTES.TABS_DISCOVER as never);
        else if (tab === "activity") router.push(ROUTES.TABS_ACTIVITY as never);
        else router.push(ROUTES.TABS_PROFILE as never);
      }}
      onFab={() => router.push(ROUTES.TABS_CREATE as never)}
    />
  );
}

export default function TabLayout() {
  const { profile } = useApp();
  const { user } = useAuth();
  const [shareToast, setShareToast] = React.useState<TaskToast | null>(null);
  const shareFeed = React.useCallback(async (toast: TaskToast) => {
    if (!toast.eventId || !user?.id) return;
    await trpcMutate(TRPC.checkins.shareProof, { eventId: toast.eventId });
    const post = optimisticTaskPost({
      eventId: toast.eventId,
      userId: user.id,
      username: profile?.username ?? "",
      displayName: profile?.display_name ?? "You",
      avatarUrl: profile?.avatar_url ?? null,
      challengeId: toast.challengeId,
      challengeName: toast.challengeName,
      taskName: toast.taskName ?? toast.body,
      currentDay: toast.currentDay,
      totalDays: toast.totalDays,
      photoUrl: toast.photoUri,
    });
    if (post) publishOptimisticFeedPost(post);
  }, [profile?.avatar_url, profile?.display_name, profile?.username, user?.id]);
  const undoFeed = React.useCallback(async (toast: TaskToast) => {
    if (!toast.eventId) return;
    clearOptimisticFeedPost(toast.eventId);
    await trpcMutate(TRPC.checkins.unshareProof, { eventId: toast.eventId });
  }, []);
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <View style={styles.errorBoundaryRoot}>
          <Text style={styles.errorBoundaryTitle}>Something went wrong</Text>
          <Text style={styles.errorBoundaryMessage}>
            {__DEV__ ? String(error) : "Please restart the app"}
          </Text>
          <TouchableOpacity
            onPress={resetError}
            style={styles.errorBoundaryButton}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={styles.errorBoundaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}
    >
    <View style={styles.tabs}>
    <Tabs
      tabBar={(props) => <GritTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: DS_V3.color.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home, your challenges and feed",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarAccessibilityLabel: "Discover, browse and join challenges",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Create a new challenge",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarAccessibilityLabel: "Activity, feed, notifications, and leaderboard",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile, your stats and settings",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          href: null,
        }}
      />
    </Tabs>
    <TaskCompleteToast onShare={setShareToast} onShareFeed={shareFeed} onUndoFeed={undoFeed} />
    <ShareSystemSheet
      visible={shareToast != null}
      onDismiss={() => setShareToast(null)}
      moment={shareToast?.photoUri ? "photo_proof" : "self_reported"}
      card={{
        challenge: "",
        task: shareToast?.title.replace(/ (done|saved)\.$/, "") ?? "",
        username: profile?.username,
        photoUri: shareToast?.photoUri,
        cameraSeal: shareToast?.cameraSeal === true,
      }}
    />
    </View>
    </Sentry.ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  errorBoundaryRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: DS_V3.color.canvas,
  },
  errorBoundaryTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
    color: DS_V3.color.textPrimary,
  },
  errorBoundaryMessage: {
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
    color: DS_V3.color.textSecondary,
  },
  errorBoundaryButton: {
    backgroundColor: GRIIT_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: DS_RADIUS.joinCta,
  },
  errorBoundaryButtonText: {
    color: DS_V3.color.textPrimary,
    fontWeight: "500",
  },
});
