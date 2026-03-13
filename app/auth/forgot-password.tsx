import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";
import { DS_COLORS } from "@/lib/design-system";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async () => {
    if (loading || isSubmittingRef.current) return;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    if (!trimmed.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: undefined,
      });
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }
      setSent(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={["top", "bottom"]}>
        <View style={styles.sentBlock}>
          <Text style={[styles.sentTitle, { color: themeColors.text.primary }]}>Check your email</Text>
          <Text style={[styles.sentBody, { color: themeColors.text.secondary }]}>
            We sent a link to {email.trim()}. Use it to reset your password.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.accent }]}
            onPress={() => router.replace(ROUTES.AUTH_LOGIN as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text.primary }]}>Reset password</Text>
            <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
              Enter your email and we{"'"}ll send you a link to reset your password.
            </Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text.primary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.card, borderColor: themeColors.border, color: themeColors.text.primary }]}
                placeholder="your@email.com"
                placeholderTextColor={themeColors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.accent }, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset link</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backLink, { borderColor: themeColors.border }]}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.backLinkText, { color: themeColors.text.primary }]}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", paddingHorizontal: 8 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 15, fontWeight: "700", color: DS_COLORS.white },
  backLink: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  backLinkText: { fontSize: 15, fontWeight: "600" },
  sentBlock: { paddingHorizontal: 24, alignItems: "center" },
  sentTitle: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  sentBody: { fontSize: 15, textAlign: "center", marginBottom: 24 },
});
