import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  Flame,
  Medal,
  Star,
  Sun,
  Target,
  Trophy,
  Zap,
  Lock,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { BadgeDetailPayload } from "@/components/profile/BadgeDetailModal";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";

export type BadgeGridRow = {
  id: string;
  name: string;
  iconName: string;
  unlocked: boolean;
};

export type BadgesGridProps = {
  badges: BadgeGridRow[];
  onBadgePress: (payload: BadgeDetailPayload) => void;
};

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  flame: Flame,
  trophy: Trophy,
  star: Star,
  medal: Medal,
  sun: Sun,
  target: Target,
};

export function BadgesGrid({ badges, onBadgePress }: BadgesGridProps) {
  return (
    <View style={styles.wrap}>
      {badges.map((b) => {
        const Ico = ICONS[b.iconName] ?? Zap;
        return (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            accessibilityLabel={
              b.unlocked ? `${b.name} badge unlocked, view details` : `${b.name} badge locked`
            }
            onPress={() =>
              onBadgePress({
                id: b.id,
                name: b.name,
                icon: b.iconName,
                color: "coral",
                progress: b.unlocked ? 1 : 0,
                total: 1,
              })
            }
            style={styles.tile}
          >
            <View
              style={[styles.icoWrap, !b.unlocked && styles.icoWrapMuted]}
              accessibilityElementsHidden
            >
              {!b.unlocked ? (
                <Lock size={20} color={DS_COLORS.TEXT_MUTED} strokeWidth={2} />
              ) : (
                <Ico size={22} color={DS_COLORS.ACCENT} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.name}>{b.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.sm,
    justifyContent: "center",
  },
  tile: {
    width: "30%",
    flexGrow: 1,
    minHeight: 84,
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: DS_SPACING.xs,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
  },
  icoWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.xs + 2,
  },
  icoWrapMuted: {
    backgroundColor: DS_COLORS.BG_CARD_TINTED,
  },
  name: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS.TEXT_PRIMARY,
    textAlign: "center",
    lineHeight: 12,
  },
});
