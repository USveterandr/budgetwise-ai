import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Ionicons name="information-circle" size={64} color="#3B82F6" style={styles.icon} />
        <Text style={styles.title}>Password Reset Not Available</Text>
        <Text style={styles.message}>
          BudgetWise AI uses Google OAuth for secure authentication.
          {'\n\n'}
          If you need to reset your Google account password, please visit:
          {'\n'}
          myaccount.google.com
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  card: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  icon: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16, textAlign: 'center' },
  message: { color: '#94A3B8', marginBottom: 24, textAlign: 'center', lineHeight: 22 },
  button: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center', width: '100%' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});