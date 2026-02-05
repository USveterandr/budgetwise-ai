import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { AuthProvider } from "../AuthContext";
import { StatusBar } from "expo-status-bar";
import { InstallPrompt } from "../components/InstallPrompt";
import { WebContainer } from "../components/WebContainer";
import { InstallProvider } from "../InstallContext";
import { ErrorBoundary } from "../components/ErrorBoundary";

import { FinanceProvider } from "../context/FinanceContext";
import { initializeRevenueCat } from "../services/revenueCat";

// Import global CSS for web builds
if (Platform.OS === 'web') {
  require('../public/global.css');
}

export default function RootLayout() {
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <InstallProvider>
            <StatusBar style="light" />
            <WebContainer>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="(app)" />
              </Stack>
            </WebContainer>
            <InstallPrompt />
          </InstallProvider>
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
