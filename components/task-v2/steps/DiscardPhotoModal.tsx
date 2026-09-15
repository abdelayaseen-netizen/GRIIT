import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../taskFlowStyles";

type Props = {
  onDiscard: () => void;
  onKeep: () => void;
};

export function DiscardPhotoModal({ onDiscard, onKeep }: Props) {
  return (
    <View style={styles.modal}>
      <View style={styles.modalCard}>
        <Text style={styles.title}>Discard photo?</Text>
        <Pressable onPress={onDiscard} accessibilityRole="button" accessibilityLabel="Discard" style={styles.inkBtn}>
          <Text style={styles.inkBtnText}>Discard</Text>
        </Pressable>
        <Pressable onPress={onKeep} accessibilityRole="button" accessibilityLabel="Keep" style={styles.textBtn}>
          <Text style={styles.shareText}>Keep</Text>
        </Pressable>
      </View>
    </View>
  );
}
