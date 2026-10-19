import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SearchX } from "lucide-react-native";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  suggestChallengesForGoals,
  type SuggestableChallenge,
} from "@/lib/onboarding-v2-suggest";
import { mergePickedIntoSuggestions } from "@/lib/onboarding-v2-browse";
import { joinFirstChallenge } from "@/lib/onboarding-v2-join";
import { participationLabel, suggestionTaskLine } from "@/lib/onboarding-v2-first-challenge";
import { FREEZE_LINE, START_HERE_COPY, orderStartHere } from "@/lib/first-day";
import { GOAL_LABELS } from "@/lib/goal-challenge-map";
import Button from "@/components/ds/Button";
import { captureError } from "@/lib/sentry";
import { DS_V3 } from "@/lib/design-system";
import { formatDays } from "@/lib/format-days";
import Card from "@/components/ds/Card";
import { ChromePrimary, OnboardingScreen, TextLink } from "../OnboardingChrome";

const PT = DS_V3.space.xs / 4;
const CARD_PAD_X = DS_V3.space.md + DS_V3.space.xs / 2;
const ICON = DS_V3.space.xs * 6;

/** Build 92 09.2 (P3-04, P3-05): each card joins on its own; no radio, no shared footer Join. */
function SuggestionCard({
  challenge,
  startsTomorrow,
  joining,
  disabled,
  onJoin,
}: {
  challenge: SuggestableChallenge;
  startsTomorrow: string | null;
  joining: boolean;
  disabled: boolean;
  onJoin: () => void;
}) {
  const tasks = Array.isArray(challenge.tasks) ? challenge.tasks : [];
  const lines = tasks.map((t) => suggestionTaskLine(t));
  const participation = participationLabel(challenge.participation_type);
  const days = challenge.duration_days ?? 0;
  const title = challenge.title ?? "Challenge";
  return (
    <View style={styles.card} testID={`start-here-card-${challenge.id}`}>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{`${formatDays(days)} · ${participation}`}</Text>
      </View>
      <View style={styles.taskList}>
        {lines.map((line) => (
          <View key={line.name} style={styles.taskRow}>
            <Text style={styles.taskName}>{line.name}</Text>
            <Text style={styles.taskGate}>{line.gate}</Text>
          </View>
        ))}
      </View>
      {startsTomorrow ? <Text style={styles.tomorrow}>{startsTomorrow}</Text> : null}
      <Button
        label={joining ? START_HERE_COPY.joining : START_HERE_COPY.join}
        accessibilityLabel={`${START_HERE_COPY.join} ${title}`}
        size="small"
        disabled={disabled}
        onPress={onJoin}
        testID={`start-here-join-${challenge.id}`}
      />
    </View>
  );
}

export default function FirstChallengeScreen({
  onJoined,
  onSkip,
  onBrowse,
  onBack,
}: {
  /** Joined: open the first task (`href`), or Home when Day 1 is tomorrow. */
  onJoined: (challengeId: string, href: string | null, startsTomorrow: boolean) => void;
  onSkip: () => void;
  onBrowse: () => void;
  onBack: () => void;
}) {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  const selectedChallengeId = useOnboardingStore((s) => s.selectedChallengeId);
  const targetStreak = useOnboardingStore((s) => s.targetStreak);
  const setSelectedChallengeMeta = useOnboardingStore((s) => s.setSelectedChallengeMeta);
  const [catalog, setCatalog] = useState<SuggestableChallenge[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestableChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const list = Array.isArray(data) ? (data as SuggestableChallenge[]) : [];
        if (!cancelled) {
          setCatalog(list);
          setSuggestions(suggestChallengesForGoals(selectedGoals, list, 3, targetStreak));
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
  }, [selectedGoals, targetStreak]);

  const cards = useMemo(
    () => orderStartHere(mergePickedIntoSuggestions(suggestions, catalog, selectedChallengeId)),
    [suggestions, catalog, selectedChallengeId]
  );
  const empty = !loading && suggestions.length === 0;
  const firstGoal = selectedGoals[0] ? GOAL_LABELS[selectedGoals[0]] : "your goals";

  const handleJoin = async (c: SuggestableChallenge, startsTomorrow: boolean) => {
    if (joiningId) return;
    setError("");
    setJoiningId(c.id);
    setSelectedChallengeMeta({
      id: c.id,
      title: c.title ?? null,
      taskCount: Array.isArray(c.tasks) ? c.tasks.length : 0,
      durationDays: c.duration_days ?? null,
    });
    try {
      const result = await joinFirstChallenge(c.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onJoined(c.id, startsTomorrow ? null : result.href, startsTomorrow);
    } catch (e) {
      captureError(e, "OnboardingV2Join");
      setError(e instanceof Error ? e.message : "Could not join. Try again.");
    } finally {
      setJoiningId(null);
    }
  };

  const footer = (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {empty ? <ChromePrimary label={START_HERE_COPY.browseAll} onPress={onBrowse} /> : null}
      <View style={styles.footerRow}>
        {empty ? null : (
          <View style={styles.footerHalf}>
            <TextLink label={START_HERE_COPY.browse} onPress={onBrowse} />
          </View>
        )}
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
      title={START_HERE_COPY.title}
      subtitle={empty ? START_HERE_COPY.empty(firstGoal) : START_HERE_COPY.subtitle}
      footer={footer}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={DS_V3.color.textSecondary} />
        </View>
      ) : empty ? (
        <View style={styles.emptyWrap}>
          <Card>
            <View style={styles.emptyRow}>
              <SearchX size={ICON} color={DS_V3.color.textPrimary} />
              <Text style={styles.emptyBody}>{START_HERE_COPY.empty(firstGoal)}</Text>
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.list}>
          {cards.map(({ challenge, startsTomorrow }) => (
            <SuggestionCard
              key={challenge.id}
              challenge={challenge}
              startsTomorrow={startsTomorrow}
              joining={joiningId === challenge.id}
              disabled={joiningId != null}
              onJoin={() => void handleJoin(challenge, startsTomorrow != null)}
            />
          ))}
          <Text style={styles.freeze}>{FREEZE_LINE}</Text>
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
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
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
  tomorrow: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: "600",
    color: DS_V3.color.textPrimary,
  },
  freeze: {
    paddingTop: DS_V3.space.sm,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
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
