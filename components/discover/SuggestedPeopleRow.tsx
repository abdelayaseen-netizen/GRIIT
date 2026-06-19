import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { Avatar } from "@/components/Avatar";
import SectionHeader from "@/components/shared/SectionHeader";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { SkeletonBase } from "@/components/skeletons";
import { profilePrimaryName, profileHandleAt } from "@/lib/profile-display";

type SuggestedPerson = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  is_private: boolean;
};

const CARD_WIDTH = 132;

function SuggestedPersonCard({
  person,
  onProfilePress,
}: {
  person: SuggestedPerson;
  onProfilePress: () => void;
}) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [followState, setFollowState] = useState<"none" | "pending" | "following">("none");

  const handleFollow = useCallback(async () => {
    if (pending) return;
    setPending(true);
    const previous = followState;
    const optimistic = person.is_private ? "pending" : "following";
    setFollowState(optimistic);
    try {
      if (person.is_private) {
        await trpcMutate(TRPC.profiles.sendFollowRequest, { userId: person.user_id });
      } else {
        await trpcMutate(TRPC.profiles.followUser, { userId: person.user_id });
      }
      trackEvent("discover_suggested_follow_tapped", {
        target_user_id: person.user_id,
        is_private: person.is_private,
      });
      void queryClient.invalidateQueries({ queryKey: ["discover", "suggested"] });
    } catch (err) {
      setFollowState(previous);
      captureError(err, "Discover.SuggestedPersonCard.follow");
    } finally {
      setPending(false);
    }
  }, [pending, person.user_id, person.is_private, followState, queryClient]);

  const isFollowing = followState === "following";
  const isPending = followState === "pending";
  const buttonLabel = isFollowing
    ? "Following"
    : isPending
      ? "Requested"
      : person.is_private
        ? "Request"
        : "Follow";
  const handleStr = profileHandleAt({ username: person.username });
  const displayStr = profilePrimaryName({
    username: person.username,
    display_name: person.display_name,
  });

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={`Open ${displayStr}'s profile`}
        style={styles.cardTopHit}
      >
        <Avatar
          url={person.avatar_url}
          name={displayStr}
          size={56}
          userId={person.user_id}
        />
        <Text style={styles.name} numberOfLines={1}>
          {displayStr}
        </Text>
        {handleStr ? (
          <Text style={styles.handle} numberOfLines={1}>
            {handleStr}
          </Text>
        ) : null}
        <Text style={styles.streak} numberOfLines={1}>
          {person.current_streak > 0
            ? `🔥 ${person.current_streak} day${person.current_streak === 1 ? "" : "s"}`
            : "New here"}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleFollow}
        disabled={pending || isFollowing || isPending}
        accessibilityRole="button"
        accessibilityLabel={`${buttonLabel} ${displayStr}`}
        style={[
          styles.followBtn,
          (isFollowing || isPending) && styles.followBtnSecondary,
        ]}
      >
        {pending ? (
          <ActivityIndicator size="small" color={DS_COLORS.TEXT_ON_ACCENT} />
        ) : (
          <Text
            style={[
              styles.followText,
              (isFollowing || isPending) && styles.followTextSecondary,
            ]}
          >
            {buttonLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function SuggestedPeopleSkeleton() {
  return (
    <View style={styles.row}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <SkeletonBase width={56} height={56} borderRadius={28} />
          <SkeletonBase
            width={CARD_WIDTH - DS_SPACING.md * 2}
            height={12}
            borderRadius={4}
            style={styles.skeletonLine}
          />
          <SkeletonBase
            width={CARD_WIDTH - DS_SPACING.md * 2 - 24}
            height={10}
            borderRadius={4}
            style={styles.skeletonLine}
          />
        </View>
      ))}
    </View>
  );
}

function SuggestedPeopleRowInner() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["discover", "suggested"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.suggested, { limit: 10 }) as Promise<SuggestedPerson[]>,
    staleTime: 5 * 60 * 1000,
  });

  if (query.isError) captureError(query.error, "Discover.SuggestedPeople");

  const onProfilePress = useCallback(
    (p: SuggestedPerson) => {
      trackEvent("discover_suggested_profile_tapped", {
        target_user_id: p.user_id,
      });
      const u = (p.username ?? "").trim();
      if (u) router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(u)) as never);
      else router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(p.user_id)) as never);
    },
    [router]
  );

  const data = query.data ?? [];
  if (!query.isPending && data.length === 0) return null;

  return (
    <View>
      <SectionHeader title="Suggested people" />
      {query.isPending ? (
        <SuggestedPeopleSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {data.map((person) => (
            <SuggestedPersonCard
              key={person.user_id}
              person={person}
              onProfilePress={() => onProfilePress(person)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export const SuggestedPeopleRow = React.memo(SuggestedPeopleRowInner);
export default SuggestedPeopleRow;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: DS_SPACING.xs,
    paddingBottom: DS_SPACING.sm,
    gap: DS_SPACING.sm,
    flexDirection: "row",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.md,
    alignItems: "center",
    gap: 6,
  },
  cardTopHit: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  name: {
    fontSize: 13,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: 4,
    textAlign: "center",
  },
  handle: {
    fontSize: 11,
    color: DS_COLORS.TEXT_MUTED,
    textAlign: "center",
  },
  streak: {
    fontSize: 11,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  followBtn: {
    marginTop: 6,
    width: "100%",
    paddingVertical: 8,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnSecondary: {
    backgroundColor: DS_COLORS.BG_PAGE,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  followText: {
    fontSize: 12,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_ON_ACCENT,
  },
  followTextSecondary: {
    color: DS_COLORS.TEXT_PRIMARY,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.md,
    alignItems: "center",
    gap: 8,
  },
  skeletonLine: {
    marginTop: 4,
  },
});
