import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignUp, useSignIn } from '@clerk/clerk-expo';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signUp, isLoaded } = useSignUp();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const params = useLocalSearchParams();
  const token = params.token as string;

  useEffect(() => {
    // Check if we have email from params
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params.email]);

  const handleCodeVerification = async () => {
    if (!isLoaded) {
      setError('System not ready. Please try again.');
      return;
    }
    
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      
      console.log('Verification result:', completeSignUp);
      console.log('Verification status:', completeSignUp.status);
      
      if (completeSignUp.status === 'complete') {
        // Verification successful, navigate to dashboard
        router.replace('/(tabs)/dashboard');
      } else if (completeSignUp.status === 'missing_requirements') {
        // Handle missing requirements specifically
        console.log('Missing requirements:', completeSignUp.missingFields);
        
        // Provide more helpful error message and suggest next steps
        const missingFields = completeSignUp.missingFields?.join(', ') || 'unknown requirements';
        setError(`Verification incomplete. Missing: ${missingFields}. This may be due to an authentication configuration issue. Please contact support or try the login page.`);
      } else {
        setError(`Verification status: ${completeSignUp.status}. Please try again or contact support if the problem persists.`);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Handle various verification error cases
      if (err.errors?.[0]?.code === 'verification_already_verified') {
        // If already verified, try to sign in directly
        if (isSignInLoaded && signIn) {
          try {
            const signInAttempt = await signIn.create({
              identifier: email || (params.email as string),
              password: '', // We don't have the password here, so we'll redirect to login
            });
            
            // Even if we could sign in, we don't have the password, so redirect to login
            setError('Your email is already verified. Please go to the login page.');
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 2000);
          } catch (signInError) {
            console.error('Sign in error:', signInError);
            setError('Your email is already verified. Please go to the login page.');
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 2000);
          }
        } else {
          setError('Your email is already verified. Please go to the login page.');
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        }
      } else if (err.errors?.[0]?.code === 'verification_invalid_code') {
        setError('Invalid verification code. Please check your email and try again.');
      } else if (err.errors?.[0]?.code === 'verification_expired') {
        setError('Verification code has expired. Please request a new one by signing up again.');
      } else if (err.errors?.[0]?.longMessage) {
        setError(err.errors[0].longMessage);
      } else if (err.message) {
        setError(`Verification failed: ${err.message}`);
      } else {
        setError('Verification failed. Please try again or go back to login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    setError('');
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setLoading(false);
      setError('New verification code sent to your email!');
    } catch (err: any) {
      setLoading(false);
      console.error('Resend code error:', err);
      if (err.errors?.[0]?.longMessage) {
        setError(err.errors[0].longMessage);
      } else {
        setError('Failed to resend verification code. Please try again.');
      }
    }
  };

  const handleContinue = () => {
    router.replace('/(auth)/login');
  };

  // If we have a token, show a simple success message since token verification
  // is typically handled by Clerk automatically
  if (token) {
    return (
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.centered}>
              <Text style={[styles.icon, { color: '#10B981' }]}>✓</Text>
              <Text style={styles.title}>Email Verified!</Text>
              <Text style={styles.subtitle}>
                Your email has been successfully verified.
              </Text>
              <Button title="Continue to Login" onPress={handleContinue} style={styles.button} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show code input form for code-based verification
  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.centered}>
            <Text style={[styles.icon, { color: Colors.primary }]}>📧</Text>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email || 'your email'}</Text>
          </View>
          
          <View style={styles.form}>
            <Input 
              label="Verification Code" 
              placeholder="123456" 
              value={code} 
              onChangeText={setCode} 
              keyboardType="number-pad" 
              maxLength={6}
              variant="dark" 
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <Button 
              title="Verify Email" 
              onPress={handleCodeVerification} 
              loading={loading} 
              disabled={code.length !== 6 || loading}
              size="large" 
              style={{ marginTop: 8 }} 
            />
            
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                <Text style={styles.actionText}>Resend Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleContinue}>
                <Text style={styles.actionText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  form: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});