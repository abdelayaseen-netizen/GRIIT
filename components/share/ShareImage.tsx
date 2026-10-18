/**
 * One share card at 1080 × 1920. The sheet scales this same component for the preview
 * and captures it with view-shot for every target.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Check, Flame, ShieldCheck } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import {
  SHARE_H,
  SHARE_W,
  buildSharePaint,
  type GridCell,
  type ShareCardInput,
  type ShareItem,
  type SharePaint,
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
          // Always an array: a Text that goes from ["tabular-nums"] to undefined when the card
          // swaps styles makes RN's processFontVariant split null (build 92 05.1 render error).
          fontVariant: item.weight === "800" || item.weight === "700" ? ["tabular-nums"] : [],
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

export function ShareLegend({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 28, lineHeight: 34 }}>Done · Missed · Held · To come · Today</Text>;
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
  if (item.kind === "mark") {
    const Icon = item.label === "Verified" ? ShieldCheck : Check;
    return (
      <View style={styles.markRow} accessible accessibilityLabel={item.label}>
        <Icon size={item.size} color={item.color} strokeWidth={2.5} />
        <TextRun item={{ kind: "text", text: item.label, size: item.size, line: Math.round(item.size * 1.25), weight: "500", color: item.color }} shadow={shadow} />
      </View>
    );
  }
  if (item.kind === "week") {
    const letters = ["M", "T", "W", "T", "F", "S", "S"];
    const gap = Math.round(item.size * 0.22);
    return (
      <View style={{ gap: Math.round(item.size * 0.18) }}>
        <View style={[styles.weekRow, { gap }]}>
          {letters.map((letter, i) => (
            <Text
              key={`${letter}-${i}`}
              style={{ width: item.size, textAlign: "center", color: item.letter, fontSize: Math.round(item.size * 0.3), lineHeight: Math.round(item.size * 0.36), fontWeight: "500" }}
            >
              {letter}
            </Text>
          ))}
        </View>
        <View style={[styles.weekRow, { gap }]}>
          {item.days.map((done, i) => (
            <View
              key={i}
              accessible
              accessibilityLabel={done ? "Done day" : "Open day"}
              style={{
                width: item.size,
                height: item.size,
                borderRadius: item.size / 2,
                backgroundColor: done ? item.done : "transparent",
                borderWidth: done ? 0 : Math.max(3, Math.round(item.size * 0.04)),
                borderColor: item.empty,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {done ? <Check size={Math.round(item.size * 0.5)} color={item.tick} strokeWidth={3} /> : null}
            </View>
          ))}
        </View>
      </View>
    );
  }
  if (item.kind === "glowflame") {
    return (
      <View
        style={
          item.glow
            ? { shadowColor: item.glow, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: item.size * 0.35 }
            : null
        }
      >
        <Flame size={item.size} color={item.color} fill={item.color} />
      </View>
    );
  }
  if (item.kind === "ring") {
    const r = (item.size - item.width) / 2;
    const c = 2 * Math.PI * r;
    return (
      <View style={{ width: item.size, height: item.size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={item.size} height={item.size} style={StyleSheet.absoluteFill}>
          <Circle cx={item.size / 2} cy={item.size / 2} r={r} stroke={item.track} strokeWidth={item.width} fill="none" />
          <Circle
            cx={item.size / 2}
            cy={item.size / 2}
            r={r}
            stroke={item.stroke}
            strokeWidth={item.width}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - item.progress)}
            transform={`rotate(-90 ${item.size / 2} ${item.size / 2})`}
          />
        </Svg>
        <View style={{ alignItems: "center" }}>
          {item.items.map((child, i) => (
            <ItemView key={i} item={child} shadow={shadow} />
          ))}
        </View>
      </View>
    );
  }
  if (item.kind === "grid") {
    return (
      <View style={{ gap: 16 }}>
        <Grid
          cells={item.cells}
          cell={item.cell}
          gap={item.gap}
          radius={item.radius}
          accent={item.accent}
          sub={item.sub}
          line={item.line}
        />
        <ShareLegend color={item.sub} />
      </View>
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
        <Image
          source={{ uri: input.photoUri }}
          style={
            paint.photoFrame
              ? {
                  position: "absolute",
                  left: paint.photoFrame.x,
                  top: paint.photoFrame.y,
                  width: paint.photoFrame.w,
                  height: paint.photoFrame.h,
                  borderRadius: paint.photoFrame.radius,
                }
              : StyleSheet.absoluteFill
          }
          contentFit="cover"
        />
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
          justifyContent: paint.block.justify,
        }}
      >
        <BlockBody paint={paint} />
      </View>
    </View>
  );
}

function BlockBody({ paint }: { paint: SharePaint }) {
  return (
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
  );
}

/**
 * Build 92 05.5: the sticker block alone on a transparent ground, sized to its content.
 * This is the PNG that Copy sticker and the Instagram sticker get for the transparent styles.
 */
export function ShareStickerBlock({ input }: { input: ShareCardInput }) {
  const paint = buildSharePaint(input);
  const pad = paint.block.shadow ? paint.block.shadow.radius * 2 : 0;
  return (
    <View collapsable={false} style={{ width: paint.block.w + pad * 2, padding: pad, backgroundColor: "transparent" }}>
      <BlockBody paint={paint} />
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
  markRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  weekRow: { flexDirection: "row", alignItems: "center" },
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
