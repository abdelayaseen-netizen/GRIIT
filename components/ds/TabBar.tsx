/**
 * TabBar — build 92 Part 0 fallback bar (P0-12).
 * The JS tab bar used while FLAGS.LIQUID_GLASS is off, on iOS < 26 and with Reduce
 * Transparency: solid #1A1A1A pill with a 1 px #2A2A2A hairline. 5 tabs in order
 * Home, Discover, Create, Activity, Profile, in the shipped Lucide icons. Orange is
 * the active icon only; the active label is Text 1. Create opens the Create chooser
 * and never becomes the selected tab.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CirclePlus, Compass, Flame, Home, User } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_ACCENT, GLASS_FALLBACK, GLASS_STATE } from "@/lib/glass";
import { TAB_BAR_PILL_HEIGHT } from "@/lib/tab-bar-inset";

const ICON = DS_V3.space.xs * 6;
const BAR = TAB_BAR_PILL_HEIGHT;
const ITEM_H = DS_V3.size.avatar.md;

export type TabBarTab = "home" | "discover" | "create" | "activity" | "profile";

export type TabBarProps = {
  active: Exclude<TabBarTab, "create">;
  onTab: (tab: TabBarTab) => void;
  activityUnread?: boolean;
};

const TABS: { id: TabBarTab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "discover", label: "Discover", Icon: Compass },
  { id: "create", label: "Create", Icon: CirclePlus },
  { id: "activity", label: "Activity", Icon: Flame },
  { id: "profile", label: "Profile", Icon: User },
];

export default function TabBar({ active, onTab, activityUnread }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const below = Math.max(insets.bottom, DS_V3.space.md);
  return (
    <View
      style={[styles.dock, { paddingBottom: below }]}
      pointerEvents="box-none"
      testID="tab-bar"
    >
      <View style={[styles.under, { height: below }]} pointerEvents="none" />
      <View style={styles.pill}>
        {TABS.map((t) => (
          <TabItem
            key={t.id}
            tab={t}
            active={active === t.id}
            unread={t.id === "activity" && activityUnread === true}
            onPress={() => onTab(t.id)}
          />
        ))}
      </View>
    </View>
  );
}

function TabItem({
  tab,
  active,
  unread,
  onPress,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  unread?: boolean;
  onPress: () => void;
}) {
  const iconColor = active ? GLASS_ACCENT.activeTabIcon : DS_V3.color.textSecondary;
  const labelColor = active ? GLASS_ACCENT.activeTabLabel : DS_V3.color.textSecondary;
  const Icon = tab.Icon;
  return (
    <Pressable
      testID={`tab-${tab.id}`}
      accessibilityRole="button"
      accessibilityLabel={unread ? `${tab.label}, unread` : tab.label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
    >
      <View>
        <Icon size={ICON} color={iconColor} />
        {unread ? <View style={styles.dot} accessibilityLabel="Unread" /> : null}
      </View>
      <Text
        style={[
          styles.label,
          {
            color: labelColor,
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
  },
  under: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DS_V3.color.canvas,
  },
  pill: {
    height: BAR,
    backgroundColor: GLASS_FALLBACK.fill,
    borderWidth: GLASS_FALLBACK.hairlineWidth,
    borderColor: GLASS_FALLBACK.hairline,
    borderRadius: DS_V3.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DS_V3.space.xs,
  },
  item: {
    flex: 1,
    minWidth: DS_V3.size.tap,
    height: ITEM_H,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.xs,
  },
  label: {
    fontSize: DS_V3.type.label.fontSize,
    lineHeight: DS_V3.type.label.lineHeight,
  },
  pressed: {
    backgroundColor: GLASS_STATE.pressed,
    transform: [{ scale: GLASS_STATE.pressedScale }],
  },
  dot: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_V3.color.textPrimary,
  },
});
