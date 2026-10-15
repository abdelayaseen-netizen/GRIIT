import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import KeyboardDock from "@/components/ds/KeyboardDock";
import { Image } from "expo-image";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { styles } from "../taskFlowStyles";
import { audienceLabel, postButtonLabel, POST_AUDIENCES, type PostAudience } from "@/lib/post-audience";

type Props = {
  photoUri: string;
  challengeName: string;
  currentDay: number;
  taskName: string;
  gateLabel: string;
  caption: string;
  onCaption: (t: string) => void;
  onRetake: () => void;
  onPost: () => void;
  submitting?: boolean;
  /** One line when the post cannot go out. The button stays tappable. */
  note?: string | null;
  audience: PostAudience;
  onAudience: (audience: PostAudience) => void;
};

export function ReviewStep({
  photoUri,
  caption,
  onCaption,
  onRetake,
  onPost,
  submitting = false,
  note,
  audience,
  onAudience,
}: Props) {
  return (
    <KeyboardDock
      footer={
        <View style={styles.reviewDeck}>
          <View style={styles.capRow}>
            <TextInput
              value={caption}
              onChangeText={(t) => onCaption(t.slice(0, 120))}
              placeholder="Add a caption"
              placeholderTextColor={DS_V3.color.textSecondary}
              selectionColor={DS_V3.color.textPrimary}
              style={styles.capInput}
              maxLength={120}
            />
            <Text style={styles.counter}>{caption.length} / 120</Text>
          </View>
          <View style={styles.audienceRow}>
            {POST_AUDIENCES.map((choice) => {
              const on = choice === audience;
              return (
                <Pressable
                  key={choice}
                  onPress={() => onAudience(choice)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={[styles.audienceChip, on && styles.audienceChipOn]}
                >
                  <Text style={[styles.audienceChipText, on && styles.audienceChipTextOn]}>{audienceLabel(choice)}</Text>
                </Pressable>
              );
            })}
          </View>
          {submitting ? (
            <Text style={styles.counter}>Posting your photo.</Text>
          ) : note ? (
            <Text style={styles.counter}>{note}</Text>
          ) : null}
          <Button label={postButtonLabel(audience)} submitting={submitting} disabled={submitting} onPress={onPost} />
        </View>
      }
    >
    <View style={styles.reviewPhoto}>
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <Pressable onPress={onRetake} accessibilityRole="button" accessibilityLabel="Retake" style={styles.retake}>
        <Text style={styles.retakeText}>Retake</Text>
      </Pressable>
    </View>
    </KeyboardDock>
  );
}
