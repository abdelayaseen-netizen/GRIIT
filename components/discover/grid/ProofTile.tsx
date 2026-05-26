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
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';
import type { LiveFeedPost } from '@/components/feed/feedTypes';

const TILE_GRADIENT: readonly [string, string] = [
  DS_COLORS_V2.overlay.photoGradientStrong,
  DS_COLORS_V2.overlay.photoGradientClear,
];

const FALLBACK_GRADIENT = DS_COLORS_V2.surface.heroDarkWarmGradient;

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
            color={DS_COLORS_V2.brand.primaryOnDark}
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

export default ProofTile;

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    borderRadius: DS_RADIUS_V2.lg,
    overflow: 'hidden',
    backgroundColor: DS_COLORS_V2.surface.heroDark,
  },
  legibility: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  dayBadge: {
    position: 'absolute',
    top: DS_SPACING_V2.sm,
    left: DS_SPACING_V2.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto55,
  },
  dayBadgeText: {
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: DS_COLORS_V2.text.onDark,
  },
  kudos: {
    position: 'absolute',
    top: DS_SPACING_V2.sm,
    right: DS_SPACING_V2.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto55,
  },
  kudosText: {
    fontSize: 9,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
  },
  bottom: {
    position: 'absolute',
    left: DS_SPACING_V2.sm,
    right: DS_SPACING_V2.sm,
    bottom: DS_SPACING_V2.sm,
    gap: 1,
  },
  challengeLine: {
    fontSize: 10,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
  },
  authorLine: {
    fontSize: 8,
    fontWeight: '400',
    color: DS_COLORS_V2.overlay.textOnPhoto70,
  },
});
