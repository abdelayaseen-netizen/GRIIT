import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  type LayoutChangeEvent,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Bell, Target } from "lucide-react-native";
import { InlineError } from "@/components/InlineError";
import DailyQuote from "@/components/home/DailyQuote";
import { ActiveTaskCard } from "@/components/home/ActiveTaskCard";
import StreakHeroV3 from "@/components/home/StreakHeroV3";
import DailyBonus from "@/components/home/DailyBonusV2";
import WeekStrip from "@/components/home/WeekStrip";
import NextUnlock from "@/components/home/NextUnlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonHomeChallengeCard } from "@/components/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import SectionHeader from "@/components/shared/SectionHeader";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_SPACING_V2,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { FLAGS } from "@/lib/feature-flags";

export type HomeHeaderChallengeGoalGroup = {
  activeChallengeId: string;
  challengeId: string;
  challengeName: string;
  currentDay: number;
  durationDays: number;
  goals: { id: string; title: string; completed: boolean; taskType: string; taskConfig: string }[];
};

type RenderGroupItem = (info: { item: HomeHeaderChallengeGoalGroup; index: number }) => React.ReactElement | null;

type HomeHeaderProps = {
  leaveChallengeError: string | null;
  onClearLeaveChallengeError: () => void;
  greeting: string;
  firstName: string;
  onPressBell: () => void;

  streak: number;
  minutesRemaining: number;
  tasksRemaining: number;
  totalTasksToday: number;
  freezesAvailable: number;
  hasAcknowledgedFreezeUsed: boolean;
  onStartFirstTask: () => void;
  onSaveStreak: () => void;
  onUseFreeze: () => void;
  onAcknowledgeFreezeUsed: () => void;
  onSkip: () => void;
  onStartComeback: () => void;

  securedDateKeys: string[];
  freezeCount: number;

  statsAllZero: boolean;
  onDiscover: () => void;

  homeIsPending: boolean;
  homeHasData: boolean;
  homeIsError: boolean;
  onRetryHome: () => void;

  challengeGroupsCount: number;
  incompleteChallenges: HomeHeaderChallengeGoalGroup[];
  completedTodayChallenges: HomeHeaderChallengeGoalGroup[];
  completedExpanded: boolean;
  onToggleCompletedExpanded: () => void;
  renderIncompleteGoalGroup: RenderGroupItem;
  renderCompletedGoalGroup: RenderGroupItem;
  keyExtractorIncompleteGroup: (group: HomeHeaderChallengeGoalGroup) => string;
  keyExtractorCompletedGroup: (group: HomeHeaderChallengeGoalGroup) => string;
  onGoalsSectionLayout: (event: LayoutChangeEvent) => void;
};

