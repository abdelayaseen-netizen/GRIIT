/**
 * ProofTile — masonry tile for trending posts on the Discover For-You grid.
 *
 * Background: post photo (or warm gradient fallback) under a single
 * bottom-anchored linear gradient. Top badges (Day N, kudos count) and
 * bottom-left attribution are positioned via absolute layout.
 *
 * Two visual variants: `normal` (1:1.3) and `tall` (1:1.5). Used by the
 * masonry composer to break up the rhythm. No animations — keep it cheap
 * to render so the FlashList stays performant.
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/lib/routes';
import { DS_DAYLIGHT } from '@/lib/design-system';
import type { LiveFeedPost } from '@/components/feed/feedTypes';

const TILE_GRADIENT: readonly [string, string] = [
  DS_DAYLIGHT.color.photoGradientStrong,
  'transparent',
];

const FALLBACK_GRADIENT: readonly [string, string] = [
  DS_DAYLIGHT.color.photoBaseDark,
  DS_DAYLIGHT.color.darkCanvas,
];

export type ProofTileVariant = 'normal' | 'tall';

export type ProofTileProps = {
  post: LiveFeedPost;
  variant?: ProofTileVariant;
};

export const ProofTile = React.memo(function ProofTile({
  post,
  variant = 'normal',
}: ProofTileProps) {
  const router = useRouter();
  const handlePress = useCallback(() => {
    router.push(ROUTES.POST_ID(post.id) as never);
  }, [router, post.id]);

  const photo = post.proofPhotoUrl ?? post.photoUrl ?? null;
  const aspect = variant === 'tall' ? 1 / 1.5 : 1 / 1.3;

  const author =
    post.displayName?.trim() ||
    (post.username ? `@${post.username}` : 'Someone');
  const challengeLabel = post.challengeName?.trim() || 'Challenge';
  const a11y = `${challengeLabel} by ${author}, day ${post.currentDay}, tap to open`;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[styles.tile, { aspectRatio: aspect }]}
    >
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={120}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <LinearGradient
          colors={FALLBACK_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={TILE_GRADIENT}
        locations={[0, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.legibility}
        pointerEvents="none"
      />

      <View style={styles.dayBadge}>
        <Text style={styles.dayBadgeText}>Day {post.currentDay}</Text>
      </View>

      {post.respectCount > 0 ? (
        <View style={styles.kudos}>
          <Flame
            size={9}
            color={DS_DAYLIGHT.color.textOnPhoto}
            strokeWidth={2}
          />
          <Text style={styles.kudosText}>{post.respectCount}</Text>
        </View>
      ) : null}

      <View style={styles.bottom}>
        <Text style={styles.challengeLine} numberOfLines={1}>
          {challengeLabel}
        </Text>
        <Text style={styles.authorLine} numberOfLines={1}>
          {author}
        </Text>
      </View>
    </Pressable>
  );
});


const styles = StyleSheet.create({
  tile: {
    width: '100%',
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    overflow: 'hidden',
    backgroundColor: DS_DAYLIGHT.color.photoBaseDark,
  },
  legibility: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  dayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.glassChipOnPhotoBorder,
  },
  dayBadgeText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 9,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: 0.4,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  kudos: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.glassChipOnPhotoBorder,
  },
  kudosText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 9,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  bottom: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 1,
  },
  challengeLine: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 13.5,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  authorLine: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 11,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.textOnPhotoDim,
  },
});
