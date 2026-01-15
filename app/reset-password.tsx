import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function ResetPassword() {
  const { confirmPasswordReset } = useAuth();
  const router = useRouter();
  const { token } = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) return setError("Please fill in all fields.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!token) return setError("Invalid or missing reset token.");

    try {
      setError('');
      setLoading(true);
      
      // @ts-ignore
      await confirmPasswordReset(token, password);
      
      setSuccess(true);
      setTimeout(() => {
          router.replace('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error(err);
      setError('Failed to update password: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
      return (
          <View style={styles.container}>
              <View style={styles.card}>
                  <Ionicons name="checkmark-circle" size={64} color="#4ade80" style={{ alignSelf: 'center', marginBottom: 20 }} />
                  <Text style={styles.title}>Password Updated!</Text>
                  <Text style={styles.subtitle}>Redirecting to login...</Text>
              </View>
          </View>
      )
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="New password"
            placeholderTextColor="#64748B"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#64748B"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20, 
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#94A3B8',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
