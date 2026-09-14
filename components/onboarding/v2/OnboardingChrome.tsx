/**
 * Shared chrome for onboarding screens 2 to 9. Welcome does not use it.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, ChevronLeft } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { ONBOARDING_V2_PROGRESS_SEGMENTS } from "@/lib/onboarding-v2-routing";

const PT = DS_V3.space.xs / 4;
const PT_SELECTED = PT * 1.5;
const BAR = DS_V3.space.xs;
const FOOTER_BOTTOM = DS_V3.space.section - DS_V3.space.xs;
const TITLE_TOP = DS_V3.space.lg + DS_V3.space.sm;
const CHECK = DS_V3.space.gutter;
const ICON = DS_V3.space.xs * 6;
const ROW_PAD_Y = DS_V3.space.md + DS_V3.space.xs / 2;

export const CHROME_STEPS = ONBOARDING_V2_PROGRESS_SEGMENTS;

export function PositionBar({ step }: { step: number }) {
  return (
    <View style={styles.bar} accessibilityRole="progressbar">
      {Array.from({ length: CHROME_STEPS }, (_, i) => (
        <View key={i} style={[styles.seg, i <= step ? styles.segOn : styles.segOff]} />
      ))}
    </View>
  );
}

export function TextLink({
  label,
  tone = DS_V3.color.textSecondary,
  onPress,
}: {
  label: string;
  tone?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text style={[styles.linkTxt, { color: tone }]}>{label}</Text>
    </Pressable>
  );
}

export function OptionRow({
  title,
  subtitle,
  selected,
  dimmed,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected?: boolean;
  dimmed?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityState={{ selected: !!selected, disabled: !!dimmed }}
      disabled={dimmed}
      onPress={dimmed ? undefined : onPress}
      style={({ pressed }) => [
        styles.option,
        selected ? styles.optionOn : styles.optionOff,
        dimmed && styles.dim,
        !dimmed && pressed && styles.pressed,
      ]}
    >
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>
      {selected ? <Check size={CHECK} color={DS_V3.color.brandText} /> : null}
    </Pressable>
  );
}

export function OnboardingScreen({
  step,
  onBack,
  skipLabel,
  onSkip,
  title,
  subtitle,
  children,
  footer,
}: {
  step: number;
  onBack?: () => void;
  skipLabel?: string;
  onSkip?: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
        >
          <ChevronLeft size={ICON} color={DS_V3.color.textPrimary} />
        </Pressable>
        {skipLabel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={skipLabel}
            onPress={onSkip}
            style={({ pressed }) => [styles.skipHit, pressed && styles.pressed]}
          >
            <Text style={styles.skip}>{skipLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.hit} />
        )}
      </View>
      <PositionBar step={step} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export function ChromePrimary({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return <Button label={label} disabled={disabled} onPress={onPress} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  nav: {
    height: DS_V3.size.tap,
    paddingLeft: DS_V3.space.sm,
    paddingRight: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hit: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  skipHit: {
    minHeight: DS_V3.size.tap,
    paddingHorizontal: DS_V3.space.md,
    alignItems: "center",
    justifyContent: "center",
  },
  skip: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  bar: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.xs,
    flexDirection: "row",
    gap: DS_V3.space.xs,
  },
  seg: {
    flex: 1,
    height: BAR,
    borderRadius: DS_V3.radius.pill,
  },
  segOn: {
    backgroundColor: DS_V3.color.brand,
  },
  segOff: {
    backgroundColor: DS_V3.color.border,
  },
  scroll: {
    flex: 1,
  },
  scrollBody: {
    paddingBottom: DS_V3.size.button + DS_V3.space.lg + FOOTER_BOTTOM,
  },
  titleBlock: {
    paddingTop: TITLE_TOP,
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  subtitle: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    borderTopWidth: PT,
    borderTopColor: DS_V3.color.border,
    paddingTop: DS_V3.space.lg,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: FOOTER_BOTTOM,
    gap: DS_V3.space.xs,
    backgroundColor: DS_V3.color.canvas,
  },
  link: {
    minHeight: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTxt: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
  },
  option: {
    borderRadius: DS_V3.radius.card,
    paddingVertical: ROW_PAD_Y,
    paddingHorizontal: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  optionOff: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  optionOn: {
    backgroundColor: DS_V3.color.brandTint,
    borderWidth: PT_SELECTED,
    borderColor: DS_V3.color.brand,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  optionSub: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  dim: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
