import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';

interface NotificationScreenProps {
  onContinue: () => void;
}

export default function NotificationScreen({ onContinue }: NotificationScreenProps) {
  const [requesting, setRequesting] = useState(false);

  const handleEnable = async () => {
    setRequesting(true);
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        await Notifications.getExpoPushTokenAsync();
        // TODO: Save token.data to backend/profiles table
      }
    } catch {
      // ignore
    }
    setRequesting(false);
    onContinue();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        <Text style={styles.title}>Stay accountable.</Text>
        <Text style={styles.subtitle}>
          Get reminders to complete your daily tasks.{'\n'}
          Streak warnings before you lose progress.{'\n'}
          Challenge updates from your crew.
        </Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>⏰</Text>
            <Text style={styles.benefitText}>Daily task reminders</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🔥</Text>
            <Text style={styles.benefitText}>Streak protection alerts</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>👊</Text>
            <Text style={styles.benefitText}>Challenge milestones</Text>
          </View>
        </View>
      </View>

      <View style={styles.ctaContainer}>
        <Pressable style={styles.primaryButton} onPress={handleEnable} disabled={requesting}>
          <Text style={styles.primaryButtonText}>
            {requesting ? 'Requesting...' : 'Enable notifications'}
          </Text>
        </Pressable>
        <Pressable onPress={onContinue}>
          <Text style={styles.skipText}>Not now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: S.screenPadding,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 8,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: T.headingSize,
    fontWeight: T.headingWeight,
    color: C.textPrimary,
    textAlign: 'center',
    letterSpacing: T.headingLetterSpacing,
  },
  subtitle: {
    fontSize: T.bodySize,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: T.bodyLineHeight,
  },
  benefitsList: {
    alignSelf: 'stretch',
    backgroundColor: C.surface,
    borderRadius: S.cardRadius,
    padding: 18,
    gap: 14,
    borderWidth: 0.5,
    borderColor: C.border,
    marginTop: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  benefitText: {
    fontSize: T.bodySize,
    color: C.textPrimary,
    fontWeight: '500',
  },
  ctaContainer: { gap: 14 },
  primaryButton: {
    backgroundColor: C.accent,
    height: S.buttonHeight,
    borderRadius: S.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: T.bodySize,
    fontWeight: '700',
    color: C.textOnAccent,
  },
  skipText: {
    fontSize: T.smallSize,
    color: C.textTertiary,
    textAlign: 'center',
    paddingVertical: 4,
  },
});
