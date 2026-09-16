import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";
import { captureError } from "@/lib/sentry";
import { track } from "@/lib/analytics";
import { DS_V3 } from "@/lib/design-system";
import { loginCanSubmit } from "@/lib/login-can-submit";
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Button from "@/components/ds/Button";
import Divider from "@/components/ds/Divider";
import PushedHeader from "@/components/ds/PushedHeader";
import TextField from "@/components/ds/TextField";
import TextLink from "@/components/ds/TextLink";
import * as Haptics from "expo-haptics";

const ICON = DS_V3.space.xs * 6;
const LOGIN_DISABLED_CAPTION = "Please enter your email and password.";

function LoginScreenInner() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const live = loginCanSubmit(email, password);

  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }
  }, []);

  const handleSignIn = useCallback(async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    setFormError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setFormError(LOGIN_DISABLED_CAPTION);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }
      if (!data.session) {
        setFormError("Sign in failed. Please try again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, username, display_name")
        .eq("user_id", data.user.id)
        .single();

      if (profileError || !profile?.username) {
        try {
          track({ name: "login_completed", method: "email" });
        } catch {
          /* non-fatal */
        }
        router.replace(ROUTES.CREATE_PROFILE as never);
      } else {
        try {
          track({ name: "login_completed", method: "email" });
        } catch {
          /* non-fatal */
        }
        router.replace(ROUTES.TABS as never);
      }
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      captureError(e, { flow: "login_email" });
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [loading, email, password, router]);

  const handleForgotPassword = useCallback(() => {
    router.push(ROUTES.AUTH_FORGOT_PASSWORD as never);
  }, [router]);

  const handleApple = useCallback(async () => {
    setFormError("");
    setLoading(true);
    try {
      if (Platform.OS === "ios" && appleAuthAvailable) {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) {
          setFormError("Apple Sign-In did not return a token.");
          return;
        }
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) {
          setFormError(error.message);
          return;
        }
        if (!data.session) {
          setFormError("Sign in failed. Please try again.");
          return;
        }
        const { data: profile } = await supabase.from("profiles").select("user_id, username").eq("user_id", data.user.id).single();
        if (!profile?.username) {
          try {
            track({ name: "login_completed", method: "apple" });
          } catch {
            /* non-fatal */
          }
          router.replace(ROUTES.CREATE_PROFILE as never);
        } else {
          try {
            track({ name: "login_completed", method: "apple" });
          } catch {
            /* non-fatal */
          }
          router.replace(ROUTES.TABS as never);
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({ provider: "apple" });
        if (error) setFormError(error.message);
      }
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }
      captureError(e, { flow: "login_apple" });
      setFormError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }, [appleAuthAvailable, router]);

  const handleGoogle = useCallback(async () => {
    setFormError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setFormError(error.message);
    } catch (e) {
      captureError(e, { flow: "login_google_oauth" });
      setFormError(e instanceof Error ? e.message : "Sign in failed.");
    }
  }, []);

  const handleSignUpLink = useCallback(() => {
    router.push(ROUTES.AUTH_SIGNUP as never);
  }, [router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.TABS_HOME as never);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <PushedHeader title="" onBack={handleBack} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>Sign in to continue building your streak.</Text>

          <View style={styles.stack}>
            <TextField
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setFormError("");
              }}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
              accessibilityLabel="Email address"
            />

            <TextField
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setFormError("");
              }}
              placeholder="Password"
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={() => live && handleSignIn()}
              editable={!loading}
              accessibilityLabel="Password"
              trailing={
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  style={styles.eye}
                >
                  {showPassword ? (
                    <EyeOff size={ICON} color={DS_V3.color.textSecondary} />
                  ) : (
                    <Eye size={ICON} color={DS_V3.color.textSecondary} />
                  )}
                </Pressable>
              }
            />

            <View style={styles.forgot}>
              <TextLink
                label="Forgot password?"
                onPress={handleForgotPassword}
                disabled={loading}
              />
            </View>

            <Button
              label="Sign in"
              disabled={!live}
              loading={loading}
              onPress={handleSignIn}
              accessibilityLabel="Log in to GRIIT"
            />
            {!live && !loading ? (
              <Text style={styles.caption}>{LOGIN_DISABLED_CAPTION}</Text>
            ) : null}

            {formError ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}

            <View style={styles.orRow}>
              <Divider style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <Divider style={styles.orLine} />
            </View>

            {Platform.OS === "ios" && appleAuthAvailable ? (
              <Button
                label="Sign in with Apple"
                variant="secondary"
                disabled={loading}
                onPress={handleApple}
                accessibilityLabel="Continue with Apple"
              />
            ) : null}

            <Button
              label="Sign in with Google"
              variant="secondary"
              disabled={loading}
              onPress={handleGoogle}
              accessibilityLabel="Continue with Google"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TextLink
                label="Sign up"
                onPress={handleSignUpLink}
                disabled={loading}
                accessibilityLabel="Don't have an account. Sign up instead"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function LoginScreen() {
  return (
    <ErrorBoundary>
      <LoginScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
  },
  title: {
    marginTop: DS_V3.space.lg,
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  subtitle: {
    marginTop: DS_V3.space.sm,
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  stack: {
    marginTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  forgot: {
    alignItems: "flex-end",
  },
  eye: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  error: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.danger,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  orLine: {
    flex: 1,
  },
  orText: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    marginTop: DS_V3.space.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
