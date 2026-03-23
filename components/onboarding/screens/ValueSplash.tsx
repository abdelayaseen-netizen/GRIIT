import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Pressable,
  ScrollView,
} from "react-native";
import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/constants/onboarding-theme";
import { DS_MEASURES, DS_RADIUS } from "@/lib/design-system";
import { GRIITWordmark } from "@/src/components/ui/GRIITWordmark";
import { track } from "@/lib/analytics";

interface ValueSplashProps {
  onContinue: () => void;
}

const HERO_TITLE_SIZE = 34;

export default function ValueSplash({ onContinue }: ValueSplashProps) {
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeStat = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    track({ name: "onboarding_started" });
  }, []);

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
  }, [fadeButton, fadeStat, fadeSubtitle, fadeTitle, slideUp]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.darkHero}>
          <Animated.View style={{ opacity: fadeTitle }}>
            <GRIITWordmark color={C.coral} subtitle="" compact />
          </Animated.View>
          <Animated.Text style={[styles.heroTitle, { opacity: fadeTitle }]}>
            Discipline is not optional.
          </Animated.Text>
          <Animated.Text
            style={[
              styles.heroSubtitle,
              { opacity: fadeSubtitle, transform: [{ translateY: slideUp }] },
            ]}
          >
            Proof beats intention. Show up daily — we handle the structure.
          </Animated.Text>
        </View>

        <View style={styles.cream}>
          <Animated.View style={[styles.statsCard, { opacity: fadeStat }]}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>10+</Text>
              <Text style={styles.statLbl}>TASK TYPES</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>5</Text>
              <Text style={styles.statLbl}>VERIFY MODES</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLbl}>EXCUSES</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.ctaBlock, { opacity: fadeButton }]}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => onContinue()}
              accessibilityLabel="Continue onboarding"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>I&apos;m ready</Text>
            </Pressable>
            <Text style={styles.footerText}>60 seconds to set up. Free to start.</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  darkHero: {
    backgroundColor: C.darkHero,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: S.screenPadding,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroTitle: {
    marginTop: 20,
    fontSize: HERO_TITLE_SIZE,
    fontWeight: "800",
    color: C.WHITE,
    letterSpacing: -1,
    lineHeight: HERO_TITLE_SIZE * 1.15,
  },
  heroSubtitle: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: C.heroSubtitleOnDark,
  },
  cream: {
    flex: 1,
    paddingHorizontal: S.screenPadding,
    paddingTop: 24,
    paddingBottom: 32,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: C.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
  },
  statCol: { flex: 1, alignItems: "center", justifyContent: "center" },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: C.border, marginVertical: 4 },
  statNum: {
    fontSize: 24,
    fontWeight: "800",
    color: C.coral,
    letterSpacing: -0.5,
  },
  statLbl: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: "600",
    color: C.textTertiary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
  },
  ctaBlock: { marginTop: 28, gap: 12 },
  primaryButton: {
    backgroundColor: C.darkCta,
    height: DS_MEASURES.CTA_HEIGHT,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    color: C.WHITE,
  },
  footerText: {
    fontSize: 11,
    color: C.textTertiary,
    textAlign: "center",
    lineHeight: 16,
  },
});
