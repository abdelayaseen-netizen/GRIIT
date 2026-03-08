import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from "react-native";
import { Target } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import LogProgressModal from "./LogProgressModal";

export interface SharedGoalLogEntry {
  id: string;
  user_id: string;
  amount: number;
  unit: string;
  note: string | null;
  logged_at: string;
  display_name: string;
}

interface ContributionRow {
  user_id: string;
  display_name: string;
  total: number;
  percent: number;
}

interface SharedGoalProgressProps {
  target: number;
  unit: string;
  total: number;
  runStatus: string;
  deadlineType?: string | null;
  deadlineDate?: string | null;
  contributions: ContributionRow[];
  recentLogs: SharedGoalLogEntry[];
  loadingLogs: boolean;
  onLogProgress: (amount: number, note: string) => Promise<void>;
  onRefetchLogs?: () => void;
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

export default function SharedGoalProgress({
  target,
  unit,
  total,
  runStatus,
  deadlineType,
  deadlineDate,
  contributions,
  recentLogs,
  loadingLogs,
  onLogProgress,
}: SharedGoalProgressProps) {
  const { colors } = useTheme();
  const [logModalVisible, setLogModalVisible] = React.useState(false);

  const percent = useMemo(() => (target > 0 ? Math.min((total / target) * 100, 100) : 0), [total, target]);
  const remaining = useMemo(() => Math.max(0, target - total), [target, total]);

  const deadlineLabel = useMemo(() => {
    if (!deadlineDate) return null;
    if (deadlineType === "hard") {
      const today = new Date().toISOString().split("T")[0];
      if (deadlineDate < today) return "FAILED — deadline missed";
      const end = new Date(deadlineDate).getTime();
      const days = Math.ceil((end - Date.now()) / 86_400_000);
      return days > 0 ? `${days} days remaining` : "Due today";
    }
    if (deadlineType === "soft") {
      const today = new Date().toISOString().split("T")[0];
      if (deadlineDate < today) return "Past target date — keep going!";
      return `Due: ${deadlineDate}`;
    }
    return `Due: ${deadlineDate}`;
  }, [deadlineType, deadlineDate]);

  const isComplete = runStatus === "completed" || total >= target;
  const isFailed = runStatus === "failed";

  const handleLogPress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogModalVisible(true);
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroRow}>
          <Target size={24} color={colors.accent} />
          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>
            {total} of {target} {unit}
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percent}%`,
                backgroundColor: isFailed ? "#B91C1C" : isComplete ? colors.success : colors.accent,
              },
            ]}
          />
        </View>
        <Text style={[styles.percent, { color: colors.text.secondary }]}>{Math.round(percent)}% complete</Text>
        {remaining > 0 && !isFailed && <Text style={[styles.remaining, { color: colors.text.tertiary }]}>{remaining} {unit} to go</Text>}
        {deadlineLabel && <Text style={[styles.deadline, { color: isFailed ? "#B91C1C" : colors.text.secondary }]}>{deadlineLabel}</Text>}
      </View>

      {runStatus === "active" && (
        <TouchableOpacity
          style={[styles.logCta, { backgroundColor: colors.accent }]}
          onPress={handleLogPress}
          activeOpacity={0.85}
        >
          <Text style={styles.logCtaText}>Log {unit}</Text>
        </TouchableOpacity>
      )}

      {contributions.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Team contributions</Text>
          {contributions.map((c) => (
            <View key={c.user_id} style={[styles.contributionRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.contributionName, { color: colors.text.primary }]} numberOfLines={1}>{c.display_name}</Text>
              <Text style={[styles.contributionValue, { color: colors.text.secondary }]}>{c.total} {unit}</Text>
              <View style={styles.contributionBarRow}>
                <View style={[styles.contributionBarBg, { backgroundColor: colors.pill }]}>
                  <View style={[styles.contributionBarFill, { width: `${c.percent}%`, backgroundColor: colors.accent }]} />
                </View>
                <Text style={[styles.contributionPct, { color: colors.text.tertiary }]}>{Math.round(c.percent)}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent activity</Text>
        {loadingLogs ? (
          <ActivityIndicator size="small" color={colors.accent} style={styles.loader} />
        ) : recentLogs.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No logs yet. Be the first to log!</Text>
        ) : (
          <FlatList
            data={recentLogs}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.logRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.logText, { color: colors.text.primary }]}>
                  <Text style={styles.logName}>{item.display_name}</Text>
                  {" "}logged {item.amount} {item.unit}
                  {item.note ? ` — "${item.note}"` : ""}
                </Text>
                <Text style={[styles.logTime, { color: colors.text.tertiary }]}>{formatRelativeTime(item.logged_at)}</Text>
              </View>
            )}
          />
        )}
      </View>

      <LogProgressModal
        visible={logModalVisible}
        unit={unit}
        onClose={() => setLogModalVisible(false)}
        onSubmit={onLogProgress}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  percent: {
    fontSize: 14,
    fontWeight: "600",
  },
  remaining: {
    fontSize: 13,
    marginTop: 2,
  },
  deadline: {
    fontSize: 13,
    marginTop: 4,
  },
  logCta: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  logCtaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  contributionRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contributionName: {
    fontSize: 14,
    fontWeight: "600",
  },
  contributionValue: {
    fontSize: 13,
    marginTop: 2,
  },
  contributionBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  contributionBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  contributionBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  contributionPct: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 32,
  },
  loader: {
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  logRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logText: {
    fontSize: 14,
  },
  logName: {
    fontWeight: "600",
  },
  logTime: {
    fontSize: 12,
    marginTop: 2,
  },
});
