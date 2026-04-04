import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { reportClientError } from "@/lib/client-error-reporting";

function logError(error: Error, componentStack: string | null | undefined) {
  if (__DEV__) {
    // error swallowed — handle in UI
  } else {
    reportClientError(error, componentStack ?? undefined);
  }
}

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Render error:", error.message, error.stack);
    logError(error, errorInfo.componentStack);
  }

  retry = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{"We've"} been notified. Try again or restart the app.</Text>
          <TouchableOpacity style={styles.button} onPress={this.retry} activeOpacity={0.8} accessibilityLabel="Try again" accessibilityRole="button">
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: DS_COLORS.overlayDarker,
  },
  title: {
    fontSize: 18,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.white,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: DS_COLORS.grayMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: DS_COLORS.taskIndigo,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: DS_RADIUS.MD,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.white,
  },
});
