import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { DS_V3, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          This screen doesn{"'"}t exist.
        </Text>
        <Link href="/" asChild>
          <Pressable style={styles.button} accessibilityLabel="Go to Home" accessibilityRole="button">
            <Text style={styles.buttonText}>Go to Home</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: DS_V3.color.canvas,
  },
  title: {
    fontSize: 24,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_V3.color.textPrimary,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: DS_V3.color.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: DS_V3.color.textPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: DS_RADIUS.SM,
  },
  buttonText: {
    color: DS_V3.color.canvas,
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
});
