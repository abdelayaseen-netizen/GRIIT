import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/constants/onboarding-theme";
import { DS_MEASURES, DS_RADIUS } from "@/lib/design-system";
import { useOnboardingStore } from "@/store/onboardingStore";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { supabase } from "@/lib/supabase";
import { track } from "@/lib/analytics";

interface AutoSuggestChallengeScreenProps {
  onJoinComplete: () => void;
  onBrowseMore: () => void;
}

type ChallengeItem = {
  id: string;
  title?: string;
  description?: string | null;
  short_hook?: string;
  duration_days?: number;
  tasks?: { length?: number };
};

const FALLBACK_CHALLENGES: ChallengeItem[] = [
  {
    id: "fallback-cold-7",
    title: "7-Day Cold Shower",
    short_hook: "Cold water every morning. Build mental toughness.",
    duration_days: 7,
  },
  {
    id: "fallback-discipline-14",
    title: "14-Day Discipline Starter",
    short_hook: "The essential habits. 14 days to build the foundation.",
    duration_days: 14,
  },
];

function hookText(c: ChallengeItem): string {
  if (c.short_hook) return c.short_hook;
  const d = c.description;
  if (typeof d === "string" && d.length > 0) return d.length > 140 ? `${d.slice(0, 137)}…` : d;
  return "Structured daily tasks. Prove it.";
}

export default function AutoSuggestChallengeScreen({
  onJoinComplete,
  onBrowseMore,
}: AutoSuggestChallengeScreenProps) {
  useOnboardingStore();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const list = Array.isArray(data) ? (data as ChallengeItem[]) : [];
        const items = list.slice(0, 2);
        if (!cancelled) {
          setChallenges(items.length > 0 ? items : FALLBACK_CHALLENGES);
          const first = items[0];
          if (first) {
            track({
              name: "onboarding_challenge_auto_suggested",
              challenge_id: first.id,
              challenge_name: first.title ?? "",
            });
          }
        }
      } catch {
        if (!cancelled) setChallenges(FALLBACK_CHALLENGES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setOnboardingCompleteAndContinue = async (next: () => void) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
    } catch {
      /* best-effort */
    }
    next();
  };

  const handleJoin = async (challengeId: string) => {
    if (challengeId.startsWith("fallback-")) {
      track({ name: "onboarding_challenge_skipped" });
      await setOnboardingCompleteAndContinue(onBrowseMore);
      return;
    }
    setJoiningId(challengeId);
    setError("");
    try {
      await trpcMutate(TRPC.challenges.join, { challengeId });
      track({ name: "onboarding_challenge_joined", challenge_id: challengeId });
      await setOnboardingCompleteAndContinue(onJoinComplete);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not join. Try again.");
    } finally {
      setJoiningId(null);
    }
  };

  const handleBrowseMore = () => {
    track({ name: "onboarding_challenge_skipped" });
    void setOnboardingCompleteAndContinue(onBrowseMore);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.coral} />
        <Text style={styles.loadingText}>Finding challenges for you...</Text>
      </View>
    );
  }

  const [first, second] = challenges;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 4 OF 4</Text>
        <Text style={styles.title}>Your first challenge</Text>
        <Text style={styles.subtitle}>Pick one to start — you can always join more later.</Text>
      </View>

      {first ? (
        <View style={[styles.card, styles.cardPrimary]}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgePopular}>POPULAR</Text>
          </View>
          <Text style={styles.cardTitle}>{first.title ?? "Challenge"}</Text>
          <Text style={styles.cardHook}>{hookText(first)}</Text>
          <View style={styles.metaRow}>
            {first.duration_days != null ? (
              <Text style={styles.metaPill}>{first.duration_days} days</Text>
            ) : null}
            {first.tasks != null && typeof first.tasks.length === "number" ? (
              <Text style={styles.metaPill}>{first.tasks.length} tasks/day</Text>
            ) : null}
          </View>
          <Pressable
            style={[styles.orangeCta, joiningId !== null && styles.ctaDisabled]}
            onPress={() => handleJoin(first.id)}
            disabled={joiningId !== null}
            accessibilityLabel={`Join ${first.title ?? "challenge"}`}
            accessibilityRole="button"
          >
            {joiningId === first.id ? (
              <ActivityIndicator color={C.WHITE} />
            ) : (
              <Text style={styles.orangeCtaText}>Join challenge</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {second ? (
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeStarter}>STARTER</Text>
          </View>
          <Text style={styles.cardTitle}>{second.title ?? "Challenge"}</Text>
          <Text style={styles.cardHook}>{hookText(second)}</Text>
          <View style={styles.metaRow}>
            {second.duration_days != null ? (
              <Text style={styles.metaPill}>{second.duration_days} days</Text>
            ) : null}
            {second.tasks != null && typeof second.tasks.length === "number" ? (
              <Text style={styles.metaPill}>{second.tasks.length} tasks/day</Text>
            ) : null}
          </View>
          <Pressable
            style={[styles.outlineCta, joiningId !== null && styles.ctaDisabled]}
            onPress={() => handleJoin(second.id)}
            disabled={joiningId !== null}
            accessibilityLabel={`Join ${second.title ?? "challenge"}`}
            accessibilityRole="button"
          >
            {joiningId === second.id ? (
              <ActivityIndicator color={C.textSecondary} />
            ) : (
              <Text style={styles.outlineCtaText}>Join</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      <View style={styles.inlineRow}>
        <Pressable onPress={handleBrowseMore} accessibilityRole="link" accessibilityLabel="Browse all challenges">
          <Text style={styles.linkCoral}>Browse all</Text>
        </Pressable>
        <Text style={styles.inlineOr}> or </Text>
        <Pressable onPress={handleBrowseMore} accessibilityRole="link" accessibilityLabel="Skip for now">
          <Text style={styles.linkMuted}>skip for now</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={handleBrowseMore} accessibilityRole="button">
            <Text style={styles.errorLink}>Continue to app</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: S.screenPadding, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.background, gap: 16 },
  loadingText: { fontSize: 14, color: C.textSecondary },
  header: { marginBottom: 20 },
  stepLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, lineHeight: 16, color: C.accent, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, lineHeight: 34, color: C.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, fontWeight: "400", lineHeight: 24, color: C.textSecondary },
  card: {
    backgroundColor: C.WHITE,
    borderRadius: DS_RADIUS.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
  },
  cardPrimary: { borderColor: C.border },
  badgeRow: { marginBottom: 8 },
  badgePopular: {
    alignSelf: "flex-start",
    fontSize: 9,
    fontWeight: "600",
    overflow: "hidden",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: C.badgePopularBg,
    color: C.badgePopularText,
  },
  badgeStarter: {
    alignSelf: "flex-start",
    fontSize: 9,
    fontWeight: "600",
    overflow: "hidden",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: C.badgeStarterBg,
    color: C.badgeStarterText,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", letterSpacing: -0.2, color: C.textPrimary, marginBottom: 6 },
  cardHook: { fontSize: 13, fontWeight: "400", lineHeight: 20, color: C.textSecondary, marginBottom: 10 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  metaPill: {
    backgroundColor: C.metaPillBg,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: "500",
    color: C.textSecondary,
    overflow: "hidden",
  },
  orangeCta: {
    backgroundColor: C.coral,
    height: DS_MEASURES.CTA_HEIGHT_COMPACT,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
  },
  orangeCtaText: { fontSize: 17, fontWeight: "700", color: C.WHITE },
  outlineCta: {
    height: DS_MEASURES.CTA_HEIGHT_COMPACT,
    borderRadius: DS_RADIUS.button,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  outlineCtaText: { fontSize: 17, fontWeight: "600", color: C.textSecondary },
  ctaDisabled: { opacity: 0.7 },
  inlineRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginTop: 8 },
  linkCoral: { fontSize: 15, fontWeight: "700", color: C.coral },
  inlineOr: { fontSize: 15, color: C.textSecondary },
  linkMuted: { fontSize: 15, color: C.textSecondary },
  errorBlock: { marginTop: 16, alignItems: "center", gap: 8 },
  errorText: { fontSize: 13, color: C.accent, textAlign: "center" },
  errorLink: { fontSize: 15, fontWeight: "600", color: C.coral },
});
