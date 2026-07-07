/**
 * JeopardyModal — Daylight v3 S3: Streak in jeopardy.
 *
 * Trigger: homeState === 'streak_at_risk'
 *   (streak >= 1, minutesRemaining < 60, tasksRemaining > 0)
 * Entry:   Home modal takeover — shown once per UTC day via AsyncStorage.
 *
 * CTAs:
 *   - "Finish & post proof"  → onPressFinish (routes to task completion)
 *   - "Use a freeze instead" → onPressFreeze (FLAGS.FREEZE_SERVER_ENFORCED gated)
 *   - X dismiss              → onDismiss (always available)
 *
 * Events fired:
 *   trackEvent('streak_jeopardy_shown')   on mount
 *   trackEvent('streak_freeze_used')       on freeze press
 */

import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X, Clock, Snowflake } from 'lucide-react-native';
import { DS_DAYLIGHT } from '@/lib/design-system';
import { trackEvent } from '@/lib/analytics';
import { FLAGS } from '@/lib/feature-flags';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export type JeopardyModalProps = {
  visible: boolean;
  streak: number;
  minutesRemaining: number;
  /** Available freeze tokens — 0 means freeze button is disabled. */
  freezesAvailable: number;
  /** Routes to task completion for the next incomplete task. */
  onPressFinish: () => void;
  /** Triggers freeze flow — no-op when FLAGS.FREEZE_SERVER_ENFORCED is false. */
  onPressFreeze: () => void;
  onDismiss: () => void;
};

export function JeopardyModal({
  visible,
  streak,
  minutesRemaining,
  freezesAvailable,
  onPressFinish,
  onPressFreeze,
  onDismiss,
}: JeopardyModalProps) {
  useEffect(() => {
    if (visible) {
      trackEvent('streak_jeopardy_shown', {
        streak,
        minutes_remaining: minutesRemaining,
        freezes_available: freezesAvailable,
      });
    }
  }, [visible, streak, minutesRemaining, freezesAvailable]);

  const handleFreeze = () => {
    trackEvent('streak_freeze_used', { streak });
    onPressFreeze();
  };

  const freezeDisabled = freezesAvailable <= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityLabel="Dismiss jeopardy alert"
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Clock
                size={22}
                color={DS_DAYLIGHT.color.accent}
                strokeWidth={2}
              />
            </View>
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
              <X
                size={20}
                color={DS_DAYLIGHT.color.inkMuted}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.title}>
              {`Day ${streak + 1} is slipping away`}
            </Text>
            <Text style={styles.sub}>
              {`${minutesRemaining} ${minutesRemaining === 1 ? 'minute' : 'minutes'} left to secure today. Post your proof now to keep the streak.`}
            </Text>
          </View>

          {/* Streak stat */}
          <View style={styles.streakRow}>
            <Text style={styles.streakLabel}>Current streak</Text>
            <Text style={styles.streakValue}>{`${streak} days`}</Text>
          </View>

          <View style={styles.divider} />

          {/* CTAs */}
          <View style={styles.ctaStack}>
            <Pressable
              onPress={onPressFinish}
              accessibilityRole="button"
              accessibilityLabel="Finish and post proof"
              style={({ pressed }) => [
                styles.primaryCta,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.primaryCtaText}>Finish & post proof</Text>
            </Pressable>

            <Pressable
              onPress={handleFreeze}
              disabled={freezeDisabled || !FLAGS.FREEZE_SERVER_ENFORCED}
              accessibilityRole="button"
              accessibilityLabel={
                freezeDisabled
                  ? 'No freeze tokens available'
                  : FLAGS.FREEZE_SERVER_ENFORCED
                    ? `Use a freeze, ${freezesAvailable} available`
                    : 'Freeze not available yet'
              }
              accessibilityState={{ disabled: freezeDisabled || !FLAGS.FREEZE_SERVER_ENFORCED }}
              style={({ pressed }) => [
                styles.freezeCta,
                (freezeDisabled || !FLAGS.FREEZE_SERVER_ENFORCED) && styles.freezeCtaDisabled,
                pressed && !freezeDisabled && FLAGS.FREEZE_SERVER_ENFORCED ? styles.pressed : null,
              ]}
            >
              <Snowflake
                size={16}
                color={
                  freezeDisabled || !FLAGS.FREEZE_SERVER_ENFORCED
                    ? DS_DAYLIGHT.color.inkMuted3
                    : DS_DAYLIGHT.color.accent
                }
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.freezeCtaText,
                  (freezeDisabled || !FLAGS.FREEZE_SERVER_ENFORCED) && styles.freezeCtaTextDisabled,
                ]}
              >
                {FLAGS.FREEZE_SERVER_ENFORCED
                  ? freezeDisabled
                    ? 'No freezes left'
                    : `Use a freeze (${freezesAvailable} left)`
                  : 'Freeze not available yet'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderTopLeftRadius: DS_DAYLIGHT.radius.sheet,
    borderTopRightRadius: DS_DAYLIGHT.radius.sheet,
    paddingHorizontal: DS_DAYLIGHT.space.screenH,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
  },
  body: {
    gap: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: DS_DAYLIGHT.size.cardTitle,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkSecondary,
    lineHeight: 22,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  streakLabel: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  streakValue: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.ink,
  },
  divider: {
    height: 1,
    backgroundColor: DS_DAYLIGHT.color.divider,
    marginBottom: 20,
  },
  ctaStack: {
    gap: 12,
  },
  primaryCta: {
    height: 52,
    borderRadius: DS_DAYLIGHT.radius.button,
    backgroundColor: DS_DAYLIGHT.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.white,
  },
  freezeCta: {
    height: 52,
    borderRadius: DS_DAYLIGHT.radius.button,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    backgroundColor: DS_DAYLIGHT.color.fieldNeutral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  freezeCtaDisabled: {
    borderColor: DS_DAYLIGHT.color.divider,
    backgroundColor: 'transparent',
  },
  freezeCtaText: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.ink,
  },
  freezeCtaTextDisabled: {
    color: DS_DAYLIGHT.color.inkMuted3,
  },
  pressed: {
    opacity: 0.75,
  },
});
