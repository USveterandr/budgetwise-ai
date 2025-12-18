import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSignUp, useOAuth, useSignIn } from '@clerk/clerk-expo';

export default function SignupScreen() {
  const { signup } = useAuth();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google OAuth
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!isLoaded) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // First create user in Clerk
      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
      });
      
      console.log('Sign up attempt result:', signUpAttempt);
      
      // Prepare email verification
      const prepareResult = await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      console.log('Prepare verification result:', prepareResult);
      
      setLoading(false);
      setPendingVerification(true);
    } catch (err: any) {
      setLoading(false);
      console.error('Clerk sign up error:', err);
      if (err.errors?.[0]?.code === 'form_identifier_exists') {
        setError('An account with this email already exists. Try logging in instead.');
      } else if (err.errors?.[0]?.longMessage) {
        setError(err.errors[0].longMessage);
      } else {
        setError('An error occurred during sign up. Please try again.');
      }
    }
  };

  const onPressVerify = async () => {
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
      console.log('Attempting verification with code:', code);
      
      // Attempt to verify the email address
      const verifyResult = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('Verification result:', verifyResult);
      console.log('Verification status:', verifyResult.status);

      if (verifyResult.status === 'complete') {
        // Verification successful, activate the session
        console.log('Verification complete, activating session:', verifyResult.createdSessionId);
        await setActive({ session: verifyResult.createdSessionId });
        // Navigate to dashboard
        router.replace('/(tabs)/dashboard');
      } else if (verifyResult.status === 'missing_requirements') {
        // Missing requirements reported by Clerk
        console.log('Missing requirements:', verifyResult.missingFields);
        
        try {
          // Attempt to complete sign up with any missing fields we know
          const updateData: any = {
            emailAddress: email,
            password: password,
          };
          if (name) {
            updateData.firstName = name.split(' ')[0];
            updateData.lastName = name.split(' ').slice(1).join(' ') || '';
          }
          const completeResult = await signUp.update(updateData);
          console.log('Update result:', completeResult);
          
          if (completeResult.status === 'complete') {
            await setActive({ session: completeResult.createdSessionId });
            router.replace('/(tabs)/dashboard');
          } else {
            // Avoid auto-resend to prevent loops; ask user to resend explicitly
            setError('Additional verification required. Please tap "Resend Code" and use the newest code from your email.');
          }
        } catch (updateError: any) {
          console.error('Update error:', updateError);
          
          // Check if this is an environment variable issue
          if (updateError?.message?.includes('publishableKey') || updateError?.message?.includes('API key')) {
            setError('Authentication service is not properly configured. Please contact support.');
          } else {
            setError('Unable to complete registration. Please try signing up again or contact support if the problem persists.');
          }
          setPendingVerification(false);
        }
      } else {
        // Verification not complete, check status
        setError(`Verification status: ${verifyResult.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Handle specific error cases
      // Avoid auto-resend on generic "Additional verification required" to prevent loops
      const longMessage = err?.errors?.[0]?.longMessage as string | undefined;
      if (longMessage && longMessage.toLowerCase().includes('additional verification required')) {
        setError('Additional verification required. Please tap "Resend Code" and use the latest code.');
        setLoading(false);
        return;
      }
      if (err.errors?.[0]?.code === 'verification_already_verified') {
        // If already verified, try to sign in directly
        if (isSignInLoaded && signIn) {
          try {
            const signInAttempt = await signIn.create({
              identifier: email,
              password: password,
            });
            
            if (signInAttempt.status === 'complete') {
              await setActive({ session: signInAttempt.createdSessionId });
              router.replace('/(tabs)/dashboard');
            } else {
              setError('Your email is already verified. Please try logging in.');
              setTimeout(() => {
                router.replace('/(auth)/login');
              }, 3000);
            }
          } catch (signInError) {
            console.error('Sign in error:', signInError);
            setError('Your email is already verified. Please go to the login page.');
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 3000);
          }
        } else {
          setError('Your email is already verified. Please go to the login page.');
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 3000);
        }
      } else if (err.errors?.[0]?.code === 'verification_invalid_code') {
        setError('Invalid verification code. Please check your email and try again.');
      } else if (err.errors?.[0]?.code === 'verification_expired') {
        setError('Verification code has expired. Please sign up again.');
        setPendingVerification(false);
      } else if (err.errors?.[0]?.longMessage) {
        setError(err.errors[0].longMessage);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Verification failed. Please check your code and try again. If the problem persists, go back and sign up again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to resend verification code
  const resendVerificationCode = async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    setError('');
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setLoading(false);
      setError('New verification code sent! Check your email.');
    } catch (err: any) {
      setLoading(false);
      console.error('Resend code error:', err);
      if (err.errors?.[0]?.longMessage) {
        setError(err.errors[0].longMessage);
      } else {
        setError('Failed to resend verification code. Please try signing up again.');
        setPendingVerification(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Starting Google OAuth flow...');
      const result = await googleAuth();
      console.log('OAuth result:', result);
      
      if (result.createdSessionId) {
        // Set the user as active
        await result.setActive!({ session: result.createdSessionId });
        
        console.log('Session activated, navigating to dashboard');
        // Navigate to dashboard
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('No session created, user may have cancelled');
        setError('Sign up was not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Google sign up error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Provide more specific error messages
      if (err?.message?.includes('CAPTCHA') || err?.message?.includes('captcha')) {
        setError('CAPTCHA verification failed. This is common on localhost. Try: 1) Use the Login page instead, or 2) Use email signup, or 3) See OAUTH_CAPTCHA_FIX.md for solutions.');
      } else if (err?.code === 'oauth_client_not_found' || err?.message?.includes('invalid_client')) {
        setError('Google sign up is not properly configured. Please contact support.');
      } else if (err?.message?.includes('access_denied') || err?.code === 'access_denied') {
        setError('Google sign up was cancelled.');
      } else if (err?.message?.includes('popup_closed') || err?.code === 'popup_closed') {
        setError('Sign up window was closed. Please try again.');
      } else if (err?.message?.includes('already exists') || err?.code === 'identifier_exists') {
        setError('An account with this Google email already exists. Please use the Login page instead.');
      } else {
        setError(`Failed to sign up with Google: ${err?.message || 'Unknown error'}. Please try email signup or the Login page.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-open" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
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
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button 
                title="Verify Email" 
                onPress={onPressVerify} 
                loading={loading} 
                disabled={code.length !== 6 || loading}
                size="large" 
                style={{ marginTop: 8 }} 
              />
              
              <View style={styles.verificationActions}>
                <TouchableOpacity onPress={resendVerificationCode} disabled={loading}>
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                  <Text style={styles.loginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                onPress={() => setPendingVerification(false)}
                style={{ marginTop: 20, alignItems: 'center' }}
              >
                <Text style={styles.changeEmailText}>Use a different email</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

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
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
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