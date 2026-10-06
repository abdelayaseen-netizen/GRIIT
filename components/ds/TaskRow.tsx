import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, Check, ChevronDown, ChevronRight, ChevronUp, Clock, MapPin } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { gateParts, type TaskLine } from "@/lib/gate-line";

const ICON = { camera: Camera, clock: Clock, pin: MapPin } as const;

export function GateLine({ line }: { line: TaskLine }) {
  const parts = gateParts(line);
  return (
    <View style={styles.gates}>
      {parts.map((part, i) => {
        const Glyph = part.icon ? ICON[part.icon] : null;
        return (
          <React.Fragment key={`${part.text}-${i}`}>
            {i > 0 ? <Text style={styles.dot}>·</Text> : null}
            {Glyph ? <Glyph size={13} color={DS_V3.color.textSecondary} /> : null}
            <Text style={styles.gate}>{part.text}</Text>
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function TaskRow({
  name,
  line,
  state,
  onPress,
}: {
  name: string;
  line: TaskLine;
  state: "open" | "done" | "closed";
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={state === "open" ? onPress : undefined}
      style={styles.row}
      accessibilityRole="button"
    >
      {state === "done" ? (
        <View style={[styles.mark, styles.done]}>
          <Check size={16} color={DS_V3.color.brand} strokeWidth={3} />
        </View>
      ) : state === "closed" ? (
        <View style={[styles.mark, styles.closed]} />
      ) : (
        <View style={[styles.mark, styles.open]} />
      )}
      <View style={styles.copy}>
        <Text style={[styles.name, state !== "open" && styles.dim]}>{name}</Text>
        <GateLine line={line} />
      </View>
      {state === "open" ? <ChevronRight size={18} color={DS_V3.color.textSecondary} /> : null}
    </Pressable>
  );
}

export function TodaySection({
  name,
  dayLine,
  done,
  total,
  collapsed,
  onToggle,
  children,
}: {
  name: string;
  dayLine: string;
  done: number;
  total: number;
  collapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const Chev = collapsed ? ChevronDown : ChevronUp;
  return (
    <View style={styles.section}>
      <Pressable onPress={onToggle} style={styles.sectionHead} accessibilityRole="button">
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.gate}>{dayLine}</Text>
        </View>
        <Text style={styles.gate}>{done} of {total} done</Text>
        <Chev size={16} color={DS_V3.color.textSecondary} />
      </Pressable>
      {collapsed ? null : children}
    </View>
  );
}

const styles = StyleSheet.create({
  gates: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5 },
  gate: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  dot: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingVertical: 6 },
  mark: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  done: { backgroundColor: DS_V3.color.raised },
  open: { borderWidth: 1.5, borderColor: DS_V3.color.textTertiary },
  closed: { borderWidth: 1.5, borderColor: DS_V3.color.textSecondary },
  copy: { flex: 1, gap: 2 },
  name: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  dim: { color: DS_V3.color.textSecondary },
  section: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: DS_V3.size.tap },
});
