import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const success = await sendPasswordResetEmail(email);
      if (success) {
        Alert.alert(
          'Success', 
          'Password reset instructions have been sent to your email address.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={DashboardColors.textSecondary}
          />
          
          <Button 
            title={loading ? "Sending..." : "Send Reset Link"} 
            onPress={handleSendResetEmail} 
            disabled={loading}
            style={styles.button}
          />
          
          <Button 
            title="Back to Login" 
            variant="outline" 
            onPress={() => router.push('/(auth)/login')} 
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DashboardColors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DashboardColors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: DashboardColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: DashboardColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: DashboardColors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: DashboardColors.text,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
});