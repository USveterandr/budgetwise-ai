import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, googleSignIn } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      router.replace('/');
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
        <Text style={styles.title}>Welcome Back</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#64748B"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.link}>Sign Up</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 24, textAlign: 'center' },
  error: { color: '#EF4444', marginBottom: 16, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  label: { color: '#94A3B8', marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, color: '#F8FAFC', fontSize: 16 },
  button: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  googleButton: {
    backgroundColor: '#DB4437',
    marginTop: 12,
    flexDirection: 'row',
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#94A3B8' },
  link: { color: '#3B82F6', fontWeight: 'bold' },
});