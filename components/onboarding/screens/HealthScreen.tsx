import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';

// NOTE: expo-health is not available yet in Expo SDK.
// For Apple Health, you need react-native-health (iOS only)
// For Google Fit/Health Connect, you need react-native-google-fit or react-native-health-connect
// These require native modules (dev client build, not Expo Go)
//
// For now this screen requests the permission and you wire it up
// when you have a dev build. The screen still shows value to the user.

interface HealthScreenProps {
  onContinue: () => void;
}

export default function HealthScreen({ onContinue }: HealthScreenProps) {
  const [requesting, setRequesting] = useState(false);

  const handleConnect = async () => {
    setRequesting(true);
    try {
      if (Platform.OS === 'ios') {
        // When you add react-native-health:
        // import AppleHealthKit from 'react-native-health';
        // const permissions = {
        //   permissions: {
        //     read: [
        //       AppleHealthKit.Constants.Permissions.StepCount,
        //       AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        //       AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        //       AppleHealthKit.Constants.Permissions.Workout,
        //     ],
        //   },
        // };
        // AppleHealthKit.initHealthKit(permissions, (error) => { /* error swallowed — handle in UI */ });
        // Apple Health: connect when react-native-health is installed
      } else {
        // Health Connect: connect when react-native-health-connect is installed
      }
    } catch {
      // ignore
    }
    setRequesting(false);
    onContinue();
  };

  const healthAppName = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>❤️</Text>
        </View>

        <Text style={styles.title}>Track it all.</Text>
        <Text style={styles.subtitle}>
          Connect {healthAppName} to automatically{'\n'}
          verify workouts, steps, and activity.{'\n'}
          No manual logging needed.
        </Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🏃</Text>
            <Text style={styles.benefitText}>Auto-verify workout challenges</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>👣</Text>
            <Text style={styles.benefitText}>Track steps and distance</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>📊</Text>
            <Text style={styles.benefitText}>See your progress over time</Text>
          </View>
        </View>
      </View>

      <View style={styles.ctaContainer}>
        <Pressable style={styles.primaryButton} onPress={handleConnect} disabled={requesting}>
          <Text style={styles.primaryButtonText}>
            {requesting ? 'Connecting...' : `Connect ${healthAppName}`}
          </Text>
        </Pressable>
        <Pressable onPress={onContinue}>
          <Text style={styles.skipText}>I&apos;ll do this later</Text>
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
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.25)',
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
