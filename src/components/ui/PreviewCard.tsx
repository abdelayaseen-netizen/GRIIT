import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, radius } from "@/src/theme/tokens";

type Props = {
  title: string;
  subtitle?: string;
  tags?: string[];
  children?: React.ReactNode;
};

export function PreviewCard({ title, subtitle, tags, children }: Props) {
  const tagList = tags ?? [];
  return (
    <View style={st.card}>
      <Text style={st.title}>{title}</Text>
      {subtitle ? <Text style={st.subtitle}>{subtitle}</Text> : null}
      {tagList.length > 0 ? (
        <View style={st.tagRow}>
          {tagList.map((t) => (
            <View key={t} style={st.tag}>
              <Text style={st.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.previewCard,
    padding: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: typography.previewCardTitle.fontSize,
    fontWeight: typography.previewCardTitle.fontWeight,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.previewCardSubtitle.fontSize,
    color: colors.textSecondaryCreate,
    marginBottom: 12,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tag: {
    backgroundColor: colors.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: { fontSize: 12, color: colors.textSecondaryCreate },
});
