/**
 * TaskShell — shared wrapper for every task-completion screen.
 *
 * Owns:
 *   - Top bar (back chevron + center column with Day N · challenge name + task name)
 *   - Optional verification gates card (hard-mode only)
 *   - Body slot (the type-specific renderer)
 *   - Primary CTA + optional secondary CTA + footer note
 *   - Missed-task state (Phase 5) — when present, hides body+CTA and renders the
 *     coaching layout (dark hero "TOMORROW'S PLAN" + other tasks list + dual CTAs).
 *
 * Body components do not render any of these — they're pure controlled bodies.
 */
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  X,
} from "lucide-react-native";

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

type TaskShellGateStatus = "pending" | "pass" | "fail";

export type TaskShellGates = {
  timeWindow?: { status: TaskShellGateStatus; detail: string };
  cameraOnly?: boolean;
  requireLocation?: boolean;
};

type TaskShellOtherTask = {
  id: string;
  name: string;
  proofType: string;
  remainingHint: string;
  onPress: () => void;
};

export type TaskShellMissedState = {
  reason: "time_window" | "camera_only" | "location";
  detail: string;
  currentStreak: number;
  otherTasks: TaskShellOtherTask[];
  nextWindow?: string;
  onSetAlarm: () => void;
  onPressDoOtherTasks?: () => void;
};

type TaskShellPrimaryCta = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
  variant?: "primary" | "danger";
};

type TaskShellSecondaryCta = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
};

export type TaskShellProps = {
  challengeName: string;
  dayNumber: number;
  taskName: string;
  hardMode: boolean;
  verificationGates?: TaskShellGates;
  onBack: () => void;
  children?: React.ReactNode;
  primaryCta?: TaskShellPrimaryCta;
  secondaryCta?: TaskShellSecondaryCta;
  footerNote?: string;
  /** When present, replaces body + CTA with the coaching missed-task layout. */
  missedState?: TaskShellMissedState;
  /** Inline error text (banner above CTA). Optional. */
  inlineError?: string | null;
  onDismissInlineError?: () => void;
  /**
   * Optional topline suffix after "Day {n} · ".
   * When omitted, keeps legacy `${challengeName.toUpperCase()}` (byte-identical).
   * Photo · Ready passes "Photo proof".
   */
  toplineMeta?: string;
  /** When true, hide the header task name (body owns the large title). */
  hideHeaderTaskName?: boolean;
  /**
   * Surface variant. Default `light` (byte-identical). Photo · Capture passes `dark`.
   */
  variant?: "light" | "dark";
};

