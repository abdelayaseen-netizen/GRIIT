import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Clock } from "lucide-react-native";
import { DS_COLORS, GRIIT_COLORS } from "@/lib/design-system";

interface Task {
  id: string;
  name: string;
}

interface TimeWindowPromptProps {
  visible: boolean;
  tasks: Task[];
  onSave: (taskTimes: Record<string, string>) => void;
  onSkip: () => void;
}

export function TimeWindowPrompt({ visible, tasks, onSave, onSkip }: TimeWindowPromptProps) {
  const [taskTimes, setTaskTimes] = useState<Record<string, string>>({});

  const timeOptions = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "12:00 PM",
    "1:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
  ];

  const handleSave = () => {
    onSave(taskTimes);
    setTaskTimes({});
  };

  const handleSkip = () => {
    setTaskTimes({});
    onSkip();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Clock size={28} color={GRIIT_COLORS.primary} style={styles.icon} />
          <Text style={styles.title}>When will you do this each day?</Text>
          <Text style={styles.subtitle}>
            People who set a specific time are 3x more likely to complete their challenge
          </Text>
          <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <Text style={styles.taskName}>{task.name}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
                  {timeOptions.map((time) => {
                    const selected = taskTimes[task.id] === time;
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timePill, selected && styles.timePillSelected]}
                        onPress={() => setTaskTimes((prev) => ({ ...prev, [task.id]: time }))}
                        accessibilityLabel={`Set task time to ${time} — ${selected ? "selected" : "tap to select"}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.timePillText, selected && styles.timePillTextSelected]}>{time}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            accessibilityLabel="Save my daily schedule for this challenge"
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>Save my schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityLabel="Skip setting a schedule for now"
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: DS_COLORS.modalBackdrop,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  taskList: {
    maxHeight: 280,
  },
  taskRow: {
    marginBottom: 16,
  },
  taskName: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  timePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
  },
  timePillSelected: {
    backgroundColor: GRIIT_COLORS.primary,
    borderColor: GRIIT_COLORS.primary,
  },
  timePillText: {
    fontSize: 12,
    color: DS_COLORS.textSecondary,
  },
  timePillTextSelected: {
    color: DS_COLORS.white,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: GRIIT_COLORS.primary,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: DS_COLORS.white,
    fontSize: 15,
    fontWeight: "500",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  skipText: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
  },
});
