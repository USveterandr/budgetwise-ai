import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Colors } from '../constants/Colors';

export default function OAuthNativeCallback() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    // Give Clerk a moment to fully process the OAuth session
    const timer = setTimeout(() => {
      if (isSignedIn && user) {
        console.log('OAuth success, redirecting to dashboard');
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('OAuth failed or cancelled, redirecting to signup');
        router.replace('/(auth)/signup');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
});
