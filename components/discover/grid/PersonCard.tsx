/**
 * PersonCard — dark-surface masonry tile suggesting someone to follow.
 *
 * Mirrors the SuggestedPeopleRow follow flow: optimistic state, supports
 * private (sendFollowRequest) vs. public (followUser) profiles, invalidates
 * the same query key so subsequent renders pick up the change.
 *
 * Body tap → profile. Follow button is a separate tap-target with its own
 * accessibility label and disabled state.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { trpcMutate } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { ROUTES } from '@/lib/routes';
import { DS_DAYLIGHT } from '@/lib/design-system';
import { Avatar } from '@/components/Avatar';
import { trackEvent } from '@/lib/analytics';
import { captureError } from '@/lib/sentry';
import { profilePrimaryName } from '@/lib/profile-display';

export type SuggestedPerson = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  is_private: boolean;
  /** Optional mutuals count if backend provides it; falls back to 0. */
  mutuals_count?: number | null;
};

export type PersonCardProps = {
  person: SuggestedPerson;
};

type FollowState = 'none' | 'pending' | 'following';

export const PersonCard = React.memo(function PersonCard({
  person,
}: PersonCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [followState, setFollowState] = useState<FollowState>('none');

  const displayStr = profilePrimaryName({
    username: person.username,
    display_name: person.display_name,
  });

  const goToProfile = useCallback(() => {
    const u = (person.username ?? '').trim();
    const target = u ? encodeURIComponent(u) : encodeURIComponent(person.user_id);
    router.push(ROUTES.PROFILE_USERNAME(target) as never);
  }, [router, person.username, person.user_id]);

  const handleFollow = useCallback(async () => {
    if (pending) return;
    setPending(true);
    const previous = followState;
    const optimistic: FollowState = person.is_private ? 'pending' : 'following';
    setFollowState(optimistic);
    try {
      if (person.is_private) {
        await trpcMutate(TRPC.profiles.sendFollowRequest, {
          userId: person.user_id,
        });
      } else {
        await trpcMutate(TRPC.profiles.followUser, {
          userId: person.user_id,
        });
      }
      trackEvent('discover_suggested_follow_tapped', {
        target_user_id: person.user_id,
        is_private: person.is_private,
      });
      void queryClient.invalidateQueries({ queryKey: ['discover', 'suggested'] });
    } catch (err) {
      setFollowState(previous);
      captureError(err, 'Discover.PersonCard.follow');
    } finally {
      setPending(false);
    }
  }, [pending, person.user_id, person.is_private, followState, queryClient]);

  const isFollowing = followState === 'following';
  const isReqPending = followState === 'pending';
  const buttonLabel = isFollowing
    ? 'Following'
    : isReqPending
      ? 'Requested'
      : person.is_private
        ? 'Request'
        : 'Follow';

  const streak = person.current_streak;
  const mutuals = Math.max(0, Number(person.mutuals_count ?? 0));
  const subParts: string[] = [];
  if (streak > 0) subParts.push(`${streak}-day streak`);
  if (mutuals > 0) subParts.push(`${mutuals} mutual${mutuals === 1 ? '' : 's'}`);
  const subline = subParts.length > 0 ? subParts.join(' · ') : 'New here';

  return (
    <View style={styles.card}>
      <Pressable
        onPress={goToProfile}
        accessibilityRole="button"
        accessibilityLabel={`Open ${displayStr}'s profile`}
        style={styles.body}
      >
        <View style={styles.avatarRing}>
          <Avatar
            url={person.avatar_url}
            name={displayStr}
            size={48}
            userId={person.user_id}
          />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {displayStr}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subline}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleFollow}
        disabled={pending || isFollowing || isReqPending}
        accessibilityRole="button"
        accessibilityLabel={`${buttonLabel} ${displayStr}`}
        style={[
          styles.followBtn,
          (isFollowing || isReqPending) && styles.followBtnSecondary,
        ]}
      >
        {pending ? (
          <ActivityIndicator
            size="small"
            color={DS_DAYLIGHT.color.white}
          />
        ) : (
          <Text
            style={[
              styles.followText,
              (isFollowing || isReqPending) && styles.followTextSecondary,
            ]}
          >
            {buttonLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
});

export default PersonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    padding: DS_DAYLIGHT.space.cardPad,
    gap: 6,
  },
  body: {
    alignItems: 'center',
    gap: 4,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: DS_DAYLIGHT.color.dividerStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.inkMuted2,
    textAlign: 'center',
  },
  followBtn: {
    marginTop: 6,
    width: '100%',
    paddingVertical: 8,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnSecondary: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  followText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 12,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  followTextSecondary: {
    color: DS_DAYLIGHT.color.accent,
  },
});
