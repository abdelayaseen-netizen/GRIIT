import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Shield, Share2, ChevronRight, Home } from "lucide-react-native";
import ViewShot from "react-native-view-shot";
import Celebration from "@/components/Celebration";
import { ShareCard } from "@/components/ShareCard";
import { shareProgressImage, shareChallengeComplete } from "@/lib/share";
import { DS_COLORS, DS_SPACING, DS_RADIUS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { track, trackEvent } from "@/lib/analytics";
import { maybePromptForReview } from "@/lib/review-prompt";
import { captureError } from "@/lib/sentry";

export default function ChallengeCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const challengeIdParam =
    typeof params.challengeId === "string" ? params.challengeId : undefined;
  const challengeName = (params.challengeName as string) ?? "Challenge";
  const totalDays = parseInt((params.totalDays as string) ?? "0", 10);
  const streakCount = parseInt((params.streakCount as string) ?? "0", 10);
  const tier = (params.tier as string) ?? undefined;
  const totalDaysSecured = parseInt((params.totalDaysSecured as string) ?? "0", 10);

  const [showCelebration, setShowCelebration] = useState(true);
  const [shareError, setShareError] = useState(false);
  const shareCardRef = useRef<InstanceType<typeof ViewShot> | null>(null);

  useEffect(() => {
    track({
      name: "challenge_completed",
      challenge_name: challengeName,
      duration: totalDays,
    });
    trackEvent("challenge_completed", { challenge_id: challengeIdParam, days: totalDays });
  }, [challengeName, totalDays, challengeIdParam]);

  useEffect(() => {
    if (totalDaysSecured > 0) {
      // Review prompt is best-effort; failure is not user-facing
      maybePromptForReview(totalDaysSecured, "challenge_completed").catch(() => {});
    }
  }, [totalDaysSecured]);

  const handleShare = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShareError(false);
    try {
      const uri = await shareCardRef.current?.capture?.();
      if (uri) {
        const message = `I completed "${challengeName}" on GRIIT. ${totalDays} days secured. Join me — griit.app`;
        await shareProgressImage(uri, message);
      } else {
        await shareChallengeComplete({
          name: challengeName,
          duration: totalDays,
          daysCompleted: totalDays,
        });
      }
    } catch (e) {
      captureError(e, "ChallengeCompleteShare");
      setShareError(true);
    }
  };

  const handleWhatsNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(ROUTES.TABS_DISCOVER as never);
  };

  const handleBackToHome = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(ROUTES.TABS_HOME as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <Celebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        titleText="CHALLENGE COMPLETE"
        streakCount={streakCount}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeWrap}>
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <Shield size={48} color={DS_COLORS.white} fill={DS_COLORS.white} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>You completed {challengeName}!</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total days</Text>
            <Text style={styles.statValue}>{totalDays}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Final streak</Text>
            <Text style={styles.statValue}>{streakCount} days</Text>
          </View>
          {tier ? (
            <>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tier</Text>
                <Text style={styles.statValue}>{tier}</Text>
              </View>
            </>
          ) : null}
        </View>

        <ViewShot
          ref={shareCardRef}
          options={{ format: "png", result: "tmpfile", width: 400, height: 500 }}
          style={styles.viewShotWrap}
        >
          <ShareCard
            type="completion"
            streakCount={streakCount}
            challengeName={challengeName}
            totalDays={totalDays}
            tier={tier}
          />
        </ViewShot>

        {shareError && (
          <Text style={styles.shareError}>Share failed. Tap to retry.</Text>
        )}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.85}
          accessibilityLabel="Share your achievement"
          accessibilityRole="button"
        >
          <Share2 size={20} color={DS_COLORS.white} />
          <Text style={styles.shareButtonText}>Share your achievement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.whatsNextButton}
          onPress={handleWhatsNext}
          activeOpacity={0.85}
          accessibilityLabel="Find your next challenge"
          accessibilityRole="button"
        >
          <Text style={styles.whatsNextText}>What&apos;s next?</Text>
          <Text style={styles.whatsNextSub}>Ready for your next challenge?</Text>
          <ChevronRight size={22} color={DS_COLORS.accent} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backHomeLink}
          onPress={handleBackToHome}
          activeOpacity={0.7}
          accessibilityLabel="Back to Home"
          accessibilityRole="button"
        >
          <Home size={16} color={DS_COLORS.textMuted} />
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingBottom: DS_SPACING.xxxl,
    alignItems: "center",
  },
  badgeWrap: { marginBottom: 24 },
  badgeOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DS_COLORS.success + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DS_COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: DS_COLORS.card,
    borderRadius: DS_RADIUS.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 15, fontWeight: "600", color: DS_COLORS.textSecondary },
  statValue: { fontSize: 17, fontWeight: "800", color: DS_COLORS.textPrimary },
  divider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
    marginVertical: 12,
  },
  viewShotWrap: { position: "absolute", left: -9999, opacity: 0 },
  shareError: {
    fontSize: 13,
    color: DS_COLORS.danger,
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    maxWidth: 340,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.accent,
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  whatsNextButton: {
    width: "100%",
    maxWidth: 340,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: DS_RADIUS.button,
    borderWidth: 2,
    borderColor: DS_COLORS.accent,
    backgroundColor: "transparent",
    marginBottom: 24,
    position: "relative",
  },
  whatsNextText: {
    fontSize: 16,
    fontWeight: "700",
    color: DS_COLORS.accent,
    textAlign: "center",
  },
  whatsNextSub: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  chevron: { position: "absolute", right: 16, top: "50%", marginTop: -11 },
  backHomeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS.textMuted,
  },
});
