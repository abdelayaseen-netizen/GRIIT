/**
 * expo-notifications console.errors keychain misses on simulator.
 * LogBox turns console.error into a toast — ignore only those strings.
 */
import { LogBox } from "react-native";

export const PUSH_REGISTRATION_LOGBOX_IGNORES = [
  "Error reading persisted server registration info",
  "Keychain access failed: A required entitlement isn't present.",
  "Error fetching offerings",
] as const;

LogBox.ignoreLogs([...PUSH_REGISTRATION_LOGBOX_IGNORES]);