export function TaskShell({
  challengeName,
  dayNumber,
  taskName,
  hardMode,
  verificationGates,
  onBack,
  children,
  primaryCta,
  secondaryCta,
  footerNote,
  missedState,
  inlineError,
  onDismissInlineError,
  toplineMeta,
  hideHeaderTaskName = false,
  variant = "light",
}: TaskShellProps) {
  const hasGates =
    !!verificationGates &&
    (!!verificationGates.timeWindow ||
      !!verificationGates.cameraOnly ||
      !!verificationGates.requireLocation);

  const toplineSuffix = toplineMeta ?? challengeName.toUpperCase();
  const isDark = variant === "dark";
  const chromeColor = isDark ? DS_COLORS_V2.text.onDark : DS_COLORS_V2.text.primary;
  const chromeMuted = isDark ? DS_COLORS_V2.text.onDarkSecondary : DS_COLORS_V2.text.secondary;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.safe, isDark ? styles.safeDark : null]}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={onBack}
          style={[styles.iconBtn, isDark ? styles.iconBtnDark : null]}
        >
          <ChevronLeft
            size={20}
            color={chromeColor}
            strokeWidth={2}
          />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={[styles.topBarTopline, { color: chromeMuted }]} numberOfLines={1}>
            {`Day ${dayNumber} · ${toplineSuffix}`}
          </Text>
          {hideHeaderTaskName ? null : (
            <Text style={[styles.topBarTitle, { color: chromeColor }]} numberOfLines={1}>
              {taskName}
            </Text>
          )}
        </View>
        <View style={styles.iconBtnSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {hardMode && hasGates ? (
          <GatesCard gates={verificationGates as TaskShellGates} missed={!!missedState} />
        ) : null}

        {missedState ? (
          <MissedStateView state={missedState} />
        ) : (
          <View style={styles.bodySlot}>{children}</View>
        )}
      </ScrollView>

      {inlineError ? (
        <Pressable
          onPress={onDismissInlineError}
          accessibilityRole="alert"
          accessibilityLabel={inlineError}
          style={styles.errorBanner}
        >
          <Text style={styles.errorText}>{inlineError}</Text>
          {onDismissInlineError ? (
            <X size={14} color={DS_COLORS_V2.semantic.danger} strokeWidth={2} />
          ) : null}
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        {missedState ? (
          <MissedStateCtas state={missedState} />
        ) : (
          <>
            {primaryCta ? <PrimaryCta cta={primaryCta} /> : null}
            {secondaryCta ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={secondaryCta.label}
                onPress={secondaryCta.onPress}
                style={({ pressed }) => [
                  styles.secondaryCta,
                  pressed ? styles.ctaPressed : null,
                ]}
              >
                {secondaryCta.icon}
                <Text style={styles.secondaryCtaText}>{secondaryCta.label}</Text>
              </Pressable>
            ) : null}
            {footerNote ? (
              <Text style={styles.footerNote} numberOfLines={2}>
                {footerNote}
              </Text>
            ) : null}
          </>
        )}
        {missedState?.nextWindow ? (
          <Text style={styles.footerNote}>
            {`Next window: ${missedState.nextWindow}`}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function PrimaryCta({ cta }: { cta: TaskShellPrimaryCta }) {
  const isDisabled = cta.disabled === true || cta.loading === true;
  const isDanger = cta.variant === "danger";
  const label = isDisabled && cta.disabledReason ? cta.disabledReason : cta.label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={cta.label}
      accessibilityState={{ disabled: isDisabled, busy: cta.loading }}
      onPress={isDisabled ? undefined : cta.onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.primaryCta,
        isDanger ? styles.primaryCtaDanger : null,
        isDisabled ? styles.primaryCtaDisabled : null,
        pressed && !isDisabled ? styles.ctaPressed : null,
      ]}
    >
      {cta.loading ? (
        <ActivityIndicator color={DS_COLORS_V2.brand.primaryText} />
      ) : (
        <Text
          style={[
            styles.primaryCtaText,
            isDisabled ? styles.primaryCtaTextDisabled : null,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function GatesCard({
  gates,
  missed,
}: {
  gates: TaskShellGates;
  missed: boolean;
}) {
  return (
    <View style={styles.gatesCard}>
      <Text style={styles.gatesTitle}>HARD MODE GATES</Text>
      {gates.timeWindow ? (
        <GateRow
          icon={
            <Clock
              size={14}
              color={
                gates.timeWindow.status === "pass"
                  ? DS_COLORS_V2.proof.gatePassFg
                  : gates.timeWindow.status === "fail" || missed
                    ? DS_COLORS_V2.proof.gateFailFg
                    : DS_COLORS_V2.proof.gatePendingFg
              }
              strokeWidth={2}
            />
          }
          label="Time window"
          detail={gates.timeWindow.detail}
          status={missed ? "fail" : gates.timeWindow.status}
        />
      ) : null}
      {gates.cameraOnly ? (
        <GateRow
          icon={
            <Camera
              size={14}
              color={DS_COLORS_V2.proof.gatePendingFg}
              strokeWidth={2}
            />
          }
          label="Camera only"
          detail="Photo library is blocked"
          status="pending"
        />
      ) : null}
      {gates.requireLocation ? (
        <GateRow
          icon={
            <MapPin
              size={14}
              color={DS_COLORS_V2.proof.gatePendingFg}
              strokeWidth={2}
            />
          }
          label="Location"
          detail="GPS needed at submit"
          status="pending"
        />
      ) : null}
    </View>
  );
}

function GateRow({
  icon,
  label,
  detail,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  status: TaskShellGateStatus;
}) {
  const bg =
    status === "pass"
      ? DS_COLORS_V2.proof.gatePassBg
      : status === "fail"
        ? DS_COLORS_V2.proof.gateFailBg
        : DS_COLORS_V2.proof.gatePendingBg;
  const fg =
    status === "pass"
      ? DS_COLORS_V2.proof.gatePassFg
      : status === "fail"
        ? DS_COLORS_V2.proof.gateFailFg
        : DS_COLORS_V2.proof.gatePendingFg;
  return (
    <View style={styles.gateRow}>
      <View style={[styles.gateIcon, { backgroundColor: bg }]}>
        {status === "pass" ? (
          <Check size={12} color={fg} strokeWidth={2.5} />
        ) : status === "fail" ? (
          <X size={12} color={fg} strokeWidth={2.5} />
        ) : (
          icon
        )}
      </View>
      <View style={styles.gateText}>
        <Text style={styles.gateLabel}>{label}</Text>
        <Text style={styles.gateDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function MissedStateView({ state }: { state: TaskShellMissedState }) {
  return (
    <View style={styles.missedWrap}>
      <View style={styles.missedHero}>
        <Text style={styles.missedHeroTopline}>{`TOMORROW'S PLAN`}</Text>
        <Text style={styles.missedHeroTitle}>
          You missed this window — your streak is still alive.
        </Text>
        <View style={styles.missedHeroFooter}>
          <Flame
            size={18}
            color={DS_COLORS_V2.brand.primaryOnDark}
            strokeWidth={2}
          />
          <Text style={styles.missedHeroFooterText} numberOfLines={2}>
            {`${state.currentStreak}-day streak still active · ${state.otherTasks.length} other task${state.otherTasks.length === 1 ? "" : "s"} today can secure it`}
          </Text>
        </View>
      </View>

      <View style={styles.otherTasksCard}>
        <Text style={styles.gatesTitle}>OTHER TASKS TODAY</Text>
        {state.otherTasks.length === 0 ? (
          <Text style={styles.gateDetail}>
            No other tasks today — focus on tomorrow.
          </Text>
        ) : (
          state.otherTasks.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${t.name}`}
              onPress={t.onPress}
              style={({ pressed }) => [
                styles.otherTaskRow,
                pressed ? styles.ctaPressed : null,
              ]}
            >
              <View style={styles.otherTaskRing} />
              <View style={styles.otherTaskBody}>
                <Text style={styles.otherTaskName} numberOfLines={1}>
                  {t.name}
                </Text>
                <Text style={styles.otherTaskMeta} numberOfLines={1}>
                  {`${t.proofType} · ${t.remainingHint}`}
                </Text>
              </View>
              <ChevronRight
                size={16}
                color={DS_COLORS_V2.text.tertiary}
                strokeWidth={2}
              />
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

function MissedStateCtas({ state }: { state: TaskShellMissedState }) {
  return (
    <>
      <PrimaryCta
        cta={{
          label: "Do other tasks",
          onPress: state.onPressDoOtherTasks ?? (() => undefined),
          disabled: state.otherTasks.length === 0,
          disabledReason: "No other tasks today",
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Set tomorrow's alarm"
        onPress={state.onSetAlarm}
        style={({ pressed }) => [
          styles.secondaryCta,
          pressed ? styles.ctaPressed : null,
        ]}
      >
        <Text style={styles.secondaryCtaText}>Set tomorrow&apos;s alarm</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas },
  safeDark: { backgroundColor: DS_COLORS_V2.surface.heroDark },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: 4,
    paddingBottom: 8,
    gap: DS_SPACING_V2.sm,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  iconBtnDark: {
    backgroundColor: DS_COLORS_V2.overlay.onDarkSurface10,
    borderColor: DS_COLORS_V2.overlay.onDarkBorder08,
  },
  iconBtnSpacer: { width: 32, height: 32 },
  topBarCenter: { flex: 1, alignItems: "center", gap: 2 },
  topBarTopline: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.1,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingBottom: DS_SPACING_V2.md,
  },
  bodySlot: { gap: DS_SPACING_V2.md },

  gatesCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    marginBottom: DS_SPACING_V2.md,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 10,
  },
  gatesTitle: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
    textTransform: "uppercase",
  },
  gateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.sm,
  },
  gateIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  gateText: { flex: 1, gap: 2 },
  gateLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  gateDetail: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: DS_SPACING_V2.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.semantic.dangerSoft,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.semantic.danger,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.semantic.danger,
  },

  footer: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: 4,
    gap: DS_SPACING_V2.sm,
  },
  primaryCta: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: DS_RADIUS_V2.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  primaryCtaDanger: { backgroundColor: DS_COLORS_V2.semantic.danger },
  primaryCtaDisabled: { backgroundColor: DS_COLORS_V2.surface.divider },
  primaryCtaText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
    letterSpacing: -0.1,
  },
  primaryCtaTextDisabled: { color: DS_COLORS_V2.text.tertiary },

  secondaryCta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  secondaryCtaText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  ctaPressed: { opacity: 0.85 },

  footerNote: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },

  missedWrap: { gap: DS_SPACING_V2.md },
  missedHero: {
    backgroundColor: DS_COLORS_V2.surface.heroDark,
    borderRadius: DS_RADIUS_V2.lg,
    padding: 16,
    gap: 10,
  },
  missedHeroTopline: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.streak.securedYellow,
    textTransform: "uppercase",
  },
  missedHeroTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS_V2.text.onDark,
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  missedHeroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  missedHeroFooterText: {
    flex: 1,
    fontSize: 12,
    color: DS_COLORS_V2.text.onDarkSecondary,
  },

  otherTasksCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 10,
  },
  otherTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  otherTaskRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  otherTaskBody: { flex: 1, gap: 2 },
  otherTaskName: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  otherTaskMeta: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
});

