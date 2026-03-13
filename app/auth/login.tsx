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
import { Eye, EyeOff } from "lucide-react-native";
import { ROUTES } from "@/lib/routes";
import { supabase } from "@/lib/supabase";
import { mapAuthError } from "@/lib/auth-helpers";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS, DS_SHADOWS } from "@/lib/design-system";
import { GRIITWordmark } from "@/src/components/ui";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;
  const inputBorder = (key: string) =>
    focusedField === key ? DS_COLORS.accent : DS_COLORS.border;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setLoading(false);
        const msg = mapAuthError(error);
        Alert.alert("Login Failed", msg);
        return;
      }

      if (data.session) {
        return;
      }

      setLoading(false);
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.logoArea}>
            <GRIITWordmark subtitle="Build Discipline Daily" compact />
          </View>

          <Text style={styles.formTitle}>Welcome back</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, { borderColor: inputBorder("email"), backgroundColor: DS_COLORS.surface, color: DS_COLORS.textPrimary }]}
              placeholder="you@example.com"
              placeholderTextColor={DS_COLORS.inputPlaceholder}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordRow, { borderColor: inputBorder("password"), backgroundColor: DS_COLORS.surface }]}>
              <TextInput
                ref={passwordRef}
                style={[styles.passwordInput, { color: DS_COLORS.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={DS_COLORS.inputPlaceholder}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={() => canSubmit && handleLogin()}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {showPassword ? (
                  <EyeOff size={22} color={DS_COLORS.textSecondary} />
                ) : (
                  <Eye size={22} color={DS_COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push(ROUTES.AUTH_FORGOT_PASSWORD as never)}
              disabled={loading}
            >
              <Text style={styles.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!canSubmit || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={DS_COLORS.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.AUTH_SIGNUP as never)}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: DS_SPACING.screenHorizontal,
    paddingTop: DS_SPACING.xxl,
    paddingBottom: DS_SPACING.section,
  },
  logoArea: { alignItems: "center", marginBottom: DS_SPACING.xxxl },
  formTitle: {
    fontSize: DS_TYPOGRAPHY.pageTitle.fontSize,
    fontWeight: "800",
    color: DS_COLORS.textPrimary,
    marginTop: DS_SPACING.xxxl,
    marginBottom: DS_SPACING.xxl,
  },
  form: { width: "100%" },
  label: {
    fontSize: DS_TYPOGRAPHY.secondary.fontSize,
    fontWeight: "600",
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.sm,
  },
  input: {
    borderWidth: DS_BORDERS.width,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.xl,
    paddingVertical: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
    color: DS_COLORS.textPrimary,
    marginBottom: DS_SPACING.lg,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: DS_BORDERS.width,
    borderRadius: DS_RADIUS.input,
    paddingHorizontal: DS_SPACING.xl,
    marginBottom: DS_SPACING.sm,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: DS_SPACING.lg,
    fontSize: DS_TYPOGRAPHY.body.fontSize,
  },
  forgotLink: { alignSelf: "flex-end", marginBottom: DS_SPACING.lg },
  forgotLinkText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.accent },
  button: {
    backgroundColor: DS_COLORS.accent,
    borderRadius: DS_RADIUS.buttonPill,
    paddingVertical: DS_SPACING.lg,
    alignItems: "center",
    marginTop: DS_SPACING.sm,
    ...DS_SHADOWS.button,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: DS_SPACING.lg,
  },
  footerText: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, color: DS_COLORS.textSecondary },
  footerLink: { fontSize: DS_TYPOGRAPHY.secondary.fontSize, fontWeight: "600", color: DS_COLORS.accent },
});
