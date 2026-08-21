/**
 * StreakMomentOverlay — Daylight v3 S12: Streak moment.
 *
 * Full-screen dark overlay. Fires when all tasks for today are complete
 * (real completion detection: `isAllDayComplete === true` after a successful
 * completeTask() server call).
 *
 * CTAs:
 *   - "Share it"   → native Share sheet (trackEvent streak_secured_shared)
 *   - "Keep going" → Discover tab
 *   - Tap backdrop / X → dismiss
 */

import React, { useCallback } from 'react';
import {
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { DS_COLORS_V2, DS_SPACING_V2 } from '@/lib/design-system';
import { track } from '@/lib/analytics';
import { challengeDayNumber } from '@/lib/challenge-day';
import { StreakFlame } from './StreakFlame';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export type StreakMomentOverlayProps = {
  visible: boolean;
  /** Live streak count (may be 0 — do not invent). */
  streak: number;
  /**
   * Challenge day from active_challenges.current_day (via challengeDayNumber).
   * Not a streak — used only for "Day N is yours…" copy.
   */
  dayNumber: number;
  username?: string;
  /** Called after "Keep going" — parent should navigate to Discover. */
  onKeepGoing: () => void;
  onDismiss: () => void;
};

export function StreakMomentOverlay({
  visible,
  streak,
  dayNumber,
  username,
  onKeepGoing,
  onDismiss,
}: StreakMomentOverlayProps) {
  const day = challengeDayNumber(dayNumber);
  const handleShare = useCallback(async () => {
    try {
      const url = username ? `https://griit.app/u/${username}` : undefined;
      await Share.share({
        message: `Day ${day} secured on GRIIT. Discipline builds.`,
        ...(url ? { url } : {}),
      });
      try {
        track({ name: 'streak_secured_shared', streak });
      } catch {
        /* non-fatal */
      }
    } catch {
      /* user cancelled — no-op */
    }
  }, [day, streak, username]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityLabel="Dismiss streak moment"
      >
        <View style={styles.card}>
          {/* Dismiss X */}
          <Pressable
            onPress={onDismiss}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={({ pressed }) => [
              styles.closeBtn,
              pressed ? styles.pressed : null,
            ]}
          >
            <X size={18} color={DS_COLORS_V2.text.onDarkSecondary} strokeWidth={2} />
          </Pressable>

          {/* Flame */}
          <View style={styles.flameWrap}>
            <StreakFlame
              streak={streak}
              state={streak >= 30 ? 'onFire' : streak >= 7 ? 'locked' : 'building'}
              size={52}
            />
          </View>

          {/* Streak number */}
          <Text style={styles.streakNumber}>{streak.toLocaleString()}</Text>
          <Text style={styles.streakUnit}>day streak</Text>

          {/* Copy — day from challenge current_day, not streak */}
          <Text style={styles.headline}>Secured.</Text>
          <Text style={styles.sub}>
            {`Day ${day} is yours. Show up tomorrow for Day ${day + 1}.`}
          </Text>

          {/* CTAs */}
          <View style={styles.ctaStack}>
            <Pressable
              onPress={() => void handleShare()}
              accessibilityRole="button"
              accessibilityLabel="Share your streak"
              style={({ pressed }) => [
                styles.shareCta,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.shareCtaText}>Share it</Text>
            </Pressable>

            <Pressable
              onPress={onKeepGoing}
              accessibilityRole="button"
              accessibilityLabel="Keep going — go to Discover"
              style={({ pressed }) => [
                styles.keepGoingCta,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.keepGoingCtaText}>Keep going</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DS_SPACING_V2.lg,
  },
  card: {
    width: '100%',
    backgroundColor: DS_COLORS_V2.surface.heroDarkWarm,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  flameWrap: {
    marginTop: 8,
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 76,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
    letterSpacing: -2,
    lineHeight: 76,
  },
  streakUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: DS_COLORS_V2.text.onDarkSecondary,
    marginTop: -4,
    marginBottom: 12,
  },
  headline: {
    fontSize: 20,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 15,
    fontWeight: '400',
    color: DS_COLORS_V2.text.onDarkSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  ctaStack: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  shareCta: {
    height: 52,
    borderRadius: 15,
    backgroundColor: DS_COLORS_V2.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCtaText: {
    fontSize: 17,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primaryText,
  },
  keepGoingCta: {
    height: 52,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepGoingCtaText: {
    fontSize: 17,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDarkSecondary,
  },
  pressed: {
    opacity: 0.75,
  },
});
