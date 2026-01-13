import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { googleSignIn } = useAuth();
  const router = useRouter();

  async function handleGoogleSignup() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      router.replace('/dashboard');
    } catch (err: any) {
      setError('Failed to create account: ' + err.message);
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
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Start managing your finances with AI</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.link}>Log In</Text>
          </TouchableOpacity>
        </View>
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#94A3B8' },
  link: { color: '#3B82F6', fontWeight: 'bold' },
});