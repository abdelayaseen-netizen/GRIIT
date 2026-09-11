import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Check, SearchX } from "lucide-react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import { suggestChallengesForGoals, type SuggestableChallenge } from "@/lib/onboarding-v2-suggest";
import { mergePickedIntoSuggestions } from "@/lib/onboarding-v2-browse";
import { joinFirstChallenge } from "@/lib/onboarding-v2-join";
import {
  modeLine,
  noMatchSubtitle,
  participationLabel,
  suggestionTaskLine,
} from "@/lib/onboarding-v2-first-challenge";
import { captureError } from "@/lib/sentry";
import { DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import Card from "@/components/ds/Card";
import { ChromePrimary, OnboardingScreen, TextLink } from "../OnboardingChrome";

const PT = DS_V3.space.xs / 4;
const PT_SELECTED = PT * 1.5;
const RADIO = DS_V3.space.xs * 5;
const CARD_PAD_X = DS_V3.space.md + DS_V3.space.xs / 2;
const ICON = DS_V3.space.xs * 6;

function SuggestionCard({
  challenge,
  selected,
  onPress,
}: {
  challenge: SuggestableChallenge;
  selected: boolean;
  onPress: () => void;
}) {
  const tasks = Array.isArray(challenge.tasks) ? challenge.tasks : [];
  const lines = tasks.map((t) => suggestionTaskLine(t));
  const participation = participationLabel(challenge.participation_type);
  const days = challenge.duration_days ?? 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={challenge.title ?? "Suggested challenge"}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.card, selected ? styles.cardOn : styles.cardOff, pressed && styles.pressed]}
    >
      <View style={styles.cardHead}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{challenge.title ?? "Challenge"}</Text>
          <Text style={styles.cardMeta}>{`${formatDays(days)} · ${participation}`}</Text>
        </View>
        {selected ? (
          <Check size={RADIO} color={DS_V3.color.brandText} />
        ) : (
          <View style={styles.radioOff} />
        )}
      </View>
      <View style={styles.taskList}>
        {lines.map((line) => (
          <View key={line.name} style={styles.taskRow}>
            <Text style={styles.taskName}>{line.name}</Text>
            <Text style={styles.taskGate}>{line.gate}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.mode}>{modeLine(challenge.is_hard_mode === true)}</Text>
    </Pressable>
  );
}

export default function FirstChallengeScreen({
  onJoin,
  onSkip,
  onBrowse,
  onBack,
}: {
  onJoin: (challengeId: string) => void;
  onSkip: () => void;
  onBrowse: () => void;
  onBack: () => void;
}) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const setSelectedChallengeMeta = useOnboardingStore((s) => s.setSelectedChallengeMeta);
  const [catalog, setCatalog] = useState<SuggestableChallenge[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestableChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedId, setPickedId] = useState<string | null>(selectedChallengeId);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const list = Array.isArray(data) ? (data as SuggestableChallenge[]) : [];
        if (!cancelled) {
          setCatalog(list);
          setSuggestions(suggestChallengesForGoals(selectedGoals, list, 3));
        }
      } catch {
        if (!cancelled) {
          setCatalog([]);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedGoals]);

  useEffect(() => {
    if (selectedChallengeId) setPickedId(selectedChallengeId);
  }, [selectedChallengeId]);

  const cards = useMemo(
    () => mergePickedIntoSuggestions(suggestions, catalog, pickedId),
    [suggestions, catalog, pickedId]
  );
  const empty = !loading && suggestions.length === 0;

  const pick = (c: SuggestableChallenge) => {
    setPickedId(c.id);
    setError("");
    setSelectedChallengeMeta({
      id: c.id,
      title: c.title ?? null,
      taskCount: Array.isArray(c.tasks) ? c.tasks.length : 0,
      durationDays: c.duration_days ?? null,
    });
  };

  const handleJoin = async () => {
    if (!pickedId || joining) return;
    setError("");
    setJoining(true);
    try {
      const result = await joinFirstChallenge(pickedId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onJoin(pickedId);
    } catch (e) {
      captureError(e, "OnboardingV2Join");
      setError(e instanceof Error ? e.message : "Could not join. Try again.");
    } finally {
      setJoining(false);
    }
  };

  const footer = empty ? (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ChromePrimary label="Browse all" onPress={onBrowse} />
      <TextLink label="Set this up later" onPress={onSkip} />
    </>
  ) : (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ChromePrimary
        label={joining ? "Joining…" : "Join"}
        disabled={!pickedId || joining}
        onPress={() => {
          void handleJoin();
        }}
      />
      <Text style={styles.today}>Day 1 is today.</Text>
      <View style={styles.footerRow}>
        <View style={styles.footerHalf}>
          <TextLink label="Browse all" onPress={onBrowse} />
        </View>
        <View style={styles.footerHalf}>
          <TextLink label="Set this up later" onPress={onSkip} />
        </View>
      </View>
    </>
  );

  return (
    <OnboardingScreen
      step={4}
      onBack={onBack}
      title="Start here."
      subtitle={empty ? noMatchSubtitle(selectedGoals) : "Three that match your goals."}
      footer={footer}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={DS_V3.color.brand} />
        </View>
      ) : empty ? (
        <View style={styles.emptyWrap}>
          <Card>
            <View style={styles.emptyRow}>
              <SearchX size={ICON} color={DS_V3.color.textPrimary} />
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>No suggestions for those goals</Text>
                <Text style={styles.emptyBody}>
                  Browse the full catalogue, or start without one and join later from Discover.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.list}>
          {cards.map((c) => (
            <SuggestionCard
              key={c.id}
              challenge={c}
              selected={pickedId === c.id}
              onPress={() => pick(c)}
            />
          ))}
        </View>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingTop: DS_V3.space.section,
    alignItems: "center",
  },
  list: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    gap: DS_V3.space.xs,
  },
  card: {
    borderRadius: DS_V3.radius.card,
    paddingVertical: DS_V3.space.md,
    paddingHorizontal: CARD_PAD_X,
    gap: DS_V3.space.sm,
  },
  cardOff: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  cardOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderWidth: PT_SELECTED,
    borderColor: DS_V3.color.brand,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  cardMeta: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  radioOff: {
    width: RADIO,
    height: RADIO,
    borderRadius: DS_V3.radius.pill,
    borderWidth: PT_SELECTED,
    borderColor: DS_V3.color.textSecondary,
  },
  taskList: {
    gap: DS_V3.space.xs,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: DS_V3.space.md,
  },
  taskName: {
    flex: 1,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskGate: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "right",
  },
  mode: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  emptyWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.lg,
  },
  emptyCopy: {
    flex: 1,
    gap: DS_V3.space.xs,
  },
  emptyTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  emptyBody: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  today: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    minHeight: DS_V3.size.tap,
    gap: DS_V3.space.sm,
  },
  footerHalf: {
    flex: 1,
  },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
