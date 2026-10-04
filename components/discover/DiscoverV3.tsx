/**
 * DiscoverV3 — frame 02 + 02_screens.md Discover tree (presentation).
 * Proof posts from feed.getTrending are fetched by the route and not rendered.
 */
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import { tabBarContentPad } from "@/lib/tab-bar-inset";
import RootHeader from "@/components/ds/RootHeader";
import Chip from "@/components/ds/Chip";
import Button from "@/components/ds/Button";
import Skeleton from "@/components/ds/Skeleton";
import EmptyState from "@/components/ds/EmptyState";
import ChallengeCard from "@/components/discover/ChallengeCard";
import PersonCard from "@/components/discover/PersonCard";
import type { DiscoverCategory } from "@/components/discover/CategoryChips";
import { CREATE_CATEGORIES } from "@/lib/challenge-category";
import type { HeroFeaturedData } from "@/components/challenges/HeroFeaturedCard";
import type { RecommendedChallenge } from "@/components/discover/grid/ChallengeGridCard";
import { catalogCoverLabel, catalogCoverUri } from "@/lib/catalog-cover";
import { discoverProofLabel } from "@/lib/discover-proof-label";
import {
  DISCOVER_LOAD_ERROR,
  FEATURED_BUILTINS,
  featuredCardLine,
  featuredMembersLine,
  needsSetGym,
  type FeaturedBuiltin,
} from "@/lib/featured-catalog";
import { ChallengePreviewSheet } from "@/components/discover/ChallengePreviewSheet";

export type DiscoverPerson = {
  user_id: string;
  name: string;
  uri?: string | null;
  status: string;
  followLabel: string;
  followDisabled?: boolean;
  followPending?: boolean;
};

