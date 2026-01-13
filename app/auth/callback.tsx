import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // The CloudflareAuthContext will handle the token from the URL params
    // This route just shows a loading screen while auth completes
    const timer = setTimeout(() => {
      if (params.token) {
        // Auth successful, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // Auth failed, redirect back to login
        router.replace('/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#F8FAFC',
    fontSize: 16,
    marginTop: 16,
  },
});
