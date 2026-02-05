import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { SignIn } from '@clerk/clerk-react-native';
import { useThemeStore } from '../store';

export default function LoginScreen() {
  const { colors } = useThemeStore();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <SignedOut>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>FocusFlow AI</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your AI Productivity Assistant
          </Text>
        </View>
        
        <SignIn 
          appearance={{
            variables: {
              colorPrimary: colors.primary,
              colorBackground: colors.surface,
              colorText: colors.text,
              colorTextSecondary: colors.textSecondary,
              colorDanger: colors.error,
              borderRadius: '10px',
            },
            elements: {
              formButtonPrimary: {
                backgroundColor: colors.primary,
                color: 'white',
              },
              socialButtonsBlockButton: {
                borderColor: colors.border,
              },
              dividerLine: {
                backgroundColor: colors.border,
              },
            },
          }}
          oauthOptions={{
            strategy: 'oauth_google',
            redirectUrl: 'focusflow://oauth-callback',
          }}
        />
      </SignedOut>
      
      <SignedIn>
        <View style={styles.loggedIn}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            You are signed in.
          </Text>
        </View>
      </SignedIn>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  loggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
