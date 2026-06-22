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
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/lib/routes';
import { DS_DAYLIGHT } from '@/lib/design-system';
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

const HERO_HEIGHT = 236;

const FALLBACK_GRADIENT: readonly [string, string] = [
  DS_DAYLIGHT.color.photoBaseDark,
  DS_DAYLIGHT.color.darkCanvas,
];

const PHOTO_GRADIENT: readonly [string, string] = [
  DS_DAYLIGHT.color.photoGradientStrong,
  'transparent',
];

// Difficulty label only. On a Daylight photo card the pill is a glass chip with
// white text, so we no longer ramp the foreground colour by difficulty.
function difficultyLabel(d: HeroFeaturedDifficulty): string {
  if (d === 'EASY') return 'EASY';
  if (d === 'HARD') return 'HARD';
  return 'MED';
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
    return (
      <View style={styles.outer}>
        <SkeletonBase
          width="100%"
          height={HERO_HEIGHT}
          borderRadius={DS_DAYLIGHT.radius.card}
        />
      </View>
    );
  }

  const diffLabel = difficultyLabel(data.difficulty);
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
          locations={[0, 1]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.legibilityGradient}
          pointerEvents="none"
        />

        {/* Top-left TRENDING NOW badge */}
        <View style={styles.trendingBadge}>
          <Flame
            size={11}
            color={DS_DAYLIGHT.color.textOnPhoto}
            strokeWidth={2}
          />
          <Text style={styles.trendingText}>TRENDING NOW</Text>
        </View>

        {/* Top-right difficulty pill */}
        <View style={styles.diffPill}>
          <Text style={styles.diffPillText}>{diffLabel}</Text>
        </View>

        {/* Bottom content */}
        <View style={styles.bottom}>
          <View style={styles.bottomTextCol}>
            {attributionLine ? (
              <View style={styles.attributionRow}>
                <Avatar
                  url={null}
                  name={data.featuredProof?.user_display_name ?? '?'}
                  size={20}
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
          </View>

          <Pressable
            onPress={handleOpen}
            accessibilityRole="button"
            accessibilityLabel="Start challenge"
            hitSlop={HIT_SLOP}
            style={({ pressed }) => [styles.cta, pressed ? styles.ctaPressed : null]}
          >
            <Text style={styles.ctaText}>Start</Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
});


const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    marginBottom: DS_DAYLIGHT.space.rowGapV,
  },
  card: {
    height: HERO_HEIGHT,
    width: '100%',
    borderRadius: DS_DAYLIGHT.radius.card,
    overflow: 'hidden',
    backgroundColor: DS_DAYLIGHT.color.photoBaseDark,
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
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.glassChipOnPhotoBorder,
  },
  trendingText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 9,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: 0.8,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  diffPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.glassChipOnPhotoBg,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.glassChipOnPhotoBorder,
  },
  diffPillText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 10,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: 0.6,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  bottom: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  bottomTextCol: {
    flex: 1,
    gap: 4,
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  avatarRing: {
    borderWidth: 1.5,
    borderColor: DS_DAYLIGHT.color.textOnPhoto,
    borderRadius: 10,
  },
  attributionText: {
    flex: 1,
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 11,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.textOnPhotoDim,
  },
  title: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 24,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    lineHeight: 27,
    letterSpacing: -0.24,
    color: DS_DAYLIGHT.color.textOnPhoto,
  },
  meta: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.meta,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.textOnPhotoDim,
  },
  cta: {
    backgroundColor: DS_DAYLIGHT.color.white,
    borderRadius: DS_DAYLIGHT.radius.chip,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: 14,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
});
