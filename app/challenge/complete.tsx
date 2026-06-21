import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Flame, Send } from "lucide-react-native";
import ViewShot from "react-native-view-shot";
import Celebration from "@/components/Celebration";
import { ShareCard } from "@/components/ShareCard";
import { shareProgressImage, shareChallengeComplete } from "@/lib/share";
import { DS_DAYLIGHT } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { track, trackEvent } from "@/lib/analytics";
import { maybePromptForReview } from "@/lib/review-prompt";
import { captureError } from "@/lib/sentry";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const C = DS_DAYLIGHT.color;

function ChallengeCompleteScreenInner() {
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

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  }, [challengeName, totalDays]);

  const handleKeepGoing = useCallback(() => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(ROUTES.TABS_HOME as never);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <Celebration
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        titleText="CHALLENGE COMPLETE"
        streakCount={streakCount}
      />

      {/* Offscreen capture target — preserves image sharing. */}
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Flame size={72} color={C.accent} fill={C.accent} />
        </View>

        <View style={styles.completeRow}>
          <Flame size={20} color={C.accent} fill={C.accent} />
          <Text style={styles.completeLabel} numberOfLines={1}>
            {challengeName} · complete
          </Text>
        </View>

        <View style={styles.numberRow}>
          <Text style={styles.bigNumber}>{totalDays}</Text>
          <Text style={styles.daysLabel}>days</Text>
        </View>

        <Text style={styles.message}>
          {totalDays} days, every one logged. That&apos;s yours now — nobody can take it.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        {shareError ? (
          <Text style={styles.shareError}>Share failed. Tap to retry.</Text>
        ) : null}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.85}
          accessibilityLabel="Share your achievement"
          accessibilityRole="button"
        >
          <Send size={17} color={C.white} />
          <Text style={styles.shareButtonText}>Share it</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepGoing}
          onPress={handleKeepGoing}
          activeOpacity={0.7}
          accessibilityLabel="Keep going — back to Home"
          accessibilityRole="button"
        >
          <Text style={styles.keepGoingText}>Keep going</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function ChallengeCompleteScreen() {
  return (
    <ErrorBoundary>
      <ChallengeCompleteScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.darkCanvas },
  viewShotWrap: { position: "absolute", left: -9999, opacity: 0 },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  heroCard: {
    width: 188,
    height: 235,
    borderRadius: DS_DAYLIGHT.radius.card,
    backgroundColor: C.darkHeroCard,
    alignItems: "center",
    justifyContent: "center",
    ...DS_DAYLIGHT.shadow.heroCard,
  },
  completeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 38,
    maxWidth: 320,
  },
  completeLabel: {
    fontSize: DS_DAYLIGHT.size.eyebrow,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: C.darkMuted,
    flexShrink: 1,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginTop: 14,
  },
  bigNumber: {
    fontSize: DS_DAYLIGHT.size.streakMomentNumber,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    letterSpacing: -3,
    color: C.darkText,
    lineHeight: 76,
  },
  daysLabel: {
    fontSize: DS_DAYLIGHT.size.cardTitle,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: C.darkFaint,
  },
  message: {
    fontSize: DS_DAYLIGHT.size.title,
    fontWeight: DS_DAYLIGHT.weight.regular,
    lineHeight: 25,
    color: C.darkBody,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 280,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 8,
  },
  shareError: {
    fontSize: DS_DAYLIGHT.size.meta,
    color: C.accent,
    textAlign: "center",
    marginBottom: 10,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 54,
    borderRadius: DS_DAYLIGHT.radius.buttonLg,
    backgroundColor: C.accent,
  },
  shareButtonText: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: C.white,
  },
  keepGoing: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    minHeight: 44,
  },
  keepGoingText: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: C.darkFaint,
  },
});
