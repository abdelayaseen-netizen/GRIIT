import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";
import Colors from "@/constants/colors";

export interface ProfileCompletionCardProps {
  bioAdded: boolean;
  joinedChallenge: boolean;
  secured7Days: boolean;
  invitedFriend: boolean;
}

export default function ProfileCompletionCard({
  bioAdded,
  joinedChallenge,
  secured7Days,
  invitedFriend,
}: ProfileCompletionCardProps) {
  const items = [
    { done: bioAdded, label: "Add a bio" },
    { done: joinedChallenge, label: "Join a challenge" },
    { done: secured7Days, label: "Secure 7 days" },
    { done: invitedFriend, label: "Invite a friend" },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile completion</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.list}>
        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            {item.done ? (
              <CheckCircle2 size={20} color={Colors.streak.shield} fill={Colors.streak.shield} strokeWidth={0} />
            ) : (
              <Circle size={20} color={Colors.border} strokeWidth={2} />
            )}
            <Text style={[styles.label, !item.done && styles.labelMuted]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  percent: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.accent,
  },
  barTrack: {
    height: 6,
    backgroundColor: Colors.pill,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 14,
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  labelMuted: {
    color: Colors.text.tertiary,
  },
});
