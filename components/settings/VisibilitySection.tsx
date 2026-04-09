import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";
import { styles } from "@/components/settings/settings-styles";

type VisibilityValue = "public" | "friends" | "private";

function VisibilitySubsection({
  label,
  value,
  onChange,
}: {
  label: string;
  value: VisibilityValue;
  onChange: (v: VisibilityValue) => void;
}) {
  const options: { key: VisibilityValue; label: string }[] = [
    { key: "public", label: "Public" },
    { key: "friends", label: "Friends" },
    { key: "private", label: "Private" },
  ];
  return (
    <View style={visibilityStyles.wrap}>
      <Text style={[visibilityStyles.label, { color: DS_COLORS.textPrimary }]}>{label}</Text>
      <View style={visibilityStyles.pillRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              visibilityStyles.pill,
              value === opt.key && { backgroundColor: DS_COLORS.textPrimary },
              value !== opt.key && { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border },
            ]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
            accessibilityLabel={`Set ${label} visibility to ${opt.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: value === opt.key }}
          >
            <Text style={[visibilityStyles.pillText, { color: value === opt.key ? DS_COLORS.white : DS_COLORS.textPrimary }]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[visibilityStyles.hint, { color: DS_COLORS.textMuted }]}>
        {value === "public" ? "Anyone can see" : value === "friends" ? "Only friends" : "Only you"}
      </Text>
    </View>
  );
}

const visibilityStyles = StyleSheet.create({
  wrap: { marginBottom: DS_SPACING.lg },
  label: {
    fontSize: DS_TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    marginBottom: DS_SPACING.sm,
  },
  pillRow: { flexDirection: "row", gap: DS_SPACING.sm },
  pill: {
    flex: 1,
    height: 40,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: DS_BORDERS.width,
  },
  pillText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "500" },
  hint: { fontSize: DS_TYPOGRAPHY.metadata.fontSize, marginTop: DS_SPACING.sm },
});

export interface VisibilitySectionProps {
  profileVisibility: VisibilityValue;
  challengeVisibility: VisibilityValue;
  activityVisibility: VisibilityValue;
  onProfileVisibilityChange: (v: VisibilityValue) => void | Promise<void>;
  onChallengeVisibilityChange: (v: VisibilityValue) => void;
  onActivityVisibilityChange: (v: VisibilityValue) => void;
}

export function VisibilitySection({
  profileVisibility,
  challengeVisibility,
  activityVisibility,
  onProfileVisibilityChange,
  onChallengeVisibilityChange,
  onActivityVisibilityChange,
}: VisibilitySectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitleLarge, { color: DS_COLORS.textPrimary }]}>👁 Privacy & Visibility</Text>
      </View>
      <Text style={[styles.privacyDesc, { color: DS_COLORS.textSecondary }]}>
        Control who sees your profile, challenges, and activity. Like TikTok privacy settings.
      </Text>
      <View style={styles.card}>
        <VisibilitySubsection label="Profile Visibility" value={profileVisibility} onChange={onProfileVisibilityChange} />
        <View style={styles.cardDivider} />
        <VisibilitySubsection label="Challenge Visibility" value={challengeVisibility} onChange={onChallengeVisibilityChange} />
        <View style={styles.cardDivider} />
        <VisibilitySubsection label="Activity Visibility" value={activityVisibility} onChange={onActivityVisibilityChange} />
      </View>
    </View>
  );
}
