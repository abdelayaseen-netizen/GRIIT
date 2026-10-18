/**
 * ProfileV3 — profile presentation. Build 92 chunk 07 (Option A, P2-01 / P2-07 / P2-08): the header
 * with 3 numbers and the record row; the proof grid follows directly in the parent list. Challenges,
 * Badges and Stats moved to the "Your record" screen (`app/profile/record.tsx`).
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Settings, Share2 } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { type BadgeItem } from "@/components/ds/Badges";
import HeaderIcon from "@/components/ds/HeaderIcon";
import RootHeader from "@/components/ds/RootHeader";
import { ProfileHeader, type ProfileRecordCounts } from "@/components/profile/ProfileHeader";
import { streakLineFor } from "@/lib/home-streak";

export { streakLineFor };

/** Same rows BadgeRows took: `record.badges` from badgeRowsFromProgress. */
export function badgeItemsFromRows(
  rows: { name: string; earned: boolean; state: string; rule: string }[],
): BadgeItem[] {
  return rows.map((b) => ({
    label: b.name,
    earnedOn: b.earned ? b.state : undefined,
    requirement: b.rule,
  }));
}

const ICON = DS_V3.space.xs * 6;
export const PROFILE_V3_FOOTNOTE =
  "Five marks, each earned by verified days only. Nothing here can be bought or awarded.";

export type ProfileV3Props = {
  userId?: string | null;
  title: string;
  handle: string;
  avatarUrl?: string | null;
  followers: number;
  following: number;
  bio: string;
  bioPlaceholder?: string | null;
  streak: number;
  best: number;
  totalDaysSecured?: number;
  verifiedDays?: number;
  /** Option A record row counts; omit to hide the row. */
  record?: ProfileRecordCounts | null;
  onRecord?: () => void;
  onShare: () => void;
  onSettings?: () => void;
  onEditProfile?: () => void;
  onInvite?: () => void;
  onFollowers: () => void;
  onFollowing: () => void;
  followLabel?: string;
  onFollow?: () => void;
  followDisabled?: boolean;
  showRootHeader?: boolean;
  locked?: { heading: string; body: string } | null;
  onFindFriends?: () => void;
};

export function ProfileV3({
  userId,
  title,
  handle,
  avatarUrl,
  followers,
  following,
  bio,
  bioPlaceholder,
  streak,
  best,
  totalDaysSecured,
  verifiedDays,
  record,
  onRecord,
  onShare,
  onSettings,
  onEditProfile,
  onInvite,
  onFollowers,
  onFollowing,
  followLabel,
  onFollow,
  followDisabled,
  showRootHeader = true,
  locked,
  onFindFriends,
}: ProfileV3Props) {
  return (
    <View>
      {showRootHeader ? (
        <RootHeader
          titleSize="title"
          title={handle ? `@${handle}` : "Profile"}
          actions={
            <View style={styles.actionsRow}>
              <HeaderIcon accessibilityLabel="Share" onPress={onShare}>
                <Share2 size={ICON} color={DS_V3.color.textPrimary} />
              </HeaderIcon>
              {onSettings ? (
                <HeaderIcon accessibilityLabel="Settings" onPress={onSettings}>
                  <Settings size={ICON} color={DS_V3.color.textPrimary} />
                </HeaderIcon>
              ) : null}
            </View>
          }
        />
      ) : null}

      <ProfileHeader
        userId={userId ?? ""}
        avatarUrl={avatarUrl}
        displayName={title}
        username={handle}
        bio={bio}
        streakDays={streak}
        bestDays={best}
        securedDays={locked ? 0 : (totalDaysSecured ?? 0)}
        verifiedDays={locked ? 0 : (verifiedDays ?? 0)}
        followers={followers}
        following={following}
        isOwner={!onFollow}
        isFollowing={followLabel === "Following"}
        followLabel={followLabel}
        locked={Boolean(locked)}
        record={locked ? null : record}
        bioPlaceholder={bioPlaceholder}
        onEdit={onEditProfile ?? (() => undefined)}
        onFollow={followDisabled ? () => undefined : (onFollow ?? (() => undefined))}
        onShare={onShare}
        onFindFriends={onFindFriends}
        onInvite={onInvite}
        onEditBio={onEditProfile ?? (() => undefined)}
        onFollowers={onFollowers}
        onFollowing={onFollowing}
        onRecord={onRecord}
      />

      {locked ? (
        <View style={styles.lock}>
          <Text style={styles.heading}>{locked.heading}</Text>
          <Text style={styles.secondary}>{locked.body}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: "row", gap: DS_V3.space.sm },
  lock: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.xs,
  },
  heading: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  secondary: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
});
