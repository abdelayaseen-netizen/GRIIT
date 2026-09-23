import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { ProofDayCard } from "@/components/profile/ProofDayCard";
import { proofDaysFromPhotos, visibleProofDays, type ProofDay } from "@/lib/day-state";
import type { ProofsGridItem } from "@/lib/proofs-grid";

export const PROOF_DAYS_EMPTY = "No days with photos";
export const PROOF_DAYS_EMPTY_BODY =
  "A task with the Camera gate puts its photo here, grouped by the day you took it.";

export function proofDaysOwnerFooter(n: number): string {
  return `${n} days with photos`;
}

export function proofDaysVisitorFooter(n: number): string {
  return `${n} days with shared photos`;
}

export function proofDaysVisitorRule(name: string): string {
  return `Only days ${name} shared a photo appear here.`;
}

export function proofDaysFromItems(items: readonly ProofsGridItem[]): ProofDay[] {
  return proofDaysFromPhotos(items.map((i) => ({ dateKey: i.dateKey, uri: i.uri, shared: i.shared })));
}

export function ProofDaysGrid({
  items,
  isOwner,
  visitorName,
  onOpenDay,
}: {
  items: ProofsGridItem[];
  isOwner: boolean;
  visitorName?: string;
  onOpenDay: (dateKey: string) => void;
}) {
  const days = visibleProofDays(proofDaysFromItems(items), isOwner);
  if (days.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.glyph}>
          <Camera size={DS_V3.space.lg + DS_V3.space.sm} color={DS_V3.color.textPrimary} />
        </View>
        <Text style={styles.heading}>{PROOF_DAYS_EMPTY}</Text>
        <Text style={styles.body}>{PROOF_DAYS_EMPTY_BODY}</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {days.map((day) => (
          <ProofDayCard key={day.dateKey} day={day} isOwner={isOwner} onPress={onOpenDay} />
        ))}
      </View>
      <Text style={styles.foot}>
        {isOwner ? proofDaysOwnerFooter(days.length) : proofDaysVisitorFooter(days.length)}
      </Text>
      {!isOwner && visitorName ? <Text style={styles.foot}>{proofDaysVisitorRule(visitorName)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.md, gap: DS_V3.space.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: DS_V3.space.md },
  empty: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.section, gap: DS_V3.space.sm },
  glyph: { marginBottom: DS_V3.space.sm },
  heading: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  body: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  foot: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
