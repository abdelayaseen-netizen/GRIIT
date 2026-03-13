import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="identity" />
      <Stack.Screen name="barrier" />
      <Stack.Screen name="intensity" />
      <Stack.Screen name="social" />
      <Stack.Screen name="proof" />
      <Stack.Screen name="challenge" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="first-task" />
    </Stack>
  );
}
