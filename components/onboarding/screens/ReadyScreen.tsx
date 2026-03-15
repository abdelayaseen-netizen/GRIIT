import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';

interface ReadyScreenProps {
  username: string;
  onStart: () => void;
}

export default function ReadyScreen({ username, onStart }: ReadyScreenProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }], opacity }]}>
          <Text style={styles.icon}>🔥</Text>
        </Animated.View>

        <Animated.View style={{ opacity, transform: [{ translateY: slideUp }] }}>
          <Text style={styles.title}>You&apos;re in, @{username}.</Text>
          <Text style={styles.subtitle}>
            Your discipline journey starts now.{'\n'}
            No one is coming to save you.{'\n'}
            That&apos;s the point.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, { opacity }]}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatNumber}>0</Text>
            <Text style={styles.miniStatLabel}>Day streak</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatNumber}>0</Text>
            <Text style={styles.miniStatLabel}>Challenges</Text>
          </View>
          <View style={styles.miniStatDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniStatNumber}>∞</Text>
            <Text style={styles.miniStatLabel}>Potential</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.ctaContainer}>
        <Pressable style={styles.primaryButton} onPress={onStart}>
          <Text style={styles.primaryButtonText}>Start my first challenge</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: S.screenPadding, paddingTop: 40, paddingBottom: 40, justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 28 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: C.accentBorder },
  icon: { fontSize: 48 },
  title: { fontSize: T.headingSize, fontWeight: T.headingWeight, color: C.textPrimary, textAlign: 'center', letterSpacing: T.headingLetterSpacing, marginBottom: 12 },
  subtitle: { fontSize: T.bodySize, color: C.textSecondary, textAlign: 'center', lineHeight: T.bodyLineHeight },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: S.cardRadius, padding: 20, borderWidth: 0.5, borderColor: C.border, alignSelf: 'stretch', marginTop: 12 },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatNumber: { fontSize: 22, fontWeight: '800', color: C.accent },
  miniStatLabel: { fontSize: 11, color: C.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  miniStatDivider: { width: 1, height: 30, backgroundColor: C.border },
  ctaContainer: { gap: 12 },
  primaryButton: { backgroundColor: C.accent, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
});
