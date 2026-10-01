import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  Flag,
  FlagTriangleRight,
  RotateCcw,
  Sunrise,
  Users,
} from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Sheet from "@/components/ds/Sheet";
import {
  badgesEarnedLine,
  earnedOnLine,
  type V42BadgeState,
} from "@/lib/v42-badges";

function Mark({ badge }: { badge: V42BadgeState }) {
  const ink = badge.earned ? DS_V3.color.onBrand : DS_V3.color.textSecondary;
  if (badge.mark === "flag") return <Flag size={18} color={ink} />;
  if (badge.mark === "flag-triangle-right") return <FlagTriangleRight size={18} color={ink} />;
  if (badge.mark === "rotate-ccw") return <RotateCcw size={18} color={ink} />;
  if (badge.mark === "users") return <Users size={18} color={ink} />;
  if (badge.mark === "sunrise") return <Sunrise size={18} color={ink} />;
  if (badge.mark === "camera") return <Camera size={18} color={ink} />;
  return (
    <Text style={[styles.mark, { color: ink }]}>{badge.mark}</Text>
  );
}

export function BadgeGrid({
  badges,
  onShare,
}: {
  badges: V42BadgeState[];
  onShare?: (badge: V42BadgeState) => void;
}) {
  const [open, setOpen] = useState<V42BadgeState | null>(null);
  return (
    <View style={styles.wrap}>
      <Text style={styles.count}>{badgesEarnedLine(badges)}</Text>
      <View style={styles.grid}>
        {badges.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => setOpen(b)}
            accessibilityRole="button"
            accessibilityLabel={`${b.name}. ${b.earned ? (b.earnedOn ? earnedOnLine(b.earnedOn) : "Earned") : b.progress}`}
            style={styles.cell}
          >
            <View style={[styles.disc, b.earned ? styles.discOn : styles.discOff]}>
              {b.earned ? <View style={styles.ring} /> : null}
              <Mark badge={b} />
            </View>
            <Text numberOfLines={2} style={styles.name}>
              {b.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <Sheet
        visible={!!open}
        onDismiss={() => setOpen(null)}
        heading={open?.name ?? "Badge"}
      >
        {open ? (
          <View style={styles.sheet}>
            <Text style={styles.rule}>{open.rule}</Text>
            <Text style={styles.prog}>{open.progress}</Text>
            {open.earned && onShare ? (
              <Pressable
                onPress={() => onShare(open)}
                accessibilityRole="button"
                accessibilityLabel="Share"
                style={styles.share}
              >
                <Text style={styles.shareTxt}>Share</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.gutter, gap: DS_V3.space.lg },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: { width: "30%", alignItems: "center", gap: 6, minHeight: 88 },
  disc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  discOn: { backgroundColor: DS_V3.color.brand },
  discOff: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: DS_V3.color.border },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: DS_V3.color.brandText,
  },
  mark: { fontSize: 16, fontWeight: DS_V3.displayWeight, fontVariant: ["tabular-nums"] },
  name: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary, textAlign: "center" },
  sheet: { paddingHorizontal: DS_V3.space.gutter, gap: 8, paddingBottom: 16 },
  rule: { ...DS_V3.type.body, color: DS_V3.color.textPrimary },
  prog: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  share: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  shareTxt: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.brandText },
});
