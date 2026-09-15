import React from "react";
import { Pressable, Text, View } from "react-native";
import { checkinReady } from "@/lib/task-flow-state";
import { styles } from "../taskFlowStyles";

type Props = {
  taskName: string;
  radius: number;
  place: string;
  gps: { m: number; acc: number } | null;
  onHere: () => void;
};

export function CheckinEntryStep({ taskName, radius, place, gps, onHere }: Props) {
  const ready = checkinReady(gps?.m ?? null, radius);
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{taskName}</Text>
      <Text style={styles.gate}>{`Be within ${radius} m of ${place}`}</Text>
      <View style={styles.card}>
        <Text style={styles.statLabel}>DISTANCE TO {place.toUpperCase()}</Text>
        <Text style={styles.bigNum}>
          {gps?.m ?? "—"} <Text style={styles.unit}>m away</Text>
        </Text>
        {gps ? (
          <Text style={styles.switchSub}>
            {gps.m <= radius ? `Inside the ${radius} m radius` : `Outside the ${radius} m radius`}
            {` · GPS accuracy ±${gps.acc} m`}
          </Text>
        ) : (
          <Text style={styles.switchSub}>Checking location…</Text>
        )}
      </View>
      <Pressable
        disabled={!ready}
        onPress={onHere}
        accessibilityRole="button"
        accessibilityLabel="I'm here"
        style={[styles.orangeBtn, !ready && styles.disabledBtn]}
      >
        <Text style={styles.btnText}>I&apos;m here</Text>
      </Pressable>
    </View>
  );
}
