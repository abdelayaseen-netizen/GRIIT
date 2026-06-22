/**
 * ChallengeGridCard — light-surface masonry tile recommending a challenge.
 *
 * The shape is what `TRPC.challenges.getRecommended` returns today (no
 * `friendsStarted`; instead `previewUsers[]` + `participantCount`). We map
 * proof_type / category to a Lucide icon and show a difficulty pill plus
 * either a 3-up avatar stack ("3 friends") or a "Be first today" hint.
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Brain,
  Dumbbell,
  Feather,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/lib/routes';
import { DS_DAYLIGHT } from '@/lib/design-system';
import { Avatar } from '@/components/Avatar';

export type RecommendedChallengeDifficulty = 'EASY' | 'MED' | 'HARD';

type RecommendedChallengePreviewUser = {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
};

export type RecommendedChallenge = {
  id: string;
  title: string;
  duration: number;
  difficulty: RecommendedChallengeDifficulty;
  category: string;
  participantCount: number;
  completionRate: number;
  previewUsers: RecommendedChallengePreviewUser[];
};

export type ChallengeGridCardProps = {
  challenge: RecommendedChallenge;
};

function iconFor(category: string): LucideIcon {
  const c = category.toLowerCase();
  if (c === 'body' || c === 'fitness') return Dumbbell;
  if (c === 'mind') return Brain;
  if (c === 'faith') return Feather;
  if (c === 'focus' || c === 'discipline') return Zap;
  return Target;
}

function difficultyLabel(d: RecommendedChallengeDifficulty): string {
  if (d === 'EASY') return 'Easy';
  if (d === 'HARD') return 'Hard';
  return 'Medium';
}

function dayWord(n: number): string {
  return n === 1 ? 'day' : 'days';
}

export const ChallengeGridCard = React.memo(function ChallengeGridCard({
  challenge,
}: ChallengeGridCardProps) {
  const router = useRouter();
  const handlePress = useCallback(() => {
    router.push(ROUTES.CHALLENGE_ID(challenge.id) as never);
  }, [router, challenge.id]);

  const Icon = iconFor(challenge.category);
  const diffLabel = difficultyLabel(challenge.difficulty);
  const friendsCount = challenge.previewUsers.length;
  const meta = `${challenge.duration} ${dayWord(challenge.duration)} · ${diffLabel}`;
  const a11y = `${challenge.title}, ${meta}, ${friendsCount === 1 ? '1 friend' : `${friendsCount} friends`}, tap to view`;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={styles.card}
    >
      <View style={styles.photo}>
        <Icon
          size={30}
          color={DS_DAYLIGHT.color.iconMuted}
          strokeWidth={1.75}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {challenge.title}
        </Text>
        {friendsCount > 0 ? (
          <View style={styles.avatarStack}>
            {challenge.previewUsers.slice(0, 3).map((u, i) => (
              <Avatar
                key={u.user_id}
                url={u.avatar_url}
                name={u.username ?? '?'}
                size={20}
                userId={u.user_id}
                style={[
                  styles.stackedAvatar,
                  i === 0 ? null : styles.stackedAvatarOverlap,
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>

      <Text style={styles.meta} numberOfLines={1}>
        {meta}
      </Text>
    </Pressable>
  );
});


const styles = StyleSheet.create({
  card: {
    gap: 1,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    backgroundColor: DS_DAYLIGHT.color.photoPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 10,
  },
  title: {
    flex: 1,
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 15.5,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.1,
  },
  meta: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    borderWidth: 1.5,
    borderColor: DS_DAYLIGHT.color.canvas,
    borderRadius: 10,
  },
  stackedAvatarOverlap: {
    marginLeft: -7,
  },
});
