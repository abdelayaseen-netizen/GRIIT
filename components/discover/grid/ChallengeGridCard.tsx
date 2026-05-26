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
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';
import { Avatar } from '@/components/Avatar';

export type RecommendedChallengeDifficulty = 'EASY' | 'MED' | 'HARD';

export type RecommendedChallengePreviewUser = {
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

function difficultyTone(d: RecommendedChallengeDifficulty): {
  label: string;
  fg: string;
  bg: string;
} {
  if (d === 'EASY') {
    return {
      label: 'EASY',
      fg: DS_COLORS_V2.difficulty.easy.fg,
      bg: DS_COLORS_V2.difficulty.easy.bg,
    };
  }
  if (d === 'HARD') {
    return {
      label: 'HARD',
      fg: DS_COLORS_V2.difficulty.hard.fg,
      bg: DS_COLORS_V2.difficulty.hard.bg,
    };
  }
  return {
    label: 'MED',
    fg: DS_COLORS_V2.difficulty.medium.fg,
    bg: DS_COLORS_V2.difficulty.medium.bg,
  };
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
  const diff = difficultyTone(challenge.difficulty);
  const friendsCount = challenge.previewUsers.length;
  const meta = `${challenge.duration} ${dayWord(challenge.duration)} · ${challenge.category}`;
  const a11y = `${challenge.title}, ${meta}, ${diff.label} difficulty, tap to view`;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Icon
            size={18}
            color={DS_COLORS_V2.brand.primary}
            strokeWidth={2}
          />
        </View>
        <View style={[styles.diffPill, { backgroundColor: diff.bg }]}>
          <Text style={[styles.diffText, { color: diff.fg }]}>{diff.label}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {challenge.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {meta}
      </Text>

      {friendsCount > 0 ? (
        <View style={styles.socialRow}>
          <View style={styles.avatarStack}>
            {challenge.previewUsers.slice(0, 3).map((u, i) => (
              <Avatar
                key={u.user_id}
                url={u.avatar_url}
                name={u.username ?? '?'}
                size={18}
                userId={u.user_id}
                style={[
                  styles.stackedAvatar,
                  i === 0 ? null : styles.stackedAvatarOverlap,
                ]}
              />
            ))}
          </View>
          <Text style={styles.socialText} numberOfLines={1}>
            {friendsCount === 1 ? '1 friend' : `${friendsCount} friends`}
          </Text>
        </View>
      ) : (
        <Text style={styles.firstToday}>Be first today</Text>
      )}
    </Pressable>
  );
});

export default ChallengeGridCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.lg,
    padding: DS_SPACING_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: DS_RADIUS_V2.sm,
  },
  diffText: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  meta: {
    fontSize: 10,
    fontWeight: '400',
    color: DS_COLORS_V2.text.secondary,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.surface.card,
    borderRadius: 9,
  },
  stackedAvatarOverlap: {
    marginLeft: -5,
  },
  socialText: {
    fontSize: 10,
    fontWeight: '400',
    color: DS_COLORS_V2.text.secondary,
  },
  firstToday: {
    fontSize: 9,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primary,
    marginTop: 4,
  },
});
