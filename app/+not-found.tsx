import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { DS_COLORS } from '@/lib/design-system';

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
    backgroundColor: DS_COLORS.black,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: DS_COLORS.white,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: DS_COLORS.inputPlaceholder,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: DS_COLORS.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: DS_COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
});
