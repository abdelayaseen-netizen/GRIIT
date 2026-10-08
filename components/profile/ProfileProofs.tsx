/**
 * Frame 150 / 159 — proofs grid (photo, self-reported, not saved, Today) + calendar toggle.
 */
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { ProofPhoto } from "@/components/ds/ProofFallbackTile";
import { CalendarDays, ImageOff, LayoutGrid, Lock, Plus } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import ProofsCalendar from "@/components/profile/ProofsCalendar";
import type { ProofsDayIn } from "@/lib/day-cell";
import type { ProofsHeader } from "@/lib/secured-since";
import {
  NO_PROOFS_BODY,
  PHOTO_NOT_SAVED,
  SELF_REPORTED_TILE,
  TODAY_TILE,
  profileProofKind,
  proofsEmptyHeading,
  proofsNewestLine,
  todayTileCaption,
} from "@/lib/g3-profile";
import { proofsDateLabel } from "@/lib/proofs-grid";
import { consumeProofTile } from "@/lib/proof-return";
import { KEPT_PROOFS_BODY } from "@/lib/v44-detail";
import { NextBadgeCard } from "@/components/profile/BadgeGrid";
import type { V42BadgeState } from "@/lib/v42-badges";
import { showNextBadgeUnderGrid } from "@/lib/g3-profile";

export type ProfileProofTile = {
  id: string;
  dateKey: string;
  imageUrl?: string | null;
  taskName?: string | null;
  shared?: boolean;
  shareState?: "unanswered" | "shared" | "kept";
  bytes?: number | null;
};

