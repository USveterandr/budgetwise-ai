import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await signup(name, email, password);
      if (success) {
        router.replace('/onboarding');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred during sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('Google signup is temporarily disabled. Please use email and password.');
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your journey to financial freedom</Text>
          </View>

          <View style={styles.form}>
            <Input label="Full Name" placeholder="Enter your name" value={name} onChangeText={setName} variant="dark" />
            <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" variant="dark" />
            <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry variant="dark" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Create Account" onPress={handleSignup} loading={loading} size="large" style={{ marginTop: 8 }} />
            
            {/* Hide Google OAuth on web due to CAPTCHA issues on localhost */}
            {Platform.OS !== 'web' && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <Button 
                  title="Sign Up with Google" 
                  onPress={handleGoogleSignup} 
                  loading={loading} 
                  size="large" 
                  variant="outline" 
                  style={styles.googleButton}
                />
              </>
            )}
            
            <TouchableOpacity 
              onPress={() => router.push('/privacy')}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                By creating an account, you agree to our{'\n'}
                <Text style={{ color: Colors.primary }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.link}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(124, 58, 237, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  form: { marginBottom: 30 },
  error: { color: Colors.error, fontSize: 14, marginBottom: 12, textAlign: 'center' },
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 20 
  },
  dividerLine: { 
    flex: 1, 
    height: 1, 
    backgroundColor: Colors.border 
  },
  dividerText: { 
    color: Colors.textSecondary, 
    paddingHorizontal: 10, 
    fontSize: 14 
  },
  googleButton: { 
    marginTop: 8 
  },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  link: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  changeEmailText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});