/**
 * ForYouHero — immersive top card on the Discover "For you" feed.
 *
 * - Full-bleed proof photo (or warm gradient fallback) at 4:5 aspect ratio.
 * - Single bottom-anchored linear gradient drives legibility — 3 stops, no band.
 * - Top-left "TRENDING NOW" badge with flame; top-right difficulty pill.
 * - Bottom block: avatar + attribution, title, meta line, "Start challenge" CTA.
 *
 * NOTE on tap targets:
 *   The whole card is one tap target → CHALLENGE_ID. The CTA is visual emphasis,
 *   it shares the same handler so screen readers see two equivalent buttons.
 *   Avatar is *not* tappable here because `featuredProof` only carries
 *   `user_display_name`, not `username` — see project memory + spec push-back.
 */
import React, { useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { Avatar } from '@/components/Avatar';
import { SkeletonBase } from '@/components/skeletons';
import {
  type HeroFeaturedData,
  type HeroFeaturedDifficulty,
  type HeroFeaturedProofType,
} from '@/components/challenges/HeroFeaturedCard';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export type ForYouHeroProps = {
  data: HeroFeaturedData | null | undefined;
  loading: boolean;
};

const FALLBACK_GRADIENT = DS_COLORS_V2.surface.heroDarkWarmGradient;

const PHOTO_GRADIENT: readonly [string, string, string] = [
  DS_COLORS_V2.overlay.photoGradientDeep,
  DS_COLORS_V2.overlay.photoGradientLight,
  DS_COLORS_V2.overlay.photoGradientClear,
];

// Difficulty pill colour ramps. We render the pill on a *photo*, so the
// background is a translucent black chip and the text picks up the green /
// amber / red foreground from the V2 difficulty palette.
function difficultyTone(d: HeroFeaturedDifficulty): { label: string; fg: string } {
  if (d === 'EASY') {
    return { label: 'EASY', fg: DS_COLORS_V2.difficulty.easy.fg };
  }
  if (d === 'HARD') {
    return { label: 'HARD', fg: DS_COLORS_V2.difficulty.hard.fg };
  }
  return { label: 'MED', fg: DS_COLORS_V2.difficulty.medium.fg };
}

function proofTypeLabel(p: HeroFeaturedProofType): string {
  if (p === 'photo') return 'Photo proof';
  if (p === 'location') return 'Location proof';
  return 'Text proof';
}

function dayWord(n: number): string {
  return n === 1 ? 'day' : 'days';
}

function joinedThisWeekLine(joinedTodayCount: number): string {
  if (joinedTodayCount <= 0) return 'Be the first today';
  if (joinedTodayCount === 1) return '1 friend started this week';
  return `${joinedTodayCount} friends started this week`;
}

export const ForYouHero = React.memo(function ForYouHero({
  data,
  loading,
}: ForYouHeroProps) {
  const router = useRouter();

  const handleOpen = useCallback(() => {
    if (!data?.id) return;
    const target = (data.slug ?? data.id).trim() || data.id;
    router.push(ROUTES.CHALLENGE_ID(target) as never);
  }, [router, data?.id, data?.slug]);

  if (loading || !data) {
    const w = Dimensions.get('window').width - DS_SPACING_V2.md * 2;
    const h = Math.round(w * (5 / 4));
    return (
      <View style={styles.outer}>
        <SkeletonBase width="100%" height={h} borderRadius={DS_RADIUS_V2.xl} />
      </View>
    );
  }

  const { label: diffLabel, fg: diffFg } = difficultyTone(data.difficulty);
  const photo = data.featuredProof?.photo_url ?? null;
  const attributionLine = data.featuredProof
    ? `${data.featuredProof.user_display_name}'s day ${data.featuredProof.day_number} proof`
    : null;
  const metaLine = `${data.duration_days} ${dayWord(data.duration_days)} · ${proofTypeLabel(
    data.proof_type,
  )} · ${joinedThisWeekLine(data.joinedTodayCount)}`;
  const a11y = `${data.name}, ${metaLine}, tap to start`;

  return (
    <View style={styles.outer}>
      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        style={styles.card}
      >
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={140}
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

        {/* Bottom-anchored single gradient — anchored to bottom 65% of card */}
        <LinearGradient
          colors={PHOTO_GRADIENT}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.legibilityGradient}
          pointerEvents="none"
        />

        {/* Top-left TRENDING NOW badge */}
        <View style={styles.trendingBadge}>
          <Flame
            size={11}
            color={DS_COLORS_V2.brand.primaryOnDark}
            strokeWidth={2}
          />
          <Text style={styles.trendingText}>TRENDING NOW</Text>
        </View>

        {/* Top-right difficulty pill */}
        <View style={styles.diffPill}>
          <Text style={[styles.diffPillText, { color: diffFg }]}>{diffLabel}</Text>
        </View>

        {/* Bottom content */}
        <View style={styles.bottom}>
          {attributionLine ? (
            <View style={styles.attributionRow}>
              <Avatar
                url={null}
                name={data.featuredProof?.user_display_name ?? '?'}
                size={24}
                userId={data.featuredProof?.user_display_name ?? data.id}
                style={styles.avatarRing}
              />
              <Text style={styles.attributionText} numberOfLines={1}>
                {attributionLine}
              </Text>
            </View>
          ) : null}

          <Text style={styles.title} numberOfLines={2}>
            {data.name}
          </Text>

          <Text style={styles.meta} numberOfLines={1}>
            {metaLine}
          </Text>

          <Pressable
            onPress={handleOpen}
            accessibilityRole="button"
            accessibilityLabel="Start challenge"
            hitSlop={HIT_SLOP}
            style={({ pressed }) => [styles.cta, pressed ? styles.ctaPressed : null]}
          >
            <Text style={styles.ctaText}>Start challenge</Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
});

export default ForYouHero;

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: DS_SPACING_V2.md,
    marginBottom: DS_SPACING_V2.xs,
  },
  card: {
    aspectRatio: 4 / 5,
    width: '100%',
    borderRadius: DS_RADIUS_V2.xl,
    overflow: 'hidden',
    backgroundColor: DS_COLORS_V2.surface.heroDark,
  },
  legibilityGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  trendingBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto55,
  },
  trendingText: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.8,
    color: DS_COLORS_V2.text.onDark,
  },
  diffPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.chipOnPhoto70,
  },
  diffPillText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  bottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    gap: 6,
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  avatarRing: {
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.brand.primaryOnDark,
    borderRadius: 12,
  },
  attributionText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '400',
    color: DS_COLORS_V2.overlay.textOnPhoto85,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 29,
    letterSpacing: -0.4,
    color: DS_COLORS_V2.text.onDark,
  },
  meta: {
    fontSize: 11,
    fontWeight: '400',
    color: DS_COLORS_V2.overlay.textOnPhoto70,
  },
  cta: {
    marginTop: DS_SPACING_V2.sm,
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primaryText,
  },
});
