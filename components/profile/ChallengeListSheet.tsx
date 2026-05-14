import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import {
  ChevronRight,
  Target,
  Sun,
  Droplet,
  Bed,
  Book,
  Leaf,
  Footprints,
  Users,
  X,
} from "lucide-react-native";

import { DS_COLORS, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

export type ChallengeListSheetIconName =
  | "target"
  | "sun"
  | "droplet"
  | "bed"
  | "book"
  | "leaf"
  | "walk";

export type ChallengeListSheetProps = {
  visible: boolean;
  title: "Active challenges" | "Completed challenges";
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    joinedCount: number;
    finishedCount?: number;
    iconBg: string;
    iconColor: string;
    iconName: ChallengeListSheetIconName;
  }>;
  onClose: () => void;
  onSelect: (id: string) => void;
};

const ICON_MAP = {
  target: Target,
  sun: Sun,
  droplet: Droplet,
  bed: Bed,
  book: Book,
  leaf: Leaf,
  walk: Footprints,
} as const;

function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.45}
      pressBehavior="close"
    />
  );
}

export function ChallengeListSheet({ visible, title, items, onClose, onSelect }: ChallengeListSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["75%"], []);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose]
  );

  const countLabel =
    title === "Active challenges"
      ? `${items.length} in progress`
      : `${items.length} finished`;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      onChange={handleSheetChange}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.sheetHandle}
    >
      <BottomSheetView style={styles.sheetInner}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetBadge}>{countLabel}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Close ${title}`}
            onPress={onClose}
            hitSlop={10}
            style={styles.sheetCloseHit}
          >
            <X size={22} color={DS_COLORS.TEXT_PRIMARY} strokeWidth={2} />
          </Pressable>
        </View>

        {items.map((row) => {
          const Ico = ICON_MAP[row.iconName] ?? Target;
          return (
            <Pressable
              key={row.id}
              accessibilityRole="button"
              accessibilityLabel={`${row.title}, ${row.subtitle}`}
              onPress={() => onSelect(row.id)}
              style={styles.rowTap}
            >
              <View style={[styles.square36, { backgroundColor: row.iconBg }]}>
                <Ico color={row.iconColor} size={20} strokeWidth={2} />
              </View>
              <View style={styles.rowCenter}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowSub}>{row.subtitle}</Text>
                <View style={styles.meta}>
                  <Users size={13} color={DS_COLORS.TEXT_SECONDARY} strokeWidth={2} />
                  <Text style={styles.metaTxt}>
                    {row.joinedCount.toLocaleString()} joined
                    {row.finishedCount != null
                      ? ` · ${row.finishedCount.toLocaleString()} finished`
                      : ""}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={DS_COLORS.TEXT_MUTED} />
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: DS_RADIUS.modal,
    borderTopRightRadius: DS_RADIUS.modal,
    backgroundColor: DS_COLORS.BG_CARD,
  },
  sheetHandle: { backgroundColor: DS_COLORS.TEXT_MUTED },
  sheetInner: {
    flex: 1,
    paddingHorizontal: DS_SPACING.md,
    paddingBottom: DS_SPACING.xxl,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DS_SPACING.sm,
    gap: DS_SPACING.sm,
  },
  sheetTitle: { flex: 1, fontSize: 17, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  sheetBadge: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS.TEXT_SECONDARY,
    marginRight: DS_SPACING.xs,
  },
  sheetCloseHit: { padding: DS_SPACING.xs },
  rowTap: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: DS_SPACING.sm,
    gap: DS_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.BORDER,
  },
  square36: {
    width: 36,
    height: 36,
    borderRadius: DS_RADIUS.SM,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCenter: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: DS_COLORS.TEXT_PRIMARY },
  rowSub: { marginTop: 2, fontSize: 13, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaTxt: { fontSize: 12, fontWeight: "400", color: DS_COLORS.TEXT_SECONDARY },
});
