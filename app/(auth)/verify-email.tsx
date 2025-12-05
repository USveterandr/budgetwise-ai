import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const success = await verifyEmail(token);
          if (success) {
            setVerificationStatus('success');
          } else {
            setVerificationStatus('error');
          }
        } catch (error) {
          setVerificationStatus('error');
        }
      } else {
        setVerificationStatus('error');
      }
      setLoading(false);
    };

    verify();
  }, [token]);

  const handleContinue = () => {
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.title}>Verifying your email...</Text>
            </View>
          ) : verificationStatus === 'success' ? (
            <View style={styles.centered}>
              <Text style={[styles.icon, { color: '#10B981' }]}>✓</Text>
              <Text style={styles.title}>Email Verified!</Text>
              <Text style={styles.subtitle}>
                Your email has been successfully verified. You can now log in to your account.
              </Text>
              <Button title="Continue to Login" onPress={handleContinue} style={styles.button} />
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={[styles.icon, { color: '#EF4444' }]}>✗</Text>
              <Text style={styles.title}>Verification Failed</Text>
              <Text style={styles.subtitle}>
                We couldn't verify your email. The link may have expired or is invalid.
              </Text>
              <Button title="Back to Login" onPress={handleContinue} style={styles.button} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
});