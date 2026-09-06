/**
 * ProofImage — 01_components.md "ProofImage" and 03_media.md request sizes
 * Laws: 13 (every proof 4:5, three sizes), 14 (text on a scrim), 15 (missing is
 * canvas + title; loading is blurhash). radius.card for feed and card;
 * radius.thumb (tokens.ts:83 / 03_media.md:62) for thumb.
 *
 * Fallback override: 01_components.md:166 says missing ground is canvas.
 * Canvas on canvas is invisible in a grid of fallbacks (Discover, four cards),
 * so the missing state is surface + 1pt border at the same radius, title
 * bodyStrong textPrimary at the bottom left with space.gutter padding.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { DS_V3 } from "@/lib/design-system";
import Stamp, { type StampLabel } from "./Stamp";

export type ProofImageSize = "feed" | "card" | "thumb";

export const PROOF_REQUEST_WIDTH: Record<ProofImageSize, number> = {
  feed: 1080,
  card: 540,
  thumb: 336,
};

export type ProofImageProps = {
  uri?: string | null;
  source?: string | number | { uri: string } | null;
  blurhash?: string;
  title?: string;
  caption?: string;
  size?: ProofImageSize;
  recyclingKey?: string;
  scrim?: boolean;
  stamp?: boolean | StampLabel;
};

function canvasAlpha(alpha: number): string {
  const hex = DS_V3.color.canvas;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function proofRequestSource(
  input: string | number | { uri: string } | null | undefined,
  size: ProofImageSize
): string | number | { uri: string } | null {
  if (input == null) return null;
  if (typeof input === "number") return input;
  const raw = typeof input === "string" ? input : input.uri;
  if (!/^https?:\/\//i.test(raw)) return input;
  try {
    const url = new URL(raw);
    url.searchParams.set("w", String(PROOF_REQUEST_WIDTH[size]));
    return url.toString();
  } catch {
    return raw;
  }
}

export default function ProofImage({
  uri,
  source,
  blurhash,
  title,
  caption,
  size = "feed",
  recyclingKey,
  scrim,
  stamp,
}: ProofImageProps) {
  const resolved = source ?? uri ?? null;
  const request = proofRequestSource(resolved, size);
  const missing = request == null;
  const inset = missing
    ? DS_V3.space.gutter
    : size === "feed"
      ? DS_V3.space.lg
      : DS_V3.space.md;
  const showScrim = Boolean(scrim || title || caption || stamp);
  const stampLabel: StampLabel | null =
    stamp === true ? "Verified" : stamp === false || stamp == null ? null : stamp;
  const imageSource =
    request == null
      ? null
      : typeof request === "string"
        ? { uri: request }
        : request;

  return (
    <View
      style={[
        styles.frame,
        {
          borderRadius: size === "thumb" ? DS_V3.radius.thumb : DS_V3.radius.card,
        },
        missing ? styles.fallbackFrame : null,
      ]}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
          placeholder={blurhash ? { blurhash } : undefined}
          recyclingKey={recyclingKey ?? (typeof resolved === "string" ? `${resolved}:${size}` : undefined)}
          accessibilityLabel={title ?? "Proof"}
        />
      ) : (
        <View style={styles.fallback} />
      )}
      {imageSource && showScrim ? (
        <LinearGradient
          colors={[canvasAlpha(0), canvasAlpha(0.6)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scrim}
        />
      ) : null}
      {title || caption ? (
        <View style={[styles.copy, { left: inset, right: inset, bottom: inset }]}>
          {title ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      ) : null}
      {stampLabel && imageSource ? (
        <View style={[styles.stamp, { right: inset, bottom: inset }]}>
          <Stamp label={stampLabel} onInk />
        </View>
      ) : null}
    </View>
  );
}

const PT = DS_V3.space.xs / 4;

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 4 / 5,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
    backgroundColor: DS_V3.color.canvas,
  },
  fallbackFrame: {
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: DS_V3.color.surface,
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  copy: {
    position: "absolute",
  },
  title: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  stamp: {
    position: "absolute",
  },
});
