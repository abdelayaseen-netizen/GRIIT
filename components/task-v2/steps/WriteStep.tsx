import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";
import { journalReady, wordCount } from "@/lib/task-flow-state";
import { styles } from "../taskFlowStyles";

type Props = {
  text: string;
  minWords: number;
  onChangeText: (t: string) => void;
  onPost: () => void;
};

export function WriteStep({ text, minWords, onChangeText, onPost }: Props) {
  const ready = journalReady(text, minWords);
  return (
    <View style={styles.body}>
      <Text style={styles.switchSub}>
        {wordCount(text)} / {minWords} words{wordCount(text) >= minWords ? " · minimum met" : ""}
      </Text>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        multiline
        style={styles.editor}
        placeholder="Write here"
        placeholderTextColor={DS_COLORS_V2.text.mutedDark}
      />
      <Pressable
        disabled={!ready}
        onPress={onPost}
        accessibilityRole="button"
        accessibilityLabel={!ready ? `Write ${minWords - wordCount(text)} more words` : "Post"}
        style={[styles.orangeBtn, !ready && styles.disabledBtn]}
      >
        <Text style={styles.btnText}>
          {wordCount(text) < minWords ? `Write ${minWords - wordCount(text)} more words` : "Post"}
        </Text>
      </Pressable>
    </View>
  );
}
