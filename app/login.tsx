import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../CloudflareAuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { googleSignIn } = useAuth();
  const router = useRouter();

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      router.replace('/dashboard');
    } catch (err: any) {
      setError('Failed to log in with Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
      </TouchableOpacity>
      
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to BudgetWise AI</Text>
        <Text style={styles.subtitle}>AI-Powered Personal Finance Manager</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Sign in with your Google account to access your financial dashboard
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  card: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 24, textAlign: 'center' },
  error: { color: '#EF4444', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  googleButton: {
    backgroundColor: '#DB4437',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  infoText: { 
    color: '#64748B', 
    fontSize: 14, 
    textAlign: 'center', 
    marginTop: 16,
    lineHeight: 20
  }
});