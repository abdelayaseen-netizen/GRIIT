/**
 * v37.1 stickers. 300pt, exported 3× PNG. Values come from the record.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import {
  STICKER_CONSISTENCY,
  STICKER_SECURED,
  STICKER_W,
  STICKER_WORDMARK,
  badgeHeadline,
  badgeTier,
  consistencyProofLine,
  fitNumeral,
  proofLabel,
  type ProofKind,
  type StickerBackground,
} from "@/lib/share-sticker";

const DISPLAY = DS_V3.type.number.fontFamily;
const INK = "rgba(15,15,15,0.9)";

function onClear(bg: StickerBackground): boolean {
  return bg !== "card";
}

function soft(bg: StickerBackground): string {
  return onClear(bg) ? DS_V3.color.textPrimary : DS_V3.color.textSecondary;
}

function typeShadow(bg: StickerBackground) {
  if (!onClear(bg)) return {};
  return {
    textShadowColor: INK,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  };
}

export function Wordmark({ bg }: { bg: StickerBackground }) {
  return (
    <View style={styles.wordRow}>
      <View style={[styles.wordBar, onClear(bg) ? styles.glyphShadow : null]} />
      <Text style={[styles.word, typeShadow(bg)]}>{STICKER_WORDMARK}</Text>
    </View>
  );
}

function Eyebrow({ bg, children }: { bg: StickerBackground; children: string }) {
  return <Text style={[styles.eyebrow, { color: soft(bg) }, typeShadow(bg)]}>{children}</Text>;
}

function ProofMark({ bg, proof }: { bg: StickerBackground; proof: ProofKind }) {
  if (proof === "self") {
    return <Text style={[styles.proofText, { color: soft(bg) }, typeShadow(bg)]}>{proofLabel(proof)}</Text>;
  }
  return (
    <View style={styles.proofRow}>
      <View style={[styles.disc, onClear(bg) ? styles.glyphShadow : null]}>
        <Check size={12} color={DS_V3.color.canvas} strokeWidth={3} />
      </View>
      <Text
        style={[
          styles.proofText,
          { color: onClear(bg) ? DS_V3.color.textPrimary : DS_V3.color.brandText, fontWeight: "500" },
          typeShadow(bg),
        ]}
      >
        {proofLabel(proof)}
      </Text>
    </View>
  );
}

function Shell({
  bg,
  photoUri,
  children,
}: {
  bg: StickerBackground;
  photoUri?: string | null;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.shell, bg === "card" ? styles.card : styles.clear]}>
      {bg === "photo" && photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      {bg === "photo" ? <View style={styles.photoScrim} /> : null}
      {children}
    </View>
  );
}

export function DaySticker(p: {
  bg: StickerBackground;
  challenge: string;
  day: number;
  durationDays: number;
  proof: ProofKind;
  status?: string;
  photoUri?: string | null;
}) {
  const n = Math.min(p.day, p.durationDays);
  const fill = p.durationDays > 0 ? (n / p.durationDays) * 100 : 0;
  return (
    <Shell bg={p.bg} photoUri={p.photoUri}>
      <Eyebrow bg={p.bg}>{p.challenge}</Eyebrow>
      <View style={styles.dayRow}>
        <Text
          style={[styles.dayN, { fontSize: fitNumeral(n), lineHeight: 56 }, typeShadow(p.bg)]}
          numberOfLines={1}
        >
          Day {n}
        </Text>
        <Text style={[styles.of, { color: soft(p.bg) }, typeShadow(p.bg)]}>of {p.durationDays}</Text>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: onClear(p.bg) ? "rgba(245,243,238,0.35)" : DS_V3.color.border },
        ]}
      >
        <View style={[styles.fill, { width: `${fill}%` }]} />
      </View>
      <View style={styles.foot}>
        <View style={styles.footLeft}>
          <Text style={[styles.secured, typeShadow(p.bg)]}>{p.status ?? STICKER_SECURED}</Text>
          <ProofMark bg={p.bg} proof={p.proof} />
        </View>
        <Wordmark bg={p.bg} />
      </View>
    </Shell>
  );
}

export function ConsistencySticker(p: {
  bg: StickerBackground;
  secured: number;
  closed: number;
  cameraSecured: number;
  last28: boolean[];
  photoUri?: string | null;
}) {
  const cells = p.last28.slice(-28);
  const line = consistencyProofLine({ secured: p.secured, cameraSecured: p.cameraSecured });
  return (
    <Shell bg={p.bg} photoUri={p.photoUri}>
      <Eyebrow bg={p.bg}>{STICKER_CONSISTENCY}</Eyebrow>
      <View style={styles.dayRow}>
        <Text style={[styles.dayN, { fontSize: 64, lineHeight: 56 }, typeShadow(p.bg)]}>{p.secured}</Text>
        <Text style={[styles.of, { color: soft(p.bg) }, typeShadow(p.bg)]}>of {p.closed} days secured</Text>
      </View>
      <View style={styles.grid}>
        {cells.map((s, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              s
                ? styles.cellOn
                : {
                    borderWidth: 1.5,
                    borderColor: onClear(p.bg) ? DS_V3.color.textPrimary : DS_V3.color.border,
                  },
            ]}
          />
        ))}
      </View>
      <View style={styles.foot}>
        <Text style={[styles.proofText, { color: soft(p.bg), flex: 1 }, typeShadow(p.bg)]}>{line}</Text>
        <Wordmark bg={p.bg} />
      </View>
    </Shell>
  );
}

export function BadgeSticker(p: {
  bg: StickerBackground;
  count: number;
  secured: number;
  byCamera: number;
  earnedOn: string;
  photoUri?: string | null;
}) {
  const t = badgeTier(p.count);
  const earned = true;
  const solid = t.fill === "solid";
  const size = 132;
  const inset = Math.round(size * 0.09);
  return (
    <Shell bg={p.bg} photoUri={p.photoUri}>
      <View style={styles.badgeCol}>
        <View
          style={[
            styles.stamp,
            {
              width: size,
              height: size,
              borderWidth: t.border,
              borderStyle: earned ? "solid" : "dashed",
              backgroundColor: solid ? DS_V3.color.brand : t.fill === "tint" ? DS_V3.color.brandTint : "transparent",
            },
          ]}
        >
          {Array.from({ length: t.rings }, (_, i) => (
            <View
              key={i}
              style={[
                styles.ring,
                {
                  top: inset * (i + 1),
                  right: inset * (i + 1),
                  bottom: inset * (i + 1),
                  left: inset * (i + 1),
                  borderRadius: Math.max(6, 20 - inset * (i + 1) * 0.6),
                  borderColor: solid ? DS_V3.color.canvas : DS_V3.color.brand,
                },
              ]}
            />
          ))}
          <Text style={[styles.stampN, { color: solid ? DS_V3.color.canvas : DS_V3.color.textPrimary }]}>
            {p.count}
          </Text>
          <Text style={[styles.stampDays, { color: solid ? DS_V3.color.canvas : DS_V3.color.brandText }]}>
            {p.count === 1 ? "DAY" : "DAYS"}
          </Text>
        </View>
        <Text style={[styles.badgeTitle, typeShadow(p.bg)]}>{badgeHeadline(p.count)}</Text>
        <Text style={[styles.proofText, { color: soft(p.bg) }, typeShadow(p.bg)]}>
          {p.secured} secured · {p.byCamera} by camera
        </Text>
        <Text style={[styles.proofText, { color: soft(p.bg) }, typeShadow(p.bg)]}>Earned {p.earnedOn}</Text>
        <Wordmark bg={p.bg} />
      </View>
    </Shell>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: STICKER_W,
    padding: 20,
    gap: 12,
    overflow: "hidden",
  },
  card: {
    backgroundColor: DS_V3.color.canvas,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
  },
  clear: {
    backgroundColor: "transparent",
    borderRadius: DS_V3.radius.card,
  },
  photoScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,15,15,0.35)",
  },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  wordBar: {
    width: 4,
    height: 15,
    borderRadius: 1,
    backgroundColor: DS_V3.color.brand,
  },
  glyphShadow: {
    shadowColor: INK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  word: {
    fontSize: 15,
    lineHeight: 16,
    fontWeight: "500",
    letterSpacing: 3,
    color: DS_V3.color.textPrimary,
  },
  eyebrow: {
    ...DS_V3.type.label,
    fontSize: 13,
    lineHeight: 16,
  },
  dayRow: { flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "nowrap" },
  dayN: {
    fontFamily: DISPLAY,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
    color: DS_V3.color.textPrimary,
  },
  of: { fontSize: 20, lineHeight: 24 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: DS_V3.color.brand },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 2 },
  footLeft: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  secured: { fontSize: 16, lineHeight: 20, fontWeight: "500", color: DS_V3.color.textPrimary },
  proofRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  disc: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  proofText: { fontSize: 16, lineHeight: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cell: { width: 34, height: 34, borderRadius: 6 },
  cellOn: { backgroundColor: DS_V3.color.textPrimary },
  badgeCol: { alignItems: "center", gap: 14 },
  stamp: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: DS_V3.color.brand,
  },
  ring: { position: "absolute", borderWidth: 1 },
  stampN: { fontSize: 45, lineHeight: 48, fontWeight: "500", fontVariant: ["tabular-nums"] },
  stampDays: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1.6,
  },
  badgeTitle: { fontSize: 24, lineHeight: 29, fontWeight: "500", color: DS_V3.color.textPrimary, textAlign: "center" },
});
