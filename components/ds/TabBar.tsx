/**
 * TabBar — 01_components.md "TabBar"
 * Laws: 6 (no brand fill on FAB or active tab), 8 (root chrome).
 * Frame 01: surface pill, 1pt border, textSecondary inactive, brandText active,
 * FAB surface circle, 1pt border, brandText plus.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Compass, Flame, Home, Plus, User } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 6;
const BAR = DS_V3.space.xs * 16;
const ITEM_W = DS_V3.space.gutter * 3;
const FAB = DS_V3.size.avatar.md;

export type TabBarTab = "home" | "discover" | "activity" | "profile";

export type TabBarProps = {
  active: TabBarTab;
  onTab: (tab: TabBarTab) => void;
  onFab: () => void;
};

const TABS: { id: TabBarTab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "discover", label: "Discover", Icon: Compass },
  { id: "activity", label: "Activity", Icon: Flame },
  { id: "profile", label: "Profile", Icon: User },
];

export default function TabBar({ active, onTab, onFab }: TabBarProps) {
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <View style={styles.dock} pointerEvents="box-none">
      <View style={styles.pill}>
        {left.map((t) => (
          <TabItem key={t.id} tab={t} active={active === t.id} onPress={() => onTab(t.id)} />
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create"
          onPress={onFab}
          style={({ pressed }) => [styles.fab, pressed ? styles.pressed : null]}
        >
          <Plus size={ICON} color={DS_V3.color.brandText} />
        </Pressable>
        {right.map((t) => (
          <TabItem key={t.id} tab={t} active={active === t.id} onPress={() => onTab(t.id)} />
        ))}
      </View>
    </View>
  );
}

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const color = active ? DS_V3.color.brandText : DS_V3.color.textSecondary;
  const Icon = tab.Icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.item}
    >
      <Icon size={ICON} color={color} />
      <Text
        style={[
          styles.label,
          {
            color,
            fontWeight: active ? DS_V3.type.bodyStrong.fontWeight : DS_V3.type.caption.fontWeight,
          },
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: DS_V3.space.md,
    paddingRight: DS_V3.space.md,
    paddingBottom: DS_V3.space.md,
  },
  pill: {
    height: BAR,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_V3.space.sm,
  },
  item: {
    width: ITEM_W,
    height: FAB,
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.xs,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
  },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
