import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  keyboardAvoiding?: boolean;
}

export function Screen(props: ScreenProps) {
  const { children, scroll, header, footer, keyboardAvoiding } = props;
  const defaultEdges = ["top", "bottom"] as const;

  const content = (
    <View style={styles.content}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
      {footer}
    </View>
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={styles.safe} edges={defaultEdges}>
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  keyboard: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
});
