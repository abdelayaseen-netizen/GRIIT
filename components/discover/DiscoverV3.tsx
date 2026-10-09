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
import { Cover, type CoverCategory } from "@/components/ds/Cover";
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
import { catalogCoverCategory } from "@/lib/catalog-cover";
import { discoverProofLabel } from "@/lib/discover-proof-label";
import {
  JOIN_CAPTION_TODAY,
  JOIN_CAPTION_TOMORROW,
  MODE_STANDARD_DETAIL,
} from "@/lib/challenge-detail-mapping";
import {
  DISCOVER_LOAD_ERROR,
  FEATURED_BUILTINS,
  featuredProofLabel,
  needsSetGym,
  type FeaturedBuiltin,
} from "@/lib/featured-catalog";
import { ChallengePreviewSheet, type ChallengePreview } from "@/components/discover/ChallengePreviewSheet";
import { difficultyChip } from "@/lib/discover-preview-tasks";

const COVER_CATEGORY: Record<FeaturedBuiltin["category"], CoverCategory> = {
  fitness: "Fitness",
  health: "Health",
  discipline: "Discipline",
  faith: "Faith",
  mind: "Mind",
  learning: "Learning",
};

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
  onJoinChallenge?: (id: string) => void;
  todaySecured?: boolean;
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
  onJoinChallenge,
  todaySecured,
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
  const [preview, setPreview] = React.useState<ChallengePreview | null>(null);
  const day1Line = todaySecured ? JOIN_CAPTION_TOMORROW : JOIN_CAPTION_TODAY;

  function openBuiltin(item: FeaturedBuiltin) {
    setPreview({
      id: item.id,
      title: item.title,
      category: COVER_CATEGORY[item.category],
      days: item.days,
      taskTitle: item.task,
      proof: featuredProofLabel(item.proof),
      window: item.rule,
      tasks: [{ title: item.task, gate: [featuredProofLabel(item.proof), item.rule].filter(Boolean).join(" · ") }],
      difficulty: "Standard",
      modeLine: MODE_STANDARD_DETAIL,
      day1Line,
      builtin: item,
    });
  }

  function openGrid(item: RecommendedChallenge) {
    setPreview({
      id: item.id,
      title: item.title,
      category: catalogCoverCategory(item.category),
      days: item.duration,
      people: item.participantCount,
      tasks: item.tasks ?? [],
      difficulty: difficultyChip(item.difficulty),
      modeLine: item.difficulty === "HARD"
        ? "Strict. A missed day resets your streak in this challenge to 0. No freezes."
        : MODE_STANDARD_DETAIL,
      day1Line,
    });
  }

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

      <Text style={[styles.heading, styles.featuredHeading]}>Featured</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {featuredLoading ? <Skeleton variant="proof" /> : null}
        {featured && !FEATURED_BUILTINS.some((b) => b.id === featured.id) ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={featured.name}
            onPress={() => {
              if (featuredJoined) {
                onOpenChallenge(featured.id, featured.slug);
                return;
              }
              setPreview({
                id: featured.id,
                title: featured.name,
                category: catalogCoverCategory(featured.category),
                days: featured.duration_days,
                people: featured.circleCount,
                tasks: featured.tasks ?? [],
                difficulty: difficultyChip(featured.difficulty),
                modeLine: featured.difficulty === "HARD"
                  ? "Strict. A missed day resets your streak in this challenge to 0. No freezes."
                  : MODE_STANDARD_DETAIL,
                day1Line,
              });
            }}
            style={styles.builtin}
          >
            <Cover
              category={catalogCoverCategory(featured.category)}
              title={featured.name}
              days={featured.duration_days}
              width={160}
              height={200}
            />
            <Text style={styles.caption} numberOfLines={1}>
              {discoverProofLabel({ proofType: featured.proof_type, taskTypes: featured.task_types })}
            </Text>
          </Pressable>
        ) : null}
        {FEATURED_BUILTINS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => openBuiltin(item)}
            style={styles.builtin}
          >
            <Cover
              category={COVER_CATEGORY[item.category]}
              title={item.title}
              days={item.days}
              width={160}
              height={200}
            />
            <Text style={styles.caption} numberOfLines={1}>
              {item.rule || featuredProofLabel(item.proof)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.popularHead}>
        <Text style={styles.heading}>Popular</Text>
        <Text style={styles.caption}>this week</Text>
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
                category={item.category}
                days={item.duration}
                difficulty={difficultyLabel(item.difficulty)}
                people={item.participantCount}
                joined={joinedIds?.has(item.id) === true}
                onPress={() => openGrid(item)}
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
      onClose={() => setPreview(null)}
      onDetails={(item) => {
        setPreview(null);
        onOpenChallenge(item.id);
      }}
      onJoin={(item) => {
        setPreview(null);
        if (item.builtin) {
          if (onJoinBuiltin) onJoinBuiltin(item.builtin);
          else onOpenChallenge(item.id);
          if (needsSetGym(item.builtin) && onJoinBuiltin) return;
          return;
        }
        if (onJoinChallenge) onJoinChallenge(item.id);
        else onStartFeatured();
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
    width: 160,
    gap: 6,
  },
  builtinTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  featuredHeading: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.sm,
  },
  carousel: {
    flexDirection: "row",
    paddingHorizontal: DS_V3.space.gutter,
    gap: 12,
    paddingBottom: DS_V3.space.section,
    alignItems: "flex-start",
  },
  popularHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: 10,
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
    gap: 12,
    paddingHorizontal: DS_V3.space.gutter,
    marginBottom: 24,
  },
  col: {
    flex: 1,
    gap: DS_V3.space.md,
  },
  peopleSection: {
    paddingTop: 32,
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
