import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Placeholder for Firebase Google Login
    setError('Google login is temporarily disabled. Please use email and password.');
  };

  const resendVerificationEmail = async () => {
    // In a real app, you would implement this functionality
    Alert.alert(
      'Email Sent',
      'A new verification email has been sent to your inbox.',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <View style={styles.iconContainer}><Ionicons name="wallet" size={40} color={Colors.primary} /></View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your financial journey</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              variant="dark"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              variant="dark"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Sign In" onPress={handleLogin} loading={loading} size="large" style={{ marginTop: 8 }} />
            
            {/* Hide Google OAuth on web due to CAPTCHA issues on localhost */}
            {Platform.OS !== 'web' && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <Button 
                  title="Sign In with Google" 
                  onPress={handleGoogleLogin} 
                  loading={loading} 
                  size="large" 
                  variant="outline" 
                  style={styles.googleButton}
                />
              </>
            )}
            
            <TouchableOpacity 
              onPress={() => router.push('/forgot-password')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={styles.link}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/privacy')}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/signup')}>
              <Text style={styles.link}> Create Account</Text>
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
});