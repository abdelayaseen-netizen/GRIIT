import React from "react";
import { Pressable, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { blockedEyebrow } from "@/lib/task-flow-state";
import { styles } from "../taskFlowStyles";

type Props = {
  windowStatus: string;
  windowStart?: string | null;
  windowEnd?: string | null;
  place: string;
  radius: number;
  gpsMeters: number | null;
  onCheckAgain: () => void;
  onExit: () => void;
};

export function BlockedStep({
  windowStatus,
  windowStart,
  windowEnd,
  place,
  radius,
  gpsMeters,
  onCheckAgain,
  onExit,
}: Props) {
  return (
    <View style={styles.body}>
      <Text style={styles.eyebrowInk}>{blockedEyebrow(windowStatus)}</Text>
      <Text style={styles.title}>
        {windowStatus === "out_of_window" ? `Opens at ${windowStart ?? ""}` : `You're not at ${place}`}
      </Text>
      <Text style={styles.bodyText}>
        {windowStatus === "out_of_window"
          ? `This task only counts inside its window: ${windowStart} to ${windowEnd}. You can shoot the photo then. Nothing is logged before it opens.`
          : `You need to be within ${radius} m of the saved location. Right now you're ${gpsMeters != null ? `${(gpsMeters / 1000).toFixed(1)} km` : "away"}. Nothing is logged until you're inside the radius.`}
      </Text>
      {windowStatus === "out_of_window" && windowStart ? (
        <Pressable
          onPress={() => {
            const [h, m] = windowStart.split(":").map(Number);
            const at = new Date();
            at.setHours(h ?? 0, m ?? 0, 0, 0);
            if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
            void Notifications.scheduleNotificationAsync({
              content: {
                title: "Window open",
                body: `You can shoot the photo now — opens at ${windowStart}.`,
              },
              trigger: { type: "date", date: at } as Notifications.NotificationTriggerInput,
            }).catch(() => {});
            onExit();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Remind me at ${windowStart}`}
          style={styles.inkBtn}
        >
          <Text style={styles.inkBtnText}>Remind me at {windowStart}</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onCheckAgain} accessibilityRole="button" accessibilityLabel="Check again" style={styles.inkBtn}>
          <Text style={styles.inkBtnText}>Check again</Text>
        </Pressable>
      )}
      <Pressable onPress={onExit} accessibilityRole="button" accessibilityLabel="Back to today" style={styles.outlineBtn}>
        <Text style={styles.outlineText}>Back to today</Text>
      </Pressable>
    </View>
  );
}
