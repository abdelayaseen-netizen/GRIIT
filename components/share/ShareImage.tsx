/**
 * One share card at 1080 × 1920. The sheet scales this same component for the preview
 * and captures it with view-shot for every target.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Check, Flame } from "lucide-react-native";
import {
  SHARE_H,
  SHARE_W,
  buildSharePaint,
  type GridCell,
  type ShareCardInput,
  type ShareItem,
  type ShareText,
} from "@/lib/share-image";

function TextRun({ item, shadow }: { item: ShareText; shadow: { color: string; radius: number } | null }) {
  const shadowStyle = shadow
    ? {
        textShadowColor: shadow.color,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: shadow.radius,
      }
    : null;
  return (
    <Text
      style={[
        {
          color: item.color,
          fontSize: item.size,
          lineHeight: item.line,
          fontWeight: item.weight,
          letterSpacing: item.tracking,
          fontVariant: item.weight === "800" || item.weight === "700" ? ["tabular-nums"] : undefined,
        },
        shadowStyle,
      ]}
    >
      {item.caps ? item.text.toUpperCase() : item.text}
    </Text>
  );
}

function Grid({
  cells,
  cell,
  gap,
  radius,
  accent,
  sub,
  line,
}: {
  cells: GridCell[];
  cell: number;
  gap: number;
  radius: number;
  accent: string;
  sub: string;
  line: string;
}) {
  return (
    <View style={[styles.grid, { gap }]}>
      {cells.map((state, i) => {
        const secured = state === "secured" || state === "today";
        const held = state === "held";
        const missed = state === "missed";
        const today = state === "today";
        return (
          <View
            key={`${state}-${i}`}
            accessible
            accessibilityLabel={
              missed ? "Missed day" : state === "future" ? "Future day" : state === "held" ? "Held day" : "Secured day"
            }
            style={{
              width: cell,
              height: cell,
              borderRadius: radius,
              backgroundColor: secured ? accent : held ? hexAlpha(sub) : state === "future" ? line : "transparent",
              borderWidth: missed ? 3 : today ? 6 : 0,
              borderColor: missed ? sub : accent,
            }}
          />
        );
      })}
    </View>
  );
}

function hexAlpha(color: string): string {
  if (color.startsWith("rgba") || color.startsWith("rgb")) return color;
  return `${color}99`;
}

function ItemView({ item, shadow }: { item: ShareItem; shadow: { color: string; radius: number } | null }) {
  if (item.kind === "text") return <TextRun item={item} shadow={shadow} />;
  if (item.kind === "baseline") {
    return (
      <View style={styles.baseline}>
        <TextRun item={item.lead} shadow={shadow} />
        <TextRun item={item.rest} shadow={shadow} />
      </View>
    );
  }
  if (item.kind === "row") {
    return (
      <View style={[styles.row, { gap: item.gap }]}>
        {item.items.map((child, i) => (
          <ItemView key={i} item={child} shadow={shadow} />
        ))}
      </View>
    );
  }
  if (item.kind === "seal") {
    return (
      <View style={styles.sealRow}>
        <View style={[styles.seal, { borderColor: hexAlpha(item.color) }]}>
          <Camera size={32} color={item.color} />
        </View>
        <TextRun item={{ kind: "text", text: item.label, size: 36, line: 44, weight: "500", color: item.color }} shadow={shadow} />
      </View>
    );
  }
  if (item.kind === "check") {
    return (
      <View style={[styles.check, { width: item.size, height: item.size, borderRadius: item.size / 2, backgroundColor: item.disc }]}>
        <Check size={item.iconSize} color={item.icon} strokeWidth={3} />
      </View>
    );
  }
  if (item.kind === "flame") {
    return <Flame size={item.size} color={item.color} fill={item.color} />;
  }
  if (item.kind === "grid") {
    return (
      <Grid
        cells={item.cells}
        cell={item.cell}
        gap={item.gap}
        radius={item.radius}
        accent={item.accent}
        sub={item.sub}
        line={item.line}
      />
    );
  }
  return (
    <View style={[styles.link, { backgroundColor: item.plate }]}>
      {item.title ? (
        <TextRun item={{ kind: "text", text: item.title, size: 34, line: 42, weight: "500", color: item.sub }} shadow={shadow} />
      ) : null}
      {item.link ? (
        <TextRun item={{ kind: "text", text: item.link, size: item.title ? 54 : 34, line: item.title ? 64 : 42, weight: "500", color: item.fg }} shadow={shadow} />
      ) : null}
    </View>
  );
}

export default function ShareImage({ input }: { input: ShareCardInput }) {
  const paint = buildSharePaint(input);
  return (
    <View
      collapsable={false}
      style={{
        width: paint.width,
        height: paint.height,
        backgroundColor: paint.background,
      }}
    >
      {paint.photo && input.photoUri ? (
        <Image source={{ uri: input.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      {paint.scrim ? (
        <LinearGradient
          colors={["rgba(15,15,15,0)", "rgba(15,15,15,0.85)"]}
          style={styles.scrim}
        />
      ) : null}
      {paint.wordmark ? (
        <Text
          style={{
            position: "absolute",
            left: paint.wordmark.x,
            top: paint.wordmark.y,
            color: paint.wordmark.color,
            fontSize: paint.wordmark.size,
            lineHeight: paint.wordmark.size,
            fontWeight: "600",
            letterSpacing: paint.wordmark.tracking,
          }}
        >
          {paint.wordmark.text}
        </Text>
      ) : null}
      <View
        style={{
          position: "absolute",
          left: paint.block.x,
          top: paint.block.y,
          width: paint.block.w,
          height: paint.block.h,
          justifyContent: "flex-end",
        }}
      >
        <View
          style={[
            paint.block.plate
              ? {
                  backgroundColor: paint.block.plate.color,
                  borderRadius: paint.block.plate.radius,
                  padding: paint.block.plate.pad,
                  gap: paint.block.gap,
                }
              : { gap: paint.block.gap },
          ]}
        >
          {paint.block.items.map((item, i) => (
            <ItemView key={i} item={item} shadow={paint.block.shadow} />
          ))}
        </View>
      </View>
    </View>
  );
}

export const SHARE_IMAGE_SIZE = { width: SHARE_W, height: SHARE_H };

const styles = StyleSheet.create({
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1100,
  },
  baseline: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 16,
    flexWrap: "wrap",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  sealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  seal: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  link: {
    borderRadius: 40,
    paddingVertical: 28,
    paddingHorizontal: 36,
    gap: 8,
    alignSelf: "stretch",
  },
});
