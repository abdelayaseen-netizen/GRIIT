import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface StreakCalendarProps {
  currentStreak: number;
  daySecuredToday: boolean;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCalendar({ currentStreak, daySecuredToday }: StreakCalendarProps) {
  const days = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return Array.from({ length: 7 }).map((_, i) => {
      const daysFromMonday = i;
      const daysFromToday = daysFromMonday - mondayOffset;
      const isToday = daysFromToday === 0;
      const isFuture = daysFromToday > 0;
      const isPast = daysFromToday < 0;

      let secured = false;
      if (isToday) {
        secured = daySecuredToday;
      } else if (isPast) {
        const daysAgo = Math.abs(daysFromToday);
        secured = daysAgo < currentStreak || (daysAgo === currentStreak - 1 && currentStreak > 0);
        if (currentStreak === 0) secured = false;
        if (daysAgo <= currentStreak && currentStreak > 0) secured = true;
      }

      return { isToday, isFuture, secured, label: DAY_LABELS[i] };
    });
  }, [currentStreak, daySecuredToday]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {days.map((day, i) => (
          <View key={i} style={styles.dayColumn}>
            <Text style={[styles.label, day.isToday && styles.labelToday]}>{day.label}</Text>
            <View
              style={[
                styles.dot,
                day.secured && styles.dotSecured,
                day.isToday && !day.secured && styles.dotToday,
                day.isFuture && styles.dotFuture,
              ]}
            >
              {day.secured && <View style={styles.checkInner} />}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dayColumn: {
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.text.muted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  labelToday: {
    color: Colors.text.primary,
    fontWeight: "700" as const,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  dotSecured: {
    backgroundColor: Colors.streak.shield,
  },
  dotToday: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  dotFuture: {
    backgroundColor: Colors.pill,
    opacity: 0.5,
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});
