import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Pressable,
} from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';
import { track } from '@/lib/analytics';

interface ValueSplashProps {
  onContinue: () => void;
}

export default function ValueSplash({ onContinue }: ValueSplashProps) {
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeStat = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeTitle, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeSubtitle, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(fadeStat, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeButton, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View style={[styles.brandContainer, { opacity: fadeTitle }]}>
        <Text style={styles.brandMark}>G R I I T</Text>
      </Animated.View>

      <View style={styles.heroSection}>
        <Animated.Text style={[styles.heroTitle, { opacity: fadeTitle }]}>
          Discipline is{'\n'}not optional.
        </Animated.Text>

        <Animated.Text
          style={[
            styles.heroSubtitle,
            { opacity: fadeSubtitle, transform: [{ translateY: slideUp }] },
          ]}
        >
          Join structured challenges. Build unbreakable habits.{'\n'}
          Prove it with real accountability.
        </Animated.Text>

        <Animated.View style={[styles.statRow, { opacity: fadeStat }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>75</Text>
            <Text style={styles.statLabel}>Day challenges</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Accountability</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Excuses</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.ctaContainer, { opacity: fadeButton }]}>
        <Pressable style={styles.primaryButton} onPress={() => { track({ name: 'onboarding_started' }); onContinue(); }}>
          <Text style={styles.primaryButtonText}>Continue &gt;</Text>
        </Pressable>
        <Text style={styles.footerText}>
          Takes 60 seconds · No credit card needed
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: S.screenPadding,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandContainer: { alignItems: 'flex-start' },
  brandMark: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 6,
  },
  heroSection: { flex: 1, justifyContent: 'center' },
  heroTitle: {
    fontSize: T.heroSize,
    fontWeight: T.heroWeight,
    color: C.textPrimary,
    lineHeight: T.heroLineHeight,
    letterSpacing: T.heroLetterSpacing,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: T.bodySize,
    lineHeight: T.bodyLineHeight,
    color: C.textSecondary,
    marginBottom: 40,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: S.cardRadius,
    padding: 20,
    borderWidth: 0.5,
    borderColor: C.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: C.accent, marginBottom: 4 },
  statLabel: {
    fontSize: T.captionSize,
    color: C.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: { width: 1, height: 36, backgroundColor: C.border },
  ctaContainer: { gap: 16 },
  primaryButton: {
    backgroundColor: C.accent,
    height: S.buttonHeight,
    borderRadius: S.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: T.subheadingSize, fontWeight: '700', color: C.textOnAccent },
  footerText: { fontSize: T.captionSize, color: C.textTertiary, textAlign: 'center' },
});
