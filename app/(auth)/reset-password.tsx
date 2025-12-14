import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams();
  const token = params.token as string;

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        Alert.alert('Error', 'Invalid reset token');
        return;
      }

      const success = await resetPassword(token, password);
      if (success) {
        Alert.alert(
          'Success', 
          'Your password has been reset successfully.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to reset password. The link may have expired.');
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your new password below.
        </Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={DashboardColors.textSecondary}
          />
          
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={DashboardColors.textSecondary}
          />
          
          <Button 
            title={loading ? "Resetting..." : "Reset Password"} 
            onPress={handleResetPassword} 
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