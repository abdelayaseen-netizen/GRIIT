/**
 * NudgeCard — small inline prompt inside the For-You masonry grid.
 *
 * Three variants:
 *   - badge_in_reach   → tinted brand surface, scrolls towards an easy challenge
 *   - streak_at_risk   → soft danger surface, jumps Home to secure today
 *   - create_your_own  → outlined dashed surface, opens the create wizard
 *
 * Tap targets are large (whole card) and the variant determines the icon,
 * copy and target route. When `onPress` is supplied, the parent overrides the
 * default route — used by `badge_in_reach` so the composer can scroll its
 * own list to a specific tile.
 */
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Flame, Plus, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/lib/routes';
import { DS_DAYLIGHT } from '@/lib/design-system';

type NudgeVariant =
  | 'badge_in_reach'
  | 'streak_at_risk'
  | 'create_your_own';

export type NudgeCardProps = {
  variant: NudgeVariant;
  badgeName?: string;
  daysAway?: number;
  streakAtRiskMinutes?: number;
  /** Override default tap behavior. Used by `badge_in_reach`. */
  onPress?: () => void;
};

function formatRiskCopy(minutes: number | undefined): string {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    return 'Streak ends soon';
  }
  if (minutes < 60) return `Streak ends in ${Math.max(1, Math.round(minutes))} minutes`;
  const hours = Math.round(minutes / 60);
  return `Streak ends in ${hours} hour${hours === 1 ? '' : 's'}`;
}

export const NudgeCard = React.memo(function NudgeCard({
  variant,
  badgeName,
  daysAway,
  streakAtRiskMinutes,
  onPress,
}: NudgeCardProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }
    if (variant === 'streak_at_risk') {
      router.push(ROUTES.TABS_HOME as never);
      return;
    }
    if (variant === 'create_your_own') {
      router.push(ROUTES.CREATE_WIZARD as never);
      return;
    }
    // badge_in_reach has no default — composer should provide onPress.
  }, [onPress, variant, router]);

  if (variant === 'badge_in_reach') {
    const name = badgeName?.trim() || 'Badge';
    const daysLine =
      typeof daysAway === 'number' && daysAway > 0
        ? `${daysAway} day${daysAway === 1 ? '' : 's'} away`
        : 'Pick a challenge to unlock';
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${name} badge in reach. ${daysLine}.`}
        style={[styles.card, styles.badgeBg]}
      >
        <View style={styles.iconRow}>
          <View style={styles.iconWrapBadge}>
            <Zap
              size={16}
              color={DS_DAYLIGHT.color.accent}
              strokeWidth={2}
            />
          </View>
        </View>
        <Text style={styles.titleBadge} numberOfLines={2}>
          {name} badge in reach
        </Text>
        <Text style={styles.subBadge} numberOfLines={1}>
          {daysLine}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'streak_at_risk') {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${formatRiskCopy(streakAtRiskMinutes)}. Tap to secure.`}
        style={[styles.card, styles.riskBg]}
      >
        <View style={styles.iconRow}>
          <View style={styles.iconWrapRisk}>
            <Flame
              size={16}
              color={DS_DAYLIGHT.color.accent}
              strokeWidth={2}
            />
          </View>
        </View>
        <Text style={styles.titleRisk} numberOfLines={2}>
          {formatRiskCopy(streakAtRiskMinutes)}
        </Text>
        <Text style={styles.subRisk} numberOfLines={1}>
          Tap to secure
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Create your own challenge"
      style={[styles.card, styles.createBg]}
    >
      <View style={styles.iconRow}>
        <View style={styles.iconWrapCreate}>
          <Plus
            size={16}
            color={DS_DAYLIGHT.color.ink}
            strokeWidth={2}
          />
        </View>
      </View>
      <Text style={styles.titleCreate} numberOfLines={2}>
        Create your own
      </Text>
      <Text style={styles.subCreate} numberOfLines={1}>
        Build a custom challenge in 30 seconds
      </Text>
    </Pressable>
  );
});


const styles = StyleSheet.create({
  card: {
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    padding: DS_DAYLIGHT.space.cardPad,
    gap: 4,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  badgeBg: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  riskBg: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  createBg: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.dashedBorder,
    borderStyle: 'dashed',
  },
  iconRow: {
    flexDirection: 'row',
  },
  iconWrapBadge: {
    width: 30,
    height: 30,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapRisk: {
    width: 30,
    height: 30,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCreate: {
    width: 30,
    height: 30,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBadge: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accentAccessible,
  },
  subBadge: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.accent,
  },
  titleRisk: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.accentAccessible,
  },
  subRisk: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.accent,
  },
  titleCreate: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  subCreate: {
    fontFamily: DS_DAYLIGHT.fontFamily,
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.inkMuted,
  },
});
