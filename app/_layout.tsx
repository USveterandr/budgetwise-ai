import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../AuthContext";
import { StatusBar } from "expo-status-bar";
import { InstallPrompt } from "../components/InstallPrompt";
import { WebContainer } from "../components/WebContainer";
import { InstallProvider } from "../InstallContext";

import { FinanceProvider } from "../context/FinanceContext";

export default function RootLayout() {
  return (
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
  );
}
