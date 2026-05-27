/**
 * ProposalScreen — entry point for the new proposal-pattern create flow.
 *
 * Replaces `CreateWizardV2` as the `+` tab destination. Renders one curated
 * `ChallengePackDef` (selected by the deterministic proposal engine), with a
 * primary CTA that pushes to `CalendarPreviewScreen`.
 *
 * The user can tap refresh to regenerate (different seed / re-run rules), or
 * open `AlternativesDrawer` to swap to any pack from `CHALLENGE_PACKS`.
 *
 * Honest UX guardrails:
 *   - Diagnostic copy is conservative — see `lib/create-proposal-copy.ts`.
 *   - Social proof row is hidden when no joiners are available
 *     (we never seed fake users).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { RefreshCw, X } from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import {
  selectProposal,
  type ProposalInput,
  type ProposalOutput,
} from "@/lib/create-proposal";
import { headlineForReason } from "@/lib/create-proposal-copy";
import { CHALLENGE_PACKS, type ChallengePackDef } from "@/lib/challenge-packs";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";

import { useUserActivityHints } from "@/hooks/useUserActivityHints";
import { useCreateProposalStore } from "@/store/create-proposal-store";

import { AlternativesDrawer } from "./AlternativesDrawer";
import { WriteMyOwnSheet } from "./WriteMyOwnSheet";

const ROUTE_PREVIEW = "/create/preview" as const;

function badgeForPack(pack: ChallengePackDef): string {
  if (/75 hard/i.test(pack.name)) return "Hard";
  if (pack.taskCount >= 4) return "Hard";
  if (pack.taskCount === 3) return "Popular";
  return "Easy";
}

function estimatedMinutesForPack(pack: ChallengePackDef): number {
  return Math.max(5, pack.taskCount * 18);
}

function difficultyLabel(out: ProposalOutput): string {
  return out.difficulty === "hard" ? "Hard" : "Standard";
}

function fallbackSelectProposal(input: ProposalInput, salt: number): ProposalOutput {
  const base = selectProposal(input);
  if (salt === 0) return base;
  const ordered: ChallengePackDef[] = CHALLENGE_PACKS;
  const baseIdx = ordered.findIndex((p) => p.id === base.pack.id);
  const nextIdx = ((baseIdx >= 0 ? baseIdx : 0) + salt) % Math.max(1, ordered.length);
  const nextPack = ordered[nextIdx] ?? base.pack;
  return { ...base, pack: nextPack };
}

export function ProposalScreen() {
  const router = useRouter();
  const { hints, isLoading } = useUserActivityHints();
  const setProposalInStore = useCreateProposalStore((s) => s.setProposal);
  const proposalFromStore = useCreateProposalStore((s) => s.pack);

  const [salt, setSalt] = useState<number>(0);
  const [overridePack, setOverridePack] = useState<ChallengePackDef | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [writeOwnOpen, setWriteOwnOpen] = useState<boolean>(false);
  const lastViewedKey = useRef<string | null>(null);

  const proposal = useMemo<ProposalOutput | null>(() => {
    try {
      const base = fallbackSelectProposal(hints, salt);
      if (overridePack) {
        return { ...base, pack: overridePack };
      }
      return base;
    } catch (err) {
      captureError(err, "ProposalScreen.selectProposal");
      return null;
    }
  }, [hints, salt, overridePack]);

  useEffect(() => {
    if (!proposal) return;
    const key = `${proposal.pack.id}|${proposal.reason.kind}|${proposal.difficulty}`;
    if (lastViewedKey.current === key) return;
    lastViewedKey.current = key;
    trackEvent("create_proposal_viewed", {
      pack_id: proposal.pack.id,
      reason: proposal.reason.kind,
      difficulty: proposal.difficulty,
    });
  }, [proposal]);

  useEffect(() => {
    return () => {
      lastViewedKey.current = null;
    };
  }, []);

  const handleRegenerate = useCallback(() => {
    setOverridePack(null);
    setSalt((s) => s + 1);
    trackEvent("create_proposal_regenerated", { salt: salt + 1 });
  }, [salt]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleAccept = useCallback(() => {
    if (!proposal) return;
    setProposalInStore({
      pack: proposal.pack,
      reason: proposal.reason,
      durationDays: proposal.durationDays,
      difficulty: proposal.difficulty,
    });
    router.push(ROUTE_PREVIEW as never);
  }, [proposal, router, setProposalInStore]);

  const handleOpenAlternatives = useCallback(() => {
    setDrawerOpen(true);
    trackEvent("create_alternative_opened", {
      from_pack_id: proposal?.pack.id ?? "unknown",
    });
  }, [proposal?.pack.id]);

  const handleSelectAlternative = useCallback(
    (next: ChallengePackDef) => {
      const fromPackId = proposal?.pack.id ?? "unknown";
      setOverridePack(next);
      setDrawerOpen(false);
      trackEvent("create_alternative_selected", {
        from_pack_id: fromPackId,
        to_pack_id: next.id,
      });
    },
    [proposal?.pack.id]
  );

  const handleOpenWriteMyOwn = useCallback(() => {
    setDrawerOpen(false);
    setWriteOwnOpen(true);
    trackEvent("create_custom_opened");
  }, []);

  if (!proposal && !isLoading) {
    return (
      <SafeAreaView style={styles.canvas} edges={["top", "bottom"]}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>No challenge packs available.</Text>
          <Text style={styles.errorSub}>
            Try again later, or write your own challenge.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Write my own challenge"
            style={styles.primaryBtn}
            onPress={() => setWriteOwnOpen(true)}
          >
            <Text style={styles.primaryBtnText}>Write my own</Text>
          </Pressable>
        </View>
        <WriteMyOwnSheet
          visible={writeOwnOpen}
          onClose={() => setWriteOwnOpen(false)}
        />
      </SafeAreaView>
    );
  }

  if (!proposal) {
    return (
      <SafeAreaView style={styles.canvas} edges={["top", "bottom"]}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorSub}>Loading your challenge…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const headline = headlineForReason(proposal.reason);
  const badge = badgeForPack(proposal.pack);
  const minutesPerDay = estimatedMinutesForPack(proposal.pack);
  const isFromStore = proposalFromStore?.id === proposal.pack.id;

  return (
    <SafeAreaView style={styles.canvas} edges={["top", "bottom"]}>
      <View style={styles.headerBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close create"
          hitSlop={12}
          onPress={handleClose}
          style={styles.headerBtn}
        >
          <X size={22} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Regenerate proposal"
          hitSlop={12}
          onPress={handleRegenerate}
          style={styles.headerBtn}
        >
          <RefreshCw size={20} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>{headline.eyebrow.toUpperCase()}</Text>
        <Text style={styles.headline}>{headline.line}</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{badge.toUpperCase()}</Text>
            </View>
            <Text style={styles.heroEmoji}>{proposal.pack.emoji}</Text>
          </View>

          <Text style={styles.heroTitle}>{proposal.pack.name}</Text>
          <Text style={styles.heroMeta}>
            {`${proposal.pack.taskCount} daily tasks · ~${minutesPerDay} min/day · ${difficultyLabel(proposal)}`}
          </Text>

          <View style={styles.taskList}>
            {proposal.pack.tasks.map((task, idx) => (
              <View key={`${task.name}-${idx}`} style={styles.taskRow}>
                <Text style={styles.taskNumber}>{`${idx + 1}.`}</Text>
                <Text style={styles.taskTitle}>{task.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {isFromStore ? (
          <Text style={styles.helperLine}>
            Updated. Tap below to lock it in.
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="I'm in. Show me Day 1"
          onPress={handleAccept}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.primaryBtnText}>I&apos;m in — show me Day 1</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See alternative packs"
          onPress={handleOpenAlternatives}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>
            Not feeling this one? See alternatives
          </Text>
        </Pressable>
      </View>

      <AlternativesDrawer
        visible={drawerOpen}
        currentPackId={proposal.pack.id}
        onSelect={handleSelectAlternative}
        onOpenWriteMyOwn={handleOpenWriteMyOwn}
        onClose={() => setDrawerOpen(false)}
      />
      <WriteMyOwnSheet
        visible={writeOwnOpen}
        onClose={() => setWriteOwnOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: DS_COLORS_V2.surface.canvas,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.xs,
    paddingBottom: DS_SPACING_V2.xs,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingBottom: DS_SPACING_V2.lg,
    gap: DS_SPACING_V2.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.44,
    color: DS_COLORS_V2.text.secondary,
    marginTop: DS_SPACING_V2.xs,
  },
  headline: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.4,
  },
  heroCard: {
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.lg,
    borderRadius: DS_RADIUS_V2.xl,
    backgroundColor: DS_COLORS_V2.surface.heroNeutral,
    gap: DS_SPACING_V2.sm,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.44,
    color: DS_COLORS_V2.text.onDark,
  },
  heroEmoji: {
    fontSize: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    letterSpacing: -0.4,
  },
  heroMeta: {
    fontSize: 13,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },
  taskList: {
    marginTop: DS_SPACING_V2.xs,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING_V2.sm,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.sm,
    borderTopWidth: 1.5,
    borderTopColor: DS_COLORS_V2.surface.dividerDark,
  },
  taskNumber: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDarkSecondary,
    width: 24,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    color: DS_COLORS_V2.text.onDark,
  },
  helperLine: {
    fontSize: 13,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
    marginTop: DS_SPACING_V2.xs,
  },
  footer: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.xs,
  },
  primaryBtn: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    paddingVertical: 16,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: DS_COLORS_V2.brand.primaryText,
    fontSize: 16,
    fontWeight: "500",
  },
  pressed: { opacity: 0.85 },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: DS_COLORS_V2.text.secondary,
    fontSize: 13,
    fontWeight: "500",
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DS_SPACING_V2.lg,
    gap: DS_SPACING_V2.sm,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  errorSub: {
    fontSize: 13,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
});

export default ProposalScreen;