function HomeHeaderInner(props: HomeHeaderProps) {
  const remainingCount = useMemo(
    () =>
      props.incompleteChallenges.reduce(
        (sum, g) => sum + g.goals.filter((gl) => !gl.completed).length,
        0,
      ),
    [props.incompleteChallenges],
  );

  return (
    <View>
      {props.leaveChallengeError ? (
        <InlineError
          message={props.leaveChallengeError}
          onDismiss={props.onClearLeaveChallengeError}
        />
      ) : null}

      <View style={s.headerRow}>
        <View style={s.headerTextCol}>
          <Text style={s.greeting}>{`${props.greeting}, ${props.firstName}`}</Text>
          <Text style={s.todayTitle}>Today</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={props.onPressBell}
          style={s.bellButton}
        >
          <Bell size={16} color={DS_COLORS.TEXT_PRIMARY} strokeWidth={1.75} />
          <View style={s.bellDot} />
        </Pressable>
      </View>

      <View style={s.heroWrap}>
        <StreakHeroV3
          streak={props.streak}
          lastStreak={0}
          minutesRemaining={props.minutesRemaining}
          tasksRemaining={props.tasksRemaining}
          totalTasksToday={props.totalTasksToday}
          freezesAvailable={props.freezesAvailable}
          freezeUsedToday={false && !props.hasAcknowledgedFreezeUsed}
          onStartFirstTask={props.onStartFirstTask}
          onSaveStreak={props.onSaveStreak}
          onUseFreeze={props.onUseFreeze}
          onAcknowledgeFreezeUsed={props.onAcknowledgeFreezeUsed}
          onSkip={props.onSkip}
          onStartComeback={props.onStartComeback}
        />
      </View>

      {!FLAGS.PR3_ZERO_STATE_GATES || props.streak >= 1 ? (
        <WeekStrip
          securedDateKeys={props.securedDateKeys}
          currentStreak={props.streak}
          freezeCount={props.freezeCount}
        />
      ) : null}

      {props.statsAllZero ? (
        <View style={s.welcomeCard}>
          <Text style={s.welcomeTitle}>Welcome to GRIIT</Text>
          <Text style={s.welcomeBody}>Your stats will appear here as you build your streak.</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={s.welcomeCta}
            onPress={props.onDiscover}
            accessibilityLabel="Start your first challenge"
          >
            <Text style={s.welcomeCtaText}>Start your first challenge</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!FLAGS.PR3_ZERO_STATE_GATES || props.streak >= 1 ? <DailyBonus /> : null}

      <ActiveTaskCard />

      {props.homeIsPending && !props.homeHasData ? (
        <View style={s.goalsSection}>
          <SkeletonHomeChallengeCard />
          <SkeletonHomeChallengeCard />
        </View>
      ) : props.homeIsError ? (
        <ErrorState message="Couldn't load your dashboard" onRetry={props.onRetryHome} />
      ) : props.challengeGroupsCount === 0 ? (
        <EmptyState
          icon={Target}
          title="No active challenges"
          subtitle="Find a challenge that pushes your limits"
          action={{
            label: "Browse challenges",
            onPress: props.onDiscover,
          }}
        />
      ) : (
        <View style={s.goalsSection} onLayout={props.onGoalsSectionLayout}>
          {props.incompleteChallenges.length === 0 ? (
            <View style={s.allDoneBanner}>
              <Text style={s.allDoneTitle}>🔥 All tasks secured for today</Text>
              <Text style={s.allDoneSubtitle}>Come back tomorrow to continue</Text>
            </View>
          ) : null}
          <SectionHeader
            title="Today's goals"
            actionLabel={`${remainingCount} remaining`}
            onPressAction={() => {}}
          />
          <FlashList
            data={props.incompleteChallenges}
            keyExtractor={props.keyExtractorIncompleteGroup}
            scrollEnabled={false}
            nestedScrollEnabled
            renderItem={props.renderIncompleteGoalGroup}
          />
          {props.completedTodayChallenges.length > 0 ? (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                style={s.completedHeader}
                onPress={props.onToggleCompletedExpanded}
                accessibilityLabel="Show or hide completed today tasks"
                accessibilityState={{ expanded: props.completedExpanded }}
              >
                <Text style={s.completedHeaderText}>Completed today ✓</Text>
                <Text style={s.completedHeaderCount}>
                  {props.completedExpanded ? "Hide" : "Show"} ({props.completedTodayChallenges.length})
                </Text>
              </TouchableOpacity>
              {props.completedExpanded ? (
                <FlashList
                  data={props.completedTodayChallenges}
                  keyExtractor={props.keyExtractorCompletedGroup}
                  scrollEnabled={false}
                  nestedScrollEnabled
                  renderItem={props.renderCompletedGoalGroup}
                />
              ) : null}
            </>
          ) : null}
        </View>
      )}

      <NextUnlock currentStreak={props.streak} />

      <View style={s.sectionDivider} />

      <DailyQuote />
    </View>
  );
}

export const HomeHeader = React.memo(HomeHeaderInner);
export default HomeHeader;

const s = StyleSheet.create({
  heroWrap: { paddingHorizontal: DS_SPACING_V2.md },
  headerRow: {
    paddingHorizontal: DS_SPACING.xl,
    paddingTop: DS_SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
    marginRight: DS_SPACING.md,
  },
  greeting: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.TEXT_MUTED },
  todayTitle: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  bellButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: DS_COLORS.BORDER,
    backgroundColor: DS_COLORS.BG_CARD,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.ACCENT,
  },
  welcomeCard: {
    marginTop: DS_SPACING.md,
    marginHorizontal: DS_SPACING.xl,
    backgroundColor: DS_COLORS.WHITE,
    borderRadius: DS_RADIUS.button,
    padding: DS_SPACING.lg,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_BASE,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  welcomeBody: {
    marginTop: 6,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
  welcomeCta: {
    marginTop: 12,
    backgroundColor: DS_COLORS.ACCENT_PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  welcomeCtaText: {
    color: DS_COLORS.WHITE,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
  goalsSection: { paddingTop: 14 },
  completedHeader: {
    marginTop: DS_SPACING.md,
    marginBottom: DS_SPACING.xs,
    paddingHorizontal: DS_SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedHeaderText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  completedHeaderCount: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_MUTED,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  allDoneBanner: {
    marginHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.sm,
    padding: DS_SPACING.lg,
    borderRadius: DS_RADIUS.button,
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  allDoneTitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  allDoneSubtitle: {
    marginTop: 4,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    color: DS_COLORS.TEXT_SECONDARY,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: DS_COLORS.BORDER,
    marginHorizontal: DS_SPACING.xl,
    marginTop: DS_SPACING.md,
    marginBottom: DS_SPACING.sm,
  },
});
