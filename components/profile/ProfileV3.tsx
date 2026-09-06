/**
 * ProfileV3 — frame 05 + 02_screens.md Profile tree (presentation).
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Settings, Share2 } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Badges, { type BadgeItem } from "@/components/ds/Badges";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import DisplayNumber from "@/components/ds/DisplayNumber";
import EmptyState from "@/components/ds/EmptyState";
import HeaderIcon from "@/components/ds/HeaderIcon";
import ProofImage from "@/components/ds/ProofImage";
import RootHeader from "@/components/ds/RootHeader";
import SegmentedControl from "@/components/ds/SegmentedControl";
import { badgeRowsFromProgress } from "@/lib/profile-v2-badges";

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
const TABS = ["Challenges", "Proofs", "Badges"] as const;
const FOOTNOTE =
  "Five marks, each earned by verified days only. Nothing here can be bought or awarded.";

export function streakLineFor(current: number): string {
  return current === 0 ? "Post today to start." : "Day secured.";
}

export type ProfileV3Run = {
  id: string;
  name: string;
  day: number;
  length: number;
};

export type ProfileV3Proof = {
  dateKey: string;
  day: number;
  imageUrl?: string | null;
};

export type ProfileV3Props = {
  title: string;
  handle: string;
  avatarUrl?: string | null;
  followers: number;
  following: number;
  bio: string;
  streak: number;
  best: number;
  consistency: string;
  consistencySub: string;
  tab: (typeof TABS)[number];
  onChangeTab: (tab: (typeof TABS)[number]) => void;
  runs: ProfileV3Run[];
  proofs: ProfileV3Proof[];
  badges: BadgeItem[];
  onShare: () => void;
  onSettings?: () => void;
  onEditProfile?: () => void;
  onInvite?: () => void;
  onFollowers: () => void;
  onFollowing: () => void;
  onSeeRecord: () => void;
  onDiscover: () => void;
  onOpenRun: (id: string) => void;
  followLabel?: string;
  onFollow?: () => void;
  followDisabled?: boolean;
  showRootHeader?: boolean;
  locked?: { heading: string; body: string } | null;
};

export function ProfileV3({
  title,
  handle,
  avatarUrl,
  followers,
  following,
  bio,
  streak,
  best,
  consistency,
  consistencySub,
  tab,
  onChangeTab,
  runs,
  proofs,
  badges,
  onShare,
  onSettings,
  onEditProfile,
  onInvite,
  onFollowers,
  onFollowing,
  onSeeRecord,
  onDiscover,
  onOpenRun,
  followLabel,
  onFollow,
  followDisabled,
  showRootHeader = true,
  locked,
}: ProfileV3Props) {
  return (
    <View>
      {showRootHeader ? (
        <RootHeader
          title={title}
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

      <View style={styles.identity}>
        <Avatar size={96} uri={avatarUrl} displayName={title} />
        <View style={styles.idCol}>
          <Text style={styles.handle}>@{handle}</Text>
          <View style={styles.counts}>
            <Pressable
              onPress={onFollowers}
              accessibilityRole="button"
              accessibilityLabel={`${followers} followers`}
            >
              <Text style={styles.caption}>{followers} followers</Text>
            </Pressable>
            <Pressable
              onPress={onFollowing}
              accessibilityRole="button"
              accessibilityLabel={`${following} following`}
            >
              <Text style={styles.caption}>{following} following</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {bio ? (
        <Text style={styles.bio}>{bio}</Text>
      ) : onEditProfile ? (
        <View style={styles.bioPrompt}>
          <Button
            label="Add a line about what you are building"
            variant="tertiary"
            size="small"
            onPress={onEditProfile}
          />
        </View>
      ) : null}

      <View style={styles.btnRow}>
        {onFollow ? (
          <View style={styles.flex}>
            <Button
              label={followLabel ?? "Request to follow"}
              variant="secondary"
              disabled={followDisabled}
              onPress={onFollow}
            />
          </View>
        ) : (
          <>
            <View style={styles.flex}>
              <Button label="Edit profile" variant="secondary" onPress={onEditProfile} />
            </View>
            <View style={styles.flex}>
              <Button label="Invite friends" variant="secondary" onPress={onInvite} />
            </View>
          </>
        )}
      </View>

      {locked ? (
        <View style={styles.lock}>
          <Text style={styles.heading}>{locked.heading}</Text>
          <Text style={styles.secondary}>{locked.body}</Text>
        </View>
      ) : (
        <>
      <View style={styles.gutter}>
        <Card>
          <View style={styles.streakTop}>
            <Text style={styles.label}>CURRENT STREAK</Text>
            <View style={styles.bestRow}>
              <Text style={styles.caption}>Best </Text>
              <DisplayNumber value={best} size="inline" />
              <Text style={styles.caption}>{best === 1 ? " day" : " days"}</Text>
            </View>
          </View>
          <View style={styles.numRow}>
            <DisplayNumber value={streak} size="home" />
            <Text style={styles.days}>days</Text>
          </View>
          <Text style={styles.secondary}>{streakLineFor(streak)}</Text>
        </Card>
      </View>

      <View style={styles.consist}>
        <Card>
          <Text style={styles.label}>CONSISTENCY</Text>
          <Text style={styles.title}>{consistency}</Text>
          <Text style={styles.secondary}>{consistencySub}</Text>
          <View style={styles.recordBtn}>
            <Button
              label="See the full record"
              variant="tertiary"
              size="small"
              flush
              onPress={onSeeRecord}
            />
          </View>
        </Card>
      </View>

      <View style={styles.seg}>
        <SegmentedControl items={[...TABS]} value={tab} onChange={(v) => onChangeTab(v as (typeof TABS)[number])} />
      </View>

      <View style={styles.tabBody}>
        {tab === "Challenges" ? (
          runs.length === 0 ? (
            <EmptyState
              heading="No active challenge"
              body="Start one from Discover. Day 1 begins the morning after you join."
              actionLabel="Find a challenge"
              onAction={onDiscover}
            />
          ) : (
            <View style={styles.runStack}>
              {runs.map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => onOpenRun(r.id)}
                  accessibilityRole="button"
                  accessibilityLabel={r.name}
                  style={styles.run}
                >
                  <Text style={styles.heading}>{r.name}</Text>
                  <Text style={styles.secondary}>
                    Day {r.day} of {r.length}. Post today to keep it.
                  </Text>
                </Pressable>
              ))}
            </View>
          )
        ) : null}

        {tab === "Proofs" ? (
          proofs.length === 0 ? (
            <EmptyState
              heading="No proofs yet"
              body="Join a challenge and every verified day lands here as a photo."
              actionLabel="Find a challenge"
              onAction={onDiscover}
            />
          ) : (
            <View style={styles.proofGrid}>
              {proofs.map((p) => (
                <View key={p.dateKey} style={styles.proofCell}>
                  <ProofImage uri={p.imageUrl} size="thumb" title={`Day ${p.day}`} />
                </View>
              ))}
            </View>
          )
        ) : null}

        {tab === "Badges" ? (
          <Badges
            badges={
              badges.length > 0
                ? badges
                : badgeItemsFromRows(
                    badgeRowsFromProgress({ bestStreak: 0, verifiedDays: 0 }),
                  )
            }
            footnote={FOOTNOTE}
          />
        ) : null}
      </View>

      {tab === "Badges" ? null : <Text style={styles.foot}>{FOOTNOTE}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: "row", gap: DS_V3.space.sm },
  identity: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
  },
  idCol: { flex: 1, gap: DS_V3.space.sm },
  handle: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  counts: { flexDirection: "row", gap: DS_V3.space.lg },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  bio: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  bioPrompt: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.lg,
    alignItems: "flex-start",
  },
  btnRow: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.sm,
    flexDirection: "row",
    gap: DS_V3.space.md,
  },
  flex: { flex: 1 },
  gutter: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  streakTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DS_V3.space.sm,
  },
  bestRow: { flexDirection: "row", alignItems: "baseline" },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
    fontWeight: DS_V3.type.label.fontWeight,
    letterSpacing: DS_V3.type.label.letterSpacing,
    color: DS_V3.color.textSecondary,
  },
  numRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: DS_V3.space.sm,
  },
  days: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  consist: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
    marginTop: DS_V3.space.sm,
  },
  recordBtn: { alignItems: "flex-start", marginTop: DS_V3.space.sm },
  seg: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
  },
  tabBody: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
  },
  runStack: { gap: DS_V3.space.md },
  run: { minHeight: DS_V3.size.tap, justifyContent: "center" },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  proofGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.md,
  },
  proofCell: {
    width: "31%",
  },
  lock: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.sm,
  },
  foot: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
