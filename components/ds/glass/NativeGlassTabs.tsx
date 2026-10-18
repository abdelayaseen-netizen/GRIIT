/**
 * Build 92 01.2 · flag-on tab bar (FLAGS.LIQUID_GLASS). Port of
 * design/handoff/b92/part0-liquid-glass/app/-tabs-/_layout.tsx onto expo-router 6.0.24
 * (Expo SDK 54) `expo-router/unstable-native-tabs`.
 *
 * Verified against the installed package: NativeTabs, NativeTabs.Trigger, Icon (sf / src),
 * Label, minimizeBehavior ("onScrollDown" / "never"), iconColor, labelStyle exist.
 * NOT in this version: a bottom accessory ("+ Create" while shrunk). Until it exists the
 * Create tab is the only Create entry; while the bar is shrunk, Create is two taps.
 *
 * Icons: SF Symbols from the Part 0 mapping table (tab bar only). The Lucide-as-template-
 * image path needs PNG assets the repo does not ship; see docs/reports/build92.md.
 * Create: the `create` route opens the chooser on focus and returns to the previous tab
 * (app/(tabs)/create.tsx), because native triggers have no onPress to intercept.
 */
import React from "react";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { DS_V3 } from "@/lib/design-system";
import { GLASS_ACCENT } from "@/lib/glass";
import { useReduceMotion } from "./useGlass";

/** Lucide (shipped) -> SF Symbol, tab bar only. */
export const TAB_SF = {
  home: "house",
  discover: "safari",
  create: "plus.circle",
  activity: "flame",
  profile: "person",
} as const;

export default function NativeGlassTabs() {
  const reduceMotion = useReduceMotion();
  return (
    <NativeTabs
      minimizeBehavior={reduceMotion ? "never" : "onScrollDown"}
      iconColor={{ default: DS_V3.color.textSecondary, selected: GLASS_ACCENT.activeTabIcon }}
      labelStyle={{
        default: { color: DS_V3.color.textSecondary, fontWeight: "500" },
        selected: { color: GLASS_ACCENT.activeTabLabel, fontWeight: "500" },
      }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={TAB_SF.home} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="discover">
        <Icon sf={TAB_SF.discover} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create" disablePopToTop disableScrollToTop>
        <Icon sf={TAB_SF.create} />
        <Label>Create</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <Icon sf={TAB_SF.activity} />
        <Label>Activity</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={TAB_SF.profile} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="teams" hidden />
    </NativeTabs>
  );
}
