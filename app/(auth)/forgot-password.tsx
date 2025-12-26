import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { sendPasswordResetEmail, resetPassword } = useAuth();

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setIsVerifying(true);
      Alert.alert('Success', 'A reset code has been sent to your email.');
    } catch (error: any) {
      console.error('Reset email error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !password) {
      Alert.alert('Error', 'Please enter the code and your new password');
      return;
    }

    setLoading(true);
    try {
      const success = await resetPassword(code, password);
      if (success) {
        Alert.alert(
          'Password Reset', 
          'Your password has been updated successfully. You are now signed in.',
          [{ text: 'Great!', onPress: () => router.replace('/(tabs)/dashboard') }]
        );
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#1E1B4B', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name={isVerifying ? "lock-open" : "mail-open"} size={40} color={Colors.primary} />
              </View>
              <Text style={styles.title}>{isVerifying ? "Security Code" : "Forgot Password?"}</Text>
              <Text style={styles.subtitle}>
                {isVerifying 
                  ? "Enter the 6-digit code sent to your email and choose a new password."
                  : "Enter your email address to receive a secure reset code."}
              </Text>
            </View>

            <View style={styles.form}>
              {!isVerifying ? (
                <>
                  <Input
                    label="Email Address"
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    variant="dark"
                  />
                  <Button 
                    title={loading ? "Sending..." : "Send Reset Link"} 
                    onPress={handleSendResetEmail} 
                    loading={loading}
                    size="large"
                    style={{ marginTop: 20 }}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Reset Code"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    variant="dark"
                  />
                  <Input
                    label="New Password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    variant="dark"
                  />
                  <Button 
                    title={loading ? "Resetting..." : "Update Password"} 
                    onPress={handleResetPassword} 
                    loading={loading}
                    size="large"
                    style={{ marginTop: 20 }}
                  />
                  <TouchableOpacity onPress={() => setIsVerifying(false)} style={styles.resendBtn}>
                    <Text style={styles.resendText}>Didn't get a code? Try again</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 24, paddingTop: 60, flexGrow: 1 },
  backBtn: { marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(139, 92, 246, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, marginBottom: 12, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
  form: { width: '100%' },
  resendBtn: { marginTop: 24, alignItems: 'center' },
  resendText: { color: Colors.primaryLight, fontSize: 14, fontWeight: '600' },
});