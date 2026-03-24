import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MoreHorizontal, Share2 } from "lucide-react-native";
import type { ChallengeDetailFromApi } from "@/types";
import { DS_COLORS } from "@/lib/design-system";
import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";
import { InfoChip } from "@/components/challenge/challengeInfoChip";

type DifficultyPill = { bg: string; text: string };

type Props = {
  headerGradientColors: readonly [string, string];
  isDaily: boolean;
  isJoined: boolean;
  challenge: ChallengeDetailFromApi;
  durationLabel: string;
  userStreak: number;
  userCurrentDay: number;
  difficulty: string;
  difficultyLabel: string;
  difficultyPillStyle: DifficultyPill;
  visibilityLabel: string | null;
  visibilityIcon: React.ReactNode;
  eyebrowLabel: string | null;
  referrerLabel: string | null;
  subtitleColor: string;
  onBack: () => void;
  onShare: () => void;
  onMore: () => void;
};

export const ChallengeHero = React.memo(function ChallengeHero({
  headerGradientColors,
  isDaily,
  isJoined,
  challenge,
  durationLabel,
  userStreak,
  userCurrentDay,
  difficulty,
  difficultyLabel,
  difficultyPillStyle,
  visibilityLabel,
  visibilityIcon,
  eyebrowLabel,
  referrerLabel,
  subtitleColor,
  onBack,
  onShare,
  onMore,
}: Props) {
  return (
    <LinearGradient colors={headerGradientColors} style={[s.heroHeader, isDaily && s.heroHeader24h]}>
      <SafeAreaView edges={["top"]} style={s.heroSafeArea}>
        <View style={s.topNav}>
          <TouchableOpacity
            style={[s.backPill, isDaily && s.backPill24h]}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={DS_COLORS.white} />
          </TouchableOpacity>
          <Text style={[s.topNavTitle, isDaily && s.topNavTitle24h]}>Challenge</Text>
          <View style={s.heroActions}>
            <TouchableOpacity
              style={[s.morePill, isDaily && s.backPill24h]}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={onShare}
              accessible
              accessibilityLabel="Share this challenge"
              accessibilityRole="button"
            >
              <Share2 size={18} color={DS_COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.morePill, isDaily && s.backPill24h]}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={onMore}
              accessible
              accessibilityLabel="More options"
              accessibilityRole="button"
            >
              <MoreHorizontal size={20} color={DS_COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.heroContent}>
          {isJoined ? (
            <View style={s.activeBadge}>
              <View style={s.activeDot} />
              <Text style={s.activeBadgeText}>ACTIVE</Text>
            </View>
          ) : null}
          {eyebrowLabel != null && (
            <View style={s.dailyLabel}>
              <Text style={s.dailyLabelText}>{eyebrowLabel}</Text>
            </View>
          )}
          <Text style={s.heroTitle}>{challenge.title}</Text>
          <Text style={[s.heroTagline, { color: subtitleColor }]} numberOfLines={2}>
            {challenge.short_hook || challenge.description}
          </Text>
          {referrerLabel ? <Text style={s.referrerLabel}>{referrerLabel}</Text> : null}
          <View style={s.chipRow}>
            <InfoChip label={durationLabel} dark />
            {isJoined && !isDaily && (
              <>
                <InfoChip label={`${userStreak}-day streak`} dark />
                <InfoChip label={`Day ${userCurrentDay} / ${challenge.duration_days}`} dark />
              </>
            )}
            <View style={[s.difficultyPill, { backgroundColor: difficultyPillStyle.bg }]}>
              <Text style={[s.difficultyPillText, { color: difficultyPillStyle.text }]}>
                {difficulty === "hard" || difficulty === "extreme" ? `${difficultyLabel} Mode` : difficultyLabel}
              </Text>
            </View>
            {visibilityLabel && (
              <View
                style={[
                  s.infoChip,
                  s.visibilityChip,
                  { borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.15)" },
                ]}
              >
                {visibilityIcon}
                <Text style={s.infoChipText}>{visibilityLabel}</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
});