export type DiscoverV3Props = {
  category: DiscoverCategory;
  onCategory: (c: DiscoverCategory) => void;
  featured: HeroFeaturedData | null;
  featuredLoading: boolean;
  challenges: RecommendedChallenge[];
  challengesLoading: boolean;
  people: DiscoverPerson[];
  circleCount: number;
  featuredJoined?: boolean;
  joinedIds?: ReadonlySet<string>;
  error: boolean;
  onRetry: () => void;
  onOpenChallenge: (id: string, slug?: string | null) => void;
  onStartFeatured: () => void;
  onBuildOwn: () => void;
  onOpenPerson: (userId: string) => void;
  onFollowPerson: (userId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onJoinBuiltin?: (item: FeaturedBuiltin) => void;
};

const CHIPS: { id: DiscoverCategory; label: string }[] = [
  { id: "for_you", label: "For you" },
  ...CREATE_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

function difficultyLabel(d: RecommendedChallenge["difficulty"]): string {
  if (d === "EASY") return "Easy";
  if (d === "HARD") return "Hard";
  return "Medium";
}

function circleCaption(n: number): string | null {
  if (n <= 0) return null;
  if (n === 1) return "1 friend started this week";
  return `${n} friends started this week`;
}

function PersonSep() {
  return <View style={styles.personSep} />;
}

export function DiscoverV3({
  category,
  onCategory,
  featured,
  featuredLoading,
  challenges,
  challengesLoading,
  people,
  circleCount,
  featuredJoined,
  joinedIds,
  error,
  onRetry,
  onOpenChallenge,
  onStartFeatured,
  onBuildOwn,
  onOpenPerson,
  onFollowPerson,
  refreshing,
  onRefresh,
  onJoinBuiltin,
}: DiscoverV3Props) {
  const insets = useSafeAreaInsets();
  const circle = circleCaption(circleCount);
  const gridData = challengesLoading ? [] : challenges;
  const [preview, setPreview] = React.useState<FeaturedBuiltin | null>(null);

  const header = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CHIPS.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            selected={category === c.id}
            onPress={() => onCategory(c.id)}
          />
        ))}
      </ScrollView>

      <Text style={styles.heading}>Featured</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FEATURED_BUILTINS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => setPreview(item)}
            style={styles.builtin}
          >
            <View style={styles.builtinCover} />
            <Text style={styles.builtinTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.caption}>{featuredCardLine(item)}</Text>
            <Text style={styles.beFirst}>{featuredMembersLine(0)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.featuredPad}>
        {featuredLoading ? (
          <Skeleton variant="proof" />
        ) : featured ? (
          <ChallengeCard
            title={featured.name}
            coverUri={catalogCoverUri(featured)}
            coverLabel={catalogCoverLabel(featured)}
            days={featured.duration_days}
            difficulty={difficultyLabel(featured.difficulty)}
            proofType={discoverProofLabel({
              proofType: featured.proof_type,
              taskTypes: featured.task_types,
            })}
            featured
            joined={featuredJoined === true}
            onStart={onStartFeatured}
            onPress={() => onOpenChallenge(featured.id, featured.slug)}
          />
        ) : null}
      </View>

      {circle ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Popular with your circle</Text>
          <Text style={styles.caption}>{circle}</Text>
        </View>
      ) : null}
      {challengesLoading ? (
        <View style={styles.grid}>
          <View style={styles.col}>
            <Skeleton variant="proof" />
          </View>
          <View style={styles.col}>
            <Skeleton variant="proof" />
          </View>
        </View>
      ) : null}
    </>
  );

  const footer = (
    <>
      <View style={styles.peopleSection}>
        <Text style={styles.peopleHeading}>People</Text>
        <FlatList
          horizontal
          data={people}
          keyExtractor={(p) => p.user_id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.peopleList}
          ItemSeparatorComponent={PersonSep}
          renderItem={({ item }) => (
            <PersonCard
              name={item.name}
              uri={item.uri}
              status={item.status}
              followLabel={item.followLabel}
              followDisabled={item.followDisabled}
              followPending={item.followPending}
              onFollow={() => onFollowPerson(item.user_id)}
              onPress={() => onOpenPerson(item.user_id)}
            />
          )}
        />
      </View>

      <View style={styles.idea}>
        <Text style={styles.heading}>Have your own idea?</Text>
        <Text style={styles.secondary}>
          Create a custom challenge and invite others to join.
        </Text>
        <Button
          label="Build your own"
          variant="secondary"
          onPress={onBuildOwn}
        />
      </View>
    </>
  );

  return (
    <>
    <View style={styles.root}>
      <RootHeader title="Discover" />
      {error ? (
        <View style={styles.errorPad}>
          <EmptyState
            heading={DISCOVER_LOAD_ERROR}
            body="Check your connection and try again."
            actionLabel="Retry"
            variant="error"
            onRetry={onRetry}
          />
        </View>
      ) : (
        <FlatList
          data={gridData}
          numColumns={2}
          keyExtractor={(c) => c.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarContentPad(insets.bottom) }]}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          renderItem={({ item }) => (
            <View style={styles.col}>
              <ChallengeCard
                title={item.title}
                coverUri={catalogCoverUri(item)}
                coverLabel={catalogCoverLabel(item)}
                days={item.duration}
                difficulty={difficultyLabel(item.difficulty)}
                joined={joinedIds?.has(item.id) === true}
                onPress={() => onOpenChallenge(item.id)}
              />
            </View>
          )}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={DS_V3.color.brand}
              />
            ) : undefined
          }
        />
      )}
    </View>
    <ChallengePreviewSheet
      item={preview}
      members={0}
      onClose={() => setPreview(null)}
      onJoin={(item) => {
        setPreview(null);
        if (onJoinBuiltin) onJoinBuiltin(item);
        else onOpenChallenge(item.id);
        if (needsSetGym(item) && onJoinBuiltin) return;
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  scroll: {},
  errorPad: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
  },
  chips: {
    flexDirection: "row",
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
    paddingBottom: DS_V3.space.md,
  },
  builtin: {
    width: 164,
    gap: 4,
  },
  builtinCover: {
    height: 110,
    borderRadius: 16,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
  },
  builtinTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  beFirst: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: DS_V3.color.brandText,
  },
  featuredPad: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  section: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.xs,
    paddingBottom: DS_V3.space.md,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  grid: {
    flexDirection: "row",
    gap: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
  },
  gridRow: {
    gap: DS_V3.space.md,
    paddingHorizontal: DS_V3.space.gutter,
    marginBottom: DS_V3.space.md,
  },
  col: {
    flex: 1,
    gap: DS_V3.space.md,
  },
  peopleSection: {
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  peopleHeading: {
    paddingHorizontal: DS_V3.space.gutter,
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  peopleList: {
    paddingHorizontal: DS_V3.space.gutter,
  },
  personSep: {
    width: DS_V3.space.md,
  },
  idea: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
});
