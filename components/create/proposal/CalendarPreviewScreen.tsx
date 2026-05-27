/**
 * CalendarPreviewScreen — second screen of the proposal flow.
 *
 * Shows a 7-column calendar grid for the chosen duration, an honest "what
 * changes by tomorrow" contract panel, and an inline Strava connection prompt
 * when the proposed pack requires Strava verification.
 *
 * Lock-in calls `challenges.create` and routes to the active challenge on
 * success. Errors render inline only — no native popup alerts.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import {
  CheckCircle2,
  ChevronLeft,
  Lock,
  Share2,
  Zap,
} from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { TRPC } from "@/lib/trpc-paths";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { trackEvent } from "@/lib/analytics";
import { captureError } from "@/lib/sentry";
import { packRequiresStrava } from "@/lib/pack-requires-strava";
import { buildCreatePayload } from "@/lib/build-create-payload";

import { useCreateProposalStore } from "@/store/create-proposal-store";

import { AdjustSheet } from "./AdjustSheet";

type StravaConnection = {
  id: string;
  provider: string;
  providerUserId: string | null;
  metadata?: Record<string, unknown> | null;
} | null;

type StravaAuthUrlResult = { url: string; state: string };

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatShortDate(d: Date): string {
  const m = SHORT_MONTHS[d.getMonth()] ?? "—";
  return `${m} ${d.getDate()}`;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarCells(start: Date, durationDays: number): Date[] {
  const cells: Date[] = [];
  for (let i = 0; i < durationDays; i++) {
    cells.push(addDays(start, i));
  }
  return cells;
}

function strangerHandle(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata) return null;
  const candidate =
    (typeof metadata.username === "string" && metadata.username.trim()) ||
    (typeof metadata.athlete_username === "string" && metadata.athlete_username.trim()) ||
    (typeof metadata.firstname === "string" && metadata.firstname.trim());
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

export function CalendarPreviewScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const pack = useCreateProposalStore((s) => s.pack);
  const duration = useCreateProposalStore((s) => s.durationDays);
  const difficulty = useCreateProposalStore((s) => s.difficulty);
  const photoProof = useCreateProposalStore((s) => s.photoProof);
  const who = useCreateProposalStore((s) => s.who);
  const category = useCreateProposalStore((s) => s.category);

  const [adjustOpen, setAdjustOpen] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stravaError, setStravaError] = useState<string>("");
  const [stravaPromptTracked, setStravaPromptTracked] = useState<boolean>(false);

  const stravaRequired = useMemo(() => {
    if (!pack) return false;
    return packRequiresStrava(pack);
  }, [pack]);

  const stravaConnectionQuery = useQuery<StravaConnection>({
    queryKey: ["integrations", "strava-connection"],
    queryFn: () => trpcQuery<StravaConnection>(TRPC.integrations.getStravaConnection),
    enabled: stravaRequired,
    staleTime: 60 * 1000,
    retry: 0,
  });

  const stravaConnected = !!stravaConnectionQuery.data?.providerUserId;

  useEffect(() => {
    if (!pack) return;
    trackEvent("create_preview_viewed", {
      pack_id: pack.id,
      duration,
      difficulty,
      strava_required: stravaRequired,
    });
  }, [pack, duration, difficulty, stravaRequired]);

  useEffect(() => {
    if (!stravaRequired || stravaPromptTracked) return;
    trackEvent("create_strava_prompt_shown", { pack_id: pack?.id ?? "unknown" });
    setStravaPromptTracked(true);
  }, [stravaRequired, stravaPromptTracked, pack?.id]);

  const tomorrow = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return addDays(t, 1);
  }, []);

  const finishDate = useMemo(() => addDays(tomorrow, duration - 1), [tomorrow, duration]);
  const monthRangeLabel = `${formatShortDate(tomorrow)} → ${formatShortDate(finishDate)}`;

  const calendarCells = useMemo(
    () => buildCalendarCells(tomorrow, duration),
    [tomorrow, duration]
  );

  const totalHours = useMemo(() => {
    if (!pack) return 0;
    const minutesPerDay = pack.taskCount * 18;
    return Math.max(1, Math.round((minutesPerDay * duration) / 60));
  }, [pack, duration]);

  const headlineLine = useMemo(() => {
    if (difficulty === "hard") {
      return `${duration} days, starting tomorrow. One miss restarts you.`;
    }
    return `${duration} days, starting tomorrow.`;
  }, [duration, difficulty]);

  const showsDietConstraint = useMemo(() => {
    if (!pack) return false;
    if (/75 hard/i.test(pack.name)) return true;
    return pack.tasks.some((t) => {
      const cfg = t.config as Record<string, unknown>;
      return cfg.require_camera_only === true;
    });
  }, [pack]);

  const reminderLine = useMemo(() => {
    if (!pack) return "3 reminders on your phone (6am, 12pm, 9pm).";
    const anchored = pack.tasks
      .map((t) => (t.config as Record<string, unknown>).routineAnchor)
      .filter((v): v is string => typeof v === "string" && v.length > 0);
    if (anchored.length > 0) {
      return `Reminders anchored to ${[...new Set(anchored)].join(", ").replace(/_/g, " ")}.`;
    }
    return "3 reminders on your phone (6am, 12pm, 9pm).";
  }, [pack]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(() => {
    if (!pack) return;
    Share.share({
      message: `I'm doing ${pack.name} for ${duration} days. Day 1 starts tomorrow.`,
    }).catch((err) => {
      captureError(err, "CalendarPreviewScreen.share");
    });
  }, [pack, duration]);

  const handleConnectStrava = useCallback(async () => {
    if (!pack) return;
    setStravaError("");
    trackEvent("create_strava_connect_tapped", { pack_id: pack.id });
    try {
      const result = await trpcQuery<StravaAuthUrlResult>(TRPC.integrations.getStravaAuthUrl);
      if (!result?.url) {
        setStravaError("Could not start Strava connection. Try again.");
        return;
      }
      await WebBrowser.openAuthSessionAsync(result.url);
      const refreshed = await queryClient.invalidateQueries({
        queryKey: ["integrations", "strava-connection"],
      });
      void refreshed;
      const after = await stravaConnectionQuery.refetch();
      if (after.data?.providerUserId) {
        trackEvent("create_strava_connected", { pack_id: pack.id });
      } else {
        setStravaError(
          "Connection didn't complete. Try again or skip — you can connect later in Settings."
        );
      }
    } catch (err) {
      captureError(err, "CalendarPreviewScreen.connectStrava");
      setStravaError(
        "Connection didn't complete. Try again or skip — you can connect later in Settings."
      );
    }
  }, [pack, queryClient, stravaConnectionQuery]);

  const handleLockIn = useCallback(async () => {
    if (!pack || busy) return;
    setError("");
    setBusy(true);
    trackEvent("create_lockin_tapped", {
      pack_id: pack.id,
      duration,
      difficulty,
      strava_required: stravaRequired,
      strava_connected: stravaConnected,
    });
    try {
      const payload = buildCreatePayload({
        pack,
        durationDays: duration,
        difficulty,
        who,
        photoProof,
        category,
      });
      const result = (await trpcMutate(TRPC.challenges.create, payload)) as {
        id?: string;
      };
      if (!result?.id) throw new Error("Create returned no id.");
      trackEvent("create_launched", {
        challenge_id: result.id,
        pack_id: pack.id,
        duration,
        difficulty,
      });
      void queryClient.invalidateQueries({ queryKey: ["home"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["discover"] });
      router.replace(ROUTES.CHALLENGE_ACTIVE(result.id) as never);
    } catch (err) {
      captureError(err, "CalendarPreviewScreen.lockIn");
      const msg = err instanceof Error ? err.message : "Could not lock in. Try again.";
      setError(msg);
      trackEvent("create_lockin_failed", { error_message: msg });
    } finally {
      setBusy(false);
    }
  }, [
    pack,
    busy,
    duration,
    difficulty,
    stravaRequired,
    stravaConnected,
    who,
    photoProof,
    category,
    queryClient,
    router,
  ]);

  if (!pack) {
    return (
      <SafeAreaView style={styles.canvas} edges={["top", "bottom"]}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>No proposal selected.</Text>
          <Text style={styles.errorSub}>Go back and pick one.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const lockInLabel =
    stravaRequired && !stravaConnected
      ? "Lock it in (Strava connects after)"
      : "Lock it in";

  const stravaHandle = strangerHandle(stravaConnectionQuery.data?.metadata);

  return (
    <SafeAreaView style={styles.canvas} edges={["top", "bottom"]}>
      <View style={styles.headerBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to proposal"
          hitSlop={12}
          onPress={handleBack}
          style={styles.headerBtn}
        >
          <ChevronLeft size={22} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share"
          hitSlop={12}
          onPress={handleShare}
          style={styles.headerBtn}
        >
          <Share2 size={20} color={DS_COLORS_V2.text.primary} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>HERE&apos;S WHAT YOU&apos;RE SIGNING UP FOR</Text>
        <Text style={styles.headline}>{headlineLine}</Text>

        <View style={styles.calendarCard}>
          <Text style={styles.monthLabel}>{monthRangeLabel}</Text>
          <View style={styles.grid}>
            {calendarCells.map((d, idx) => {
              const isFirst = isSameDay(d, tomorrow);
              const isLast = isSameDay(d, finishDate);
              return (
                <View
                  key={d.toISOString()}
                  style={[
                    styles.cell,
                    isFirst ? styles.cellFirst : null,
                    isLast && !isFirst ? styles.cellLast : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isFirst ? styles.cellTextFirst : null,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.statStrip}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{duration}</Text>
              <Text style={styles.statLabel}>DAYS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{`~${totalHours}`}</Text>
              <Text style={styles.statLabel}>HOURS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statValueSmall}>{formatShortDate(finishDate)}</Text>
              <Text style={styles.statLabel}>FINISH BY</Text>
            </View>
          </View>
        </View>

        <View style={styles.contractCard}>
          <Text style={styles.contractTitle}>By tomorrow, here&apos;s what changes</Text>
          <View style={styles.contractRow}>
            <Zap size={14} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />
            <Text style={styles.contractText}>{reminderLine}</Text>
          </View>
          <View style={styles.contractRow}>
            <Zap size={14} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />
            <Text style={styles.contractText}>
              Your streak starts at 0. One missed day = restart.
            </Text>
          </View>
          {showsDietConstraint ? (
            <View style={styles.contractRow}>
              <Zap size={14} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />
              <Text style={styles.contractText}>
                No alcohol, no cheat meals. Yes, that&apos;s part of it.
              </Text>
            </View>
          ) : null}
        </View>

        {stravaRequired ? (
          <View style={styles.stravaCard}>
            <Text style={styles.stravaTitle}>Connect Strava to verify runs</Text>
            <Text style={styles.stravaSub}>
              This challenge auto-verifies workouts via Strava.
            </Text>
            {stravaConnected ? (
              <View style={styles.stravaConnectedRow}>
                <CheckCircle2
                  size={16}
                  color={DS_COLORS_V2.semantic.success}
                  strokeWidth={2}
                />
                <Text style={styles.stravaConnectedText}>
                  {stravaHandle ? `Connected as @${stravaHandle}` : "Strava connected"}
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Connect Strava"
                onPress={handleConnectStrava}
                style={styles.stravaConnectBtn}
              >
                <Text style={styles.stravaConnectBtnText}>Connect Strava</Text>
              </Pressable>
            )}
            {stravaError ? (
              <Text style={styles.stravaErrorText}>{stravaError}</Text>
            ) : null}
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lockInLabel}
          accessibilityState={{ disabled: busy }}
          onPress={handleLockIn}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed ? styles.pressed : null,
            busy ? styles.primaryBtnBusy : null,
          ]}
        >
          <Lock size={16} color={DS_COLORS_V2.brand.primaryText} strokeWidth={2} />
          <Text style={styles.primaryBtnText}>{busy ? "Locking in…" : lockInLabel}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adjust before commit"
          onPress={() => setAdjustOpen(true)}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryBtnText}>Adjust before I commit</Text>
        </Pressable>
      </View>

      <AdjustSheet visible={adjustOpen} onClose={() => setAdjustOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
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
  calendarCard: {
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.md,
    borderRadius: DS_RADIUS_V2.xl,
    backgroundColor: DS_COLORS_V2.surface.heroNeutral,
    gap: DS_SPACING_V2.sm,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDarkSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cell: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface04,
    alignItems: "center",
    justifyContent: "center",
  },
  cellFirst: {
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  cellLast: {
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.brand.primaryOnDark,
  },
  cellText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDarkSecondary,
  },
  cellTextFirst: {
    color: DS_COLORS_V2.brand.primaryText,
  },
  statStrip: {
    marginTop: DS_SPACING_V2.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface05,
    borderRadius: DS_RADIUS_V2.md,
    paddingVertical: DS_SPACING_V2.sm,
  },
  statCell: { flex: 1, alignItems: "center", gap: 2 },
  statValue: {
    fontSize: 20,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  statValueSmall: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: DS_COLORS_V2.overlay.onDarkBorder08,
  },
  contractCard: {
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.md,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.surface.card,
    gap: DS_SPACING_V2.xs,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  contractTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  contractRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_SPACING_V2.xs,
  },
  contractText: {
    flex: 1,
    fontSize: 13,
    color: DS_COLORS_V2.text.primary,
    lineHeight: 18,
  },
  stravaCard: {
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.md,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.brand.primary,
    gap: DS_SPACING_V2.xs,
  },
  stravaTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  stravaSub: {
    fontSize: 13,
    color: DS_COLORS_V2.text.primary,
  },
  stravaConnectBtn: {
    marginTop: DS_SPACING_V2.xs,
    backgroundColor: DS_COLORS_V2.brand.primary,
    paddingVertical: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
  },
  stravaConnectBtnText: {
    color: DS_COLORS_V2.brand.primaryText,
    fontSize: 14,
    fontWeight: "500",
  },
  stravaConnectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.xs,
    marginTop: DS_SPACING_V2.xs,
  },
  stravaConnectedText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.success,
  },
  stravaErrorText: {
    fontSize: 12,
    color: DS_COLORS_V2.semantic.danger,
    marginTop: DS_SPACING_V2.xxs,
  },
  errorCard: {
    marginTop: DS_SPACING_V2.sm,
    padding: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
  },
  errorCardText: {
    fontSize: 13,
    color: DS_COLORS_V2.semantic.danger,
  },
  footer: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: DS_SPACING_V2.md,
    gap: DS_SPACING_V2.xs,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING_V2.xs,
    backgroundColor: DS_COLORS_V2.brand.primary,
    paddingVertical: 16,
    borderRadius: DS_RADIUS_V2.md,
  },
  primaryBtnBusy: { opacity: 0.7 },
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

export default CalendarPreviewScreen;