export default function ProfileProofs({
  proofs,
  isOwner,
  todayOpen,
  tasksLeft,
  monthKey,
  days,
  header,
  onOpenDay,
  onToday,
  nextBadge,
  onNextBadge,
  securedDays,
}: {
  proofs: ProfileProofTile[];
  isOwner: boolean;
  todayOpen?: boolean;
  tasksLeft?: number;
  securedDays?: number;
  monthKey: string;
  days: ProofsDayIn[];
  header: ProofsHeader;
  onOpenDay: (tile: ProfileProofTile) => void;
  onToday?: () => void;
  nextBadge?: V42BadgeState | null;
  onNextBadge?: () => void;
}) {
  const [mode, setMode] = useState<"grid" | "calendar">("grid");
  const [outlineId, setOutlineId] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      const id = consumeProofTile();
      if (!id) return undefined;
      setOutlineId(id);
      const timer = setTimeout(() => setOutlineId(null), 1000);
      return () => clearTimeout(timer);
    }, []),
  );
  const showToday = Boolean(isOwner && todayOpen);
  const empty = proofs.length === 0 && !showToday;
  const tileCount = proofs.length + (showToday ? 1 : 0);
  const showNext = Boolean(nextBadge && !empty && showNextBadgeUnderGrid(tileCount));
  const secured = securedDays ?? 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.toggleRow}>
        <Text style={styles.count}>{proofsNewestLine(proofs.length, secured)}</Text>
        <View style={styles.toggle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Grid"
            accessibilityState={{ selected: mode === "grid" }}
            onPress={() => setMode("grid")}
            style={[styles.togBtn, mode === "grid" && styles.togOn]}
          >
            <LayoutGrid size={18} color={mode === "grid" ? DS_V3.color.textPrimary : DS_V3.color.textSecondary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Calendar"
            accessibilityState={{ selected: mode === "calendar" }}
            onPress={() => setMode("calendar")}
            style={[styles.togBtn, mode === "calendar" && styles.togOn]}
          >
            <CalendarDays size={18} color={mode === "calendar" ? DS_V3.color.textPrimary : DS_V3.color.textSecondary} />
          </Pressable>
        </View>
      </View>

      {mode === "calendar" ? (
        <ProofsCalendar
          monthKey={monthKey}
          days={days}
          header={header}
          viewer={isOwner ? "owner" : "visitor"}
          onDay={(dateKey) => {
            const tile = proofs.find((p) => p.dateKey === dateKey);
            onOpenDay(tile ?? { id: dateKey, dateKey });
          }}
        />
      ) : empty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyH}>{proofsEmptyHeading(secured)}</Text>
          <Text style={styles.emptyB}>{secured > 0 ? KEPT_PROOFS_BODY : NO_PROOFS_BODY}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {showToday ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${TODAY_TILE}. ${todayTileCaption(tasksLeft ?? 0)}`}
              onPress={onToday}
              style={[styles.tile, styles.today]}
            >
              <Plus size={18} color={DS_V3.color.brand} />
              <Text style={styles.todayTitle}>{TODAY_TILE}</Text>
              <Text style={styles.todayCap}>{todayTileCaption(tasksLeft ?? 0)}</Text>
            </Pressable>
          ) : null}
          {proofs.map((p) => {
            const kind = profileProofKind(p);
            const date = proofsDateLabel(p.dateKey);
            const kept = isOwner && p.shareState === "kept";
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`${p.taskName || "Proof"}, ${date}`}
                onPress={() => onOpenDay(p)}
                style={[styles.tile, outlineId === p.id ? styles.outline : null]}
              >
                {kind === "photo" ? (
                  <>
                    <ProofPhoto uri={p.imageUrl} taskName={p.taskName} style={styles.img} />
                    <Text style={styles.dateBurn}>{date}</Text>
                  </>
                ) : kind === "missing" ? (
                  <View style={styles.self}>
                    <ImageOff size={20} color={DS_V3.color.textSecondary} />
                    <Text style={styles.missing}>{PHOTO_NOT_SAVED}</Text>
                  </View>
                ) : (
                  <View style={styles.self}>
                    <Text style={styles.dateChip}>{date}</Text>
                    <Text style={styles.selfLabel}>{SELF_REPORTED_TILE}</Text>
                    <Text style={styles.selfTask} numberOfLines={2}>
                      {p.taskName || "Task"}
                    </Text>
                  </View>
                )}
                {kept ? (
                  <View style={styles.lock}>
                    <Lock size={20} color={DS_V3.color.textPrimary} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
      {mode === "grid" && showNext && nextBadge ? (
        <View style={styles.nextWrap}>
          <NextBadgeCard badge={nextBadge} onPress={onNextBadge ?? (() => undefined)} />
        </View>
      ) : null}
    </View>
  );
}

const GUTTER = 1;

const styles = StyleSheet.create({
  wrap: { paddingTop: DS_V3.space.md },
  toggleRow: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  toggle: { flexDirection: "row", gap: 4 },
  togBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DS_V3.radius.input,
  },
  togOn: { backgroundColor: DS_V3.color.surface },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: DS_V3.space.gutter,
    gap: GUTTER,
  },
  tile: {
    width: "32.6%",
    aspectRatio: 1,
    backgroundColor: DS_V3.color.surface,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  img: { ...StyleSheet.absoluteFillObject },
  dateBurn: {
    padding: 6,
    fontSize: 11,
    lineHeight: 14,
    color: DS_V3.color.textPrimary,
  },
  self: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
  },
  selfLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: DS_V3.color.textSecondary,
  },
  selfTask: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: DS_V3.color.textPrimary,
  },
  dateChip: { fontSize: 11, lineHeight: 14, color: DS_V3.color.textSecondary },
  outline: { borderWidth: 1.5, borderColor: DS_V3.color.textPrimary },
  missing: {
    fontSize: 11,
    lineHeight: 14,
    color: DS_V3.color.textSecondary,
  },
  today: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: DS_V3.color.brand,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "transparent",
  },
  todayTitle: { fontSize: 13, fontWeight: "500", color: DS_V3.color.textPrimary },
  todayCap: { fontSize: 11, color: DS_V3.color.textSecondary },
  lock: { position: "absolute", top: 6, right: 6 },
  empty: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingVertical: DS_V3.space.section,
    gap: DS_V3.space.sm,
  },
  emptyH: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  emptyB: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  nextWrap: { paddingTop: DS_V3.space.lg, paddingHorizontal: DS_V3.space.gutter },
});
