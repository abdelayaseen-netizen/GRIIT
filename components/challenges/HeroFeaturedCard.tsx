import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  DS_COLORS,
  DS_COLORS_V2,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";
import { Avatar } from "@/components/Avatar";
import { dayUnit } from "./_card-helpers";

export type HeroFeaturedDifficulty = "EASY" | "MED" | "HARD";
export type HeroFeaturedProofType = "photo" | "text" | "location";
export type HeroFeaturedCategory = "body" | "mind" | "faith" | "focus";

export interface HeroFeaturedData {
  id: string;
  slug: string | null;
  name: string;
  duration_days: number;
  difficulty: HeroFeaturedDifficulty;
  proof_type: HeroFeaturedProofType;
  category: HeroFeaturedCategory;
  joinedTodayCount: number;
  featuredProof: {
    user_display_name: string;
    day_number: number;
    photo_url: string;
  } | null;
  friendsStarted: {
    friend_names: string[];
    others_count: number;
  };
}

export interface HeroFeaturedCardProps {
  data: HeroFeaturedData | null | undefined;
  onJoin?: (id: string) => void;
}

// Visual identity gradient — sourced from DS_COLORS_V2.surface.heroDarkWarmGradient.
// Used as the brand fallback when no proof photo is available.
const FALLBACK_GRADIENT_STOPS: readonly [string, string, string] =
  DS_COLORS_V2.surface.heroDarkWarmGradient;

const HEADER_HEIGHT = 140;

function difficultyLabel(d: HeroFeaturedDifficulty): string {
  if (d === "EASY") return "Easy";
  if (d === "HARD") return "Hard";
  return "Medium";
}

function proofTypeLabel(p: HeroFeaturedProofType): string {
  if (p === "photo") return "Photo proof";
  if (p === "location") return "Location proof";
  return "Text proof";
}

function buildSocialProof(friendNames: string[], othersCount: number): string | null {
  if (friendNames.length === 0 && othersCount === 0) return null;
  if (friendNames.length === 0) {
    return `${othersCount} others started today`;
  }
  if (friendNames.length === 1) {
    return `${friendNames[0]} and ${othersCount} others started today`;
  }
  return `${friendNames[0]}, ${friendNames[1]} and ${othersCount} others started today`;
}

export const HeroFeaturedCard = React.memo(function HeroFeaturedCard({
  data,
  onJoin,
}: HeroFeaturedCardProps) {
  const router = useRouter();
  const photoUrl = data?.featuredProof?.photo_url ?? null;

  useEffect(() => {
    if (photoUrl) {
      // Warm the cache so the photo paints faster when the screen renders.
      void Image.prefetch(photoUrl);
    }
  }, [photoUrl]);

  if (!data) return null;

  const target = (data.slug ?? data.id).trim() || data.id;
  const metaLine = `${data.duration_days} ${dayUnit(data.duration_days)} · ${proofTypeLabel(
    data.proof_type
  )} · ${difficultyLabel(data.difficulty)}`;
  const socialProofLine = buildSocialProof(
    data.friendsStarted.friend_names,
    data.friendsStarted.others_count
  );

  const goToDetail = () => {
    if (!target) return;
    router.push(ROUTES.CHALLENGE_ID(target) as never);
  };
  const handleJoin = () => {
    if (onJoin) onJoin(data.id);
    else goToDetail();
  };

  const a11yCard = `${data.name}, ${metaLine}, tap to view`;
  const a11yCta = `Start ${data.name}`;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={goToDetail}
        accessibilityRole="button"
        accessibilityLabel={a11yCard}
        style={styles.headerWrap}
      >
        {data.featuredProof ? (
          <Image
            source={{ uri: data.featuredProof.photo_url }}
            style={styles.headerImage}
            contentFit="cover"
            transition={120}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <LinearGradient
            colors={FALLBACK_GRADIENT_STOPS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerImage}
          />
        )}

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TRENDING</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FOR YOU</Text>
          </View>
        </View>

        {data.featuredProof ? (
          <View style={styles.attribution}>
            <Text style={styles.attributionText} numberOfLines={1}>
              {data.featuredProof.user_display_name}&apos;s day {data.featuredProof.day_number} proof
            </Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {data.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {metaLine}
        </Text>

        {socialProofLine ? (
          <View style={styles.socialRow}>
            <View style={styles.avatarStack}>
              {data.friendsStarted.friend_names.slice(0, 3).map((name, i) => (
                <Avatar
                  key={`${name}-${i}`}
                  name={name}
                  size={22}
                  url={null}
                  style={[
                    styles.stackedAvatar,
                    i === 0 ? null : { marginLeft: -7 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.socialText} numberOfLines={1}>
              {socialProofLine}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleJoin}
          accessibilityRole="button"
          accessibilityLabel={a11yCta}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>Start this challenge</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: DS_SPACING.lg,
    marginTop: DS_SPACING.md,
    borderRadius: DS_RADIUS.LG,
    overflow: "hidden",
    backgroundColor: DS_COLORS.FEATURED_DARK_BG,
  },
  headerWrap: {
    position: "relative",
    height: HEADER_HEIGHT,
    width: "100%",
  },
  headerImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgesRow: {
    position: "absolute",
    top: DS_SPACING.md,
    left: DS_SPACING.md,
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DS_RADIUS.SM,
    backgroundColor: DS_COLORS.FEATURED_OVERLAY_BADGE,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    letterSpacing: 0.6,
    color: DS_COLORS.FEATURED_TEXT_PRIMARY,
  },
  attribution: {
    position: "absolute",
    bottom: DS_SPACING.md,
    left: DS_SPACING.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS.FEATURED_OVERLAY_ATTRIBUTION,
  },
  attributionText: {
    fontSize: 11,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.FEATURED_TEXT_PRIMARY,
  },
  body: {
    paddingHorizontal: DS_SPACING.lg,
    paddingTop: DS_SPACING.md,
    paddingBottom: DS_SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.FEATURED_TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 12,
    color: DS_COLORS.FEATURED_TEXT_SECONDARY,
    marginTop: 6,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: DS_SPACING.md,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackedAvatar: {
    borderWidth: 1,
    borderColor: DS_COLORS.FEATURED_DARK_BG,
    borderRadius: 999,
  },
  socialText: {
    flex: 1,
    fontSize: 12,
    color: DS_COLORS.FEATURED_TEXT_SECONDARY,
  },
  cta: {
    marginTop: DS_SPACING.lg,
    paddingVertical: 14,
    borderRadius: DS_RADIUS.PILL,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_COLORS.ACCENT,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_ON_ACCENT,
    letterSpacing: 0.2,
  },
});
