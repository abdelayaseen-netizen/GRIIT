/**
 * HomeHeaderV2 — sticky-ish header for the new home (passed to LiveFeedSection
 * as ListHeaderComponent).
 *
 * Composition (top → bottom):
 *   1. Greeting bar       — date + state-aware greeting + notification bell
 *   2. StreakHeroV4       — state-aware streak card
 *   3. StatGrid           — three-card bento (Week / Freezes / Next badge)
 *   4. Feed tab toggle    — Friends / Everyone (controls the LiveFeedSection scope)
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { DS_COLORS_V2, DS_SPACING_V2 } from '@/lib/design-system';
import { StreakHeroV4, type StreakHeroV4Props } from './StreakHeroV4';
import { StatGrid, type StatGridVariant } from './StatGrid';
import { Avatar } from '@/components/Avatar';
import type { FeedScope } from '@/store/feedToggleStore';

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

// ──────────────────────────────────────────────────────────────────────────
// Greeting helpers
// ──────────────────────────────────────────────────────────────────────────

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function formatTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function timeOfDayGreeting(d: Date): string {
  const h = d.getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function greetingFor(state: HeroState, firstName: string, now: Date): string {
  // Empty firstName (profilePrimaryName last fallback) renders "Welcome" with no name.
  const name = firstName ? `, ${firstName}` : '';
  switch (state) {
    case 'day0':
      return `Welcome${name}`;
    case 'atRisk':
      return `Last chance${name}`;
    case 'secured':
      return `Day secured${name}`;
    default:
      return `${timeOfDayGreeting(now)}${name}`;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

type HeroState = 'day0' | 'default' | 'atRisk' | 'secured';

export type HomeHeaderV2Props = {
  firstName: string;
  /** Avatar URL for the current user — shown beside greeting. */
  avatarUrl?: string | null;
  /** User ID for avatar fallback color derivation. */
  userId?: string;
  onPressAvatar?: () => void;
  hero: StreakHeroV4Props;
  heroState: HeroState;
  /** Current local date — passed in so callers can mock for tests. */
  now?: Date;
  /** IANA zone for the weekday eyebrow. Device getDay() is UTC on some builds. */
  timeZone?: string;
  notificationCount?: number;
  onPressBell: () => void;

  // StatGrid wiring
  weekSecured: number;
  weekTotal: number;
  weekSecuredByIndex: boolean[];
  todayWeekIndex: number;
  freezesAvailable: number;
  freezesMaxPerWeek: number;
  nextBadgeName: string;
  nextBadgeProgress: number;
  onPressWeekStat?: () => void;
  onPressFreezesStat?: () => void;
  onPressBadgeStat?: () => void;

  // Feed toggle
  feedScope: FeedScope;
  onChangeFeedScope: (next: FeedScope) => void;
};

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function HomeHeaderV2(props: HomeHeaderV2Props) {
  const now = props.now ?? new Date();

  const greetingText = greetingFor(props.heroState, props.firstName, now);
  // Daylight greeting eyebrow is a calm single weekday; atRisk keeps the time
  // so the "last chance" framing still reads urgent.
  const weekday = props.timeZone
    ? new Intl.DateTimeFormat('en-US', { timeZone: props.timeZone, weekday: 'long' }).format(now)
    : WEEKDAYS[now.getDay()];
  const dateText =
    props.heroState === 'atRisk'
      ? `${weekday} · ${formatTime(now)}`
      : weekday;

  const dotColor = DS_COLORS_V2.brand.primary;

  const statGridVariant: StatGridVariant =
    props.heroState === 'atRisk'
      ? 'atRisk'
      : props.heroState === 'secured'
        ? 'secured'
        : props.heroState === 'day0'
          ? 'day0'
          : 'default';

  return (
    <View style={styles.root}>
      {/* Greeting bar */}
      <View style={styles.greetRow}>
        {props.onPressAvatar ? (
          <Pressable
            onPress={props.onPressAvatar}
            accessibilityRole="button"
            accessibilityLabel="View your profile"
            hitSlop={HIT_SLOP}
            style={({ pressed }) => [
              styles.avatarBtn,
              pressed ? styles.avatarBtnPressed : null,
            ]}
          >
            <Avatar
              url={props.avatarUrl ?? null}
              name={props.firstName}
              userId={props.userId ?? props.firstName}
              size={36}
            />
          </Pressable>
        ) : null}
        <View style={styles.greetTextCol}>
          <Text style={styles.dateText}>{dateText}</Text>
          <Text style={styles.greetingText} numberOfLines={1}>
            {greetingText}
          </Text>
        </View>
        <Pressable
          onPress={props.onPressBell}
          accessibilityRole="button"
          accessibilityLabel={
            props.notificationCount && props.notificationCount > 0
              ? `Notifications, ${props.notificationCount} unread`
              : 'Notifications'
          }
          hitSlop={HIT_SLOP}
          style={({ pressed }) => [
            styles.bellBtn,
            pressed ? styles.bellBtnPressed : null,
          ]}
        >
          <Bell
            size={22}
            color={DS_COLORS_V2.text.primary}
            strokeWidth={1.75}
          />
          {props.notificationCount && props.notificationCount > 0 ? (
            <View style={[styles.bellDot, { backgroundColor: dotColor }]} />
          ) : null}
        </Pressable>
      </View>

      {/* Streak hero */}
      <View style={styles.heroWrap}>
        <StreakHeroV4 {...props.hero} />
      </View>

      {/* Stat grid */}
      <View style={styles.statGridWrap}>
        <StatGrid
          weekSecured={props.weekSecured}
          weekTotal={props.weekTotal}
          weekSecuredByIndex={props.weekSecuredByIndex}
          todayWeekIndex={props.todayWeekIndex}
          freezesAvailable={props.freezesAvailable}
          freezesMaxPerWeek={props.freezesMaxPerWeek}
          nextBadgeName={props.nextBadgeName}
          nextBadgeProgress={props.nextBadgeProgress}
          streak={props.hero.streak ?? 0}
          variant={statGridVariant}
          onPressWeek={props.onPressWeekStat}
          onPressFreezes={props.onPressFreezesStat}
          onPressBadge={props.onPressBadgeStat}
        />
      </View>

      {/* Feed scope toggle */}
      <View style={styles.feedToggleRow}>
        <Text style={styles.feedToggleLabel}>Feed</Text>
        <View style={styles.toggleGroup}>
          <Pressable
            onPress={() => props.onChangeFeedScope('following')}
            style={[
              styles.togglePill,
              props.feedScope === 'following' ? styles.togglePillActive : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from friends you follow"
            accessibilityState={{ selected: props.feedScope === 'following' }}
            hitSlop={HIT_SLOP}
          >
            <Text
              style={[
                styles.toggleText,
                props.feedScope === 'following'
                  ? styles.toggleTextActive
                  : null,
              ]}
            >
              Friends
            </Text>
          </Pressable>
          <Pressable
            onPress={() => props.onChangeFeedScope('everyone')}
            style={[
              styles.togglePill,
              props.feedScope === 'everyone' ? styles.togglePillActive : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Show feed from everyone"
            accessibilityState={{ selected: props.feedScope === 'everyone' }}
            hitSlop={HIT_SLOP}
          >
            <Text
              style={[
                styles.toggleText,
                props.feedScope === 'everyone'
                  ? styles.toggleTextActive
                  : null,
              ]}
            >
              Everyone
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}


// ──────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    paddingTop: 12,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DS_SPACING_V2.lg,
    gap: 12,
  },
  greetTextCol: {
    flex: 1,
    minWidth: 0,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: DS_COLORS_V2.text.tertiary,
  },
  greetingText: {
    fontSize: 27,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  avatarBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarBtnPressed: {
    opacity: 0.85,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  bellBtnPressed: {
    opacity: 0.85,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  heroWrap: {
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingTop: 26,
  },
  statGridWrap: {
    paddingTop: 16,
  },
  feedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingTop: 26,
    paddingBottom: 4,
    gap: 12,
  },
  feedToggleLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
    borderRadius: 20,
    padding: 3,
  },
  togglePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  togglePillActive: {
    backgroundColor: DS_COLORS_V2.text.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.text.tertiary,
  },
  toggleTextActive: {
    color: DS_COLORS_V2.brand.primaryText,
  },
});
