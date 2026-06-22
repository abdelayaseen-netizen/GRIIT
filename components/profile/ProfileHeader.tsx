/**
 * ProfileHeader — shared identity block for the self + public profile screens.
 *
 * The visible affordances depend on `mode`:
 *   - 'self'   → camera badge on the avatar, two-button row (Edit / Invite)
 *   - 'public' → no camera badge, single full-width Follow button (Follow /
 *                Following / Requested)
 *
 * Counts (followers / following / completed) are tap-targets on both modes.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Pencil, UserPlus } from 'lucide-react-native';

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from '@/lib/design-system';
import { StreakRingAvatar } from '@/components/shared/StreakRingAvatar';

type ProfileHeaderMode = 'self' | 'public';

export type ProfileHeaderProps = {
  // Identity
  userId: string;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isPrivate: boolean;
  currentStreak: number;

  // Counts
  followersCount: number;
  followingCount: number;
  completedChallenges: number;

  // Mode
  mode: ProfileHeaderMode;

  // Self-only
  onPressAvatar?: () => void;
  onPressEditProfile?: () => void;
  onPressInvite?: () => void;

  // Public-only state + handler
  isFollowing?: boolean;
  followPending?: boolean;
  followBusy?: boolean;
  onPressFollow?: () => void;

  // Shared
  onPressFollowers: () => void;
  onPressFollowing: () => void;
  onPressCompleted: () => void;
};

type CountColumnProps = {
  label: string;
  value: number;
  onPress: () => void;
  accessibilityLabel: string;
};

function CountColumn({
  label,
  value,
  onPress,
  accessibilityLabel,
}: CountColumnProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.countColumn,
        pressed ? styles.countColumnPressed : null,
      ]}
    >
      <Text style={styles.countValue}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </Pressable>
  );
}

export const ProfileHeader = React.memo(function ProfileHeader({
  username,
  displayName,
  bio,
  avatarUrl,
  currentStreak,
  followersCount,
  followingCount,
  completedChallenges,
  mode,
  onPressAvatar,
  onPressEditProfile,
  onPressInvite,
  isFollowing,
  followPending,
  followBusy,
  onPressFollow,
  onPressFollowers,
  onPressFollowing,
  onPressCompleted,
}: ProfileHeaderProps) {
  const showCameraBadge = mode === 'self';
  const friendlyName = (displayName ?? '').trim() || (username ?? '').trim() || 'Profile';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <StreakRingAvatar
          url={avatarUrl ?? null}
          name={friendlyName}
          size={84}
          streak={currentStreak}
          showCameraBadge={showCameraBadge}
          onPress={mode === 'self' ? onPressAvatar : undefined}
          accessibilityLabel={
            mode === 'self'
              ? 'Change profile photo'
              : `${friendlyName}, ${currentStreak} day streak`
          }
        />
        <View style={styles.rightCol}>
          <Text style={styles.displayName} numberOfLines={1}>
            {friendlyName}
          </Text>
          <View style={styles.countRow}>
            <CountColumn
              label="Followers"
              value={followersCount}
              onPress={onPressFollowers}
              accessibilityLabel={`${followersCount} followers, view list`}
            />
            <CountColumn
              label="Following"
              value={followingCount}
              onPress={onPressFollowing}
              accessibilityLabel={`Following ${followingCount} accounts, view list`}
            />
            <CountColumn
              label="Completed"
              value={completedChallenges}
              onPress={onPressCompleted}
              accessibilityLabel={`${completedChallenges} completed challenges, view list`}
            />
          </View>
        </View>
      </View>

      {bio && bio.trim().length > 0 ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioText}>{bio.trim()}</Text>
        </View>
      ) : null}

      {mode === 'self' ? (
        <View style={styles.actionRow}>
          <Pressable
            onPress={onPressEditProfile}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnDark,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <Pencil size={14} color={DS_COLORS_V2.text.onDark} strokeWidth={2} />
            <Text style={styles.actionTextDark}>Edit profile</Text>
          </Pressable>
          <Pressable
            onPress={onPressInvite}
            accessibilityRole="button"
            accessibilityLabel="Invite friends"
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnLight,
              pressed ? styles.actionPressed : null,
            ]}
          >
            <UserPlus
              size={14}
              color={DS_COLORS_V2.text.primary}
              strokeWidth={2}
            />
            <Text style={styles.actionTextLight}>Invite friends</Text>
          </Pressable>
        </View>
      ) : (
        <PublicFollowButton
          isFollowing={isFollowing ?? false}
          followPending={followPending ?? false}
          followBusy={followBusy ?? false}
          onPressFollow={onPressFollow}
          targetName={friendlyName}
        />
      )}
    </View>
  );
});

type PublicFollowButtonProps = {
  isFollowing: boolean;
  followPending: boolean;
  followBusy: boolean;
  onPressFollow?: () => void;
  targetName: string;
};

function PublicFollowButton({
  isFollowing,
  followPending,
  followBusy,
  onPressFollow,
  targetName,
}: PublicFollowButtonProps) {
  const pressDisabled = followBusy || !onPressFollow;
  if (isFollowing) {
    return (
      <Pressable
        onPress={onPressFollow}
        accessibilityRole="button"
        accessibilityLabel={`Following ${targetName}, tap to unfollow`}
        disabled={pressDisabled}
        style={({ pressed }) => [
          styles.followBtn,
          styles.followBtnSecondary,
          pressed ? styles.actionPressed : null,
        ]}
      >
        <Check
          size={14}
          color={DS_COLORS_V2.text.primary}
          strokeWidth={2}
        />
        <Text style={styles.followTextSecondary}>Following</Text>
      </Pressable>
    );
  }
  if (followPending) {
    return (
      <Pressable
        onPress={onPressFollow}
        accessibilityRole="button"
        accessibilityLabel={`Follow request to ${targetName} pending`}
        disabled={pressDisabled}
        style={({ pressed }) => [
          styles.followBtn,
          styles.followBtnSecondary,
          pressed ? styles.actionPressed : null,
        ]}
      >
        <Text style={styles.followTextSecondary}>Requested</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPressFollow}
      accessibilityRole="button"
      accessibilityLabel={`Follow ${targetName}`}
      disabled={pressDisabled}
      style={({ pressed }) => [
        styles.followBtn,
        styles.followBtnPrimary,
        pressed ? styles.actionPressed : null,
      ]}
    >
      <UserPlus
        size={14}
        color={DS_COLORS_V2.brand.primaryText}
        strokeWidth={2}
      />
      <Text style={styles.followTextPrimary}>Follow</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_SPACING_V2.md,
    paddingTop: DS_SPACING_V2.sm,
    paddingBottom: 0,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DS_SPACING_V2.md,
    marginBottom: DS_SPACING_V2.md,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.2,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: DS_SPACING_V2.md,
  },
  countColumn: {
    alignItems: 'flex-start',
    minWidth: 56,
  },
  countColumnPressed: {
    opacity: 0.7,
  },
  countValue: {
    fontSize: 17,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.2,
  },
  countLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: DS_COLORS_V2.text.secondary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  bioCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
    color: DS_COLORS_V2.text.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: DS_SPACING_V2.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: DS_RADIUS_V2.md,
  },
  actionBtnDark: {
    backgroundColor: DS_COLORS_V2.surface.heroNeutral,
  },
  actionBtnLight: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionTextDark: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.text.onDark,
  },
  actionTextLight: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
  },
  followBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: DS_RADIUS_V2.md,
  },
  followBtnPrimary: {
    backgroundColor: DS_COLORS_V2.brand.primary,
  },
  followBtnSecondary: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  followTextPrimary: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.brand.primaryText,
  },
  followTextSecondary: {
    fontSize: 13,
    fontWeight: '500',
    color: DS_COLORS_V2.text.primary,
  },
});

