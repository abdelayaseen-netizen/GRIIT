/**
 * DiscoverV3 — frame 02 + 02_screens.md Discover tree (presentation).
 * Proof posts from feed.getTrending are fetched by the route and not rendered.
 */
import React from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DS_V3 } from "@/lib/design-system";
import RootHeader from "@/components/ds/RootHeader";
import Chip from "@/components/ds/Chip";
import Button from "@/components/ds/Button";
import Skeleton from "@/components/ds/Skeleton";
import EmptyState from "@/components/ds/EmptyState";
import ChallengeCard from "@/components/discover/ChallengeCard";
import PersonCard from "@/components/discover/PersonCard";
import type { DiscoverCategory } from "@/components/discover/CategoryChips";
import type { HeroFeaturedData } from "@/components/challenges/HeroFeaturedCard";
import type { RecommendedChallenge } from "@/components/discover/grid/ChallengeGridCard";

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
  error: boolean;
  onRetry: () => void;
  onOpenChallenge: (id: string, slug?: string | null) => void;
  onStartFeatured: () => void;
  onBuildOwn: () => void;
  onOpenPerson: (userId: string) => void;
  onFollowPerson: (userId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const CHIPS: { id: DiscoverCategory; label: string }[] = [
  { id: "for_you", label: "For you" },
  { id: "trending", label: "Trending" },
  { id: "body", label: "Body" },
  { id: "mind", label: "Mind" },
];

function difficultyLabel(d: RecommendedChallenge["difficulty"]): string {
  if (d === "EASY") return "Easy";
  if (d === "HARD") return "Hard";
  return "Medium";
}

function proofTypeLabel(p: HeroFeaturedData["proof_type"]): string {
  if (p === "photo") return "photo proof";
  if (p === "location") return "location proof";
  return "text proof";
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
  error,
  onRetry,
  onOpenChallenge,
  onStartFeatured,
  onBuildOwn,
  onOpenPerson,
  onFollowPerson,
  refreshing,
  onRefresh,
}: DiscoverV3Props) {
  const circle = circleCaption(circleCount);
  const left = challenges.filter((_, i) => i % 2 === 0);
  const right = challenges.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.root}>
      <RootHeader title="Discover" />
      {error ? (
        <View style={styles.errorPad}>
          <EmptyState
            heading="Challenges did not load"
            body="Check your connection and try again."
            actionLabel="Retry"
            variant="error"
            onRetry={onRetry}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={Boolean(refreshing)}
                onRefresh={onRefresh}
                tintColor={DS_V3.color.brand}
              />
            ) : undefined
          }
        >
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

          <View style={styles.featuredPad}>
            {featuredLoading ? (
              <Skeleton variant="proof" />
            ) : featured ? (
              <ChallengeCard
                title={featured.name}
                coverUri={featured.featuredProof?.photo_url}
                days={featured.duration_days}
                difficulty={difficultyLabel(featured.difficulty)}
                proofType={proofTypeLabel(featured.proof_type)}
                featured
                onStart={onStartFeatured}
                onPress={() => onOpenChallenge(featured.id, featured.slug)}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.heading}>Popular with your circle</Text>
            {circle ? <Text style={styles.caption}>{circle}</Text> : null}
          </View>
          <View style={styles.grid}>
            {challengesLoading ? (
              <>
                <View style={styles.col}>
                  <Skeleton variant="proof" />
                </View>
                <View style={styles.col}>
                  <Skeleton variant="proof" />
                </View>
              </>
            ) : (
              <>
                <View style={styles.col}>
                  {left.map((c) => (
                    <ChallengeCard
                      key={c.id}
                      title={c.title}
                      days={c.duration}
                      difficulty={difficultyLabel(c.difficulty)}
                      onPress={() => onOpenChallenge(c.id)}
                    />
                  ))}
                </View>
                <View style={styles.col}>
                  {right.map((c) => (
                    <ChallengeCard
                      key={c.id}
                      title={c.title}
                      days={c.duration}
                      difficulty={difficultyLabel(c.difficulty)}
                      onPress={() => onOpenChallenge(c.id)}
                    />
                  ))}
                </View>
              </>
            )}
          </View>

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
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  scroll: {
    paddingBottom: DS_V3.space.gutter * 6,
  },
  errorPad: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
  },
  chips: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
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
