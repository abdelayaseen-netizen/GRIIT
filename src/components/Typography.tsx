import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { typography } from "@/src/theme/typography";
import { colors } from "@/src/theme/colors";

type Tone = "primary" | "muted" | "subtle" | "inverse";

const colorMap: Record<Tone, string> = {
  primary: colors.text,
  muted: colors.textMuted,
  subtle: colors.textSubtle,
  inverse: colors.white,
};

export function H0(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.h0, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function H1(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.h1, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function H2(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.h2, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function H3(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.h3, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function Body(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.body, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function Body2(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.body2, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function Caption(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.caption, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

export function Micro(props: TextProps & { tone?: Tone }) {
  const { tone = "primary", style, ...rest } = props;
  return (
    <Text
      style={[styles.micro, { color: colorMap[tone] }, style]}
      {...rest}
    />
  );
}

const fontFamily = {
  extraBold: "Inter_800ExtraBold",
  semiBold: "Inter_600SemiBold",
  medium: "Inter_500Medium",
};

const styles = StyleSheet.create({
  h0: { ...typography.h0, fontFamily: fontFamily.extraBold },
  h1: { ...typography.h1, fontFamily: fontFamily.extraBold },
  h2: { ...typography.h2, fontFamily: fontFamily.extraBold },
  h3: { ...typography.h3, fontFamily: fontFamily.extraBold },
  body: { ...typography.body, fontFamily: fontFamily.medium },
  body2: { ...typography.body2, fontFamily: fontFamily.medium },
  caption: { ...typography.caption, fontFamily: fontFamily.semiBold },
  micro: { ...typography.micro, fontFamily: fontFamily.semiBold },
});
