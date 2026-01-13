import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { InstallPrompt } from "../components/InstallPrompt";
import { WebContainer } from "../components/WebContainer";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <WebContainer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="(app)" />
        </Stack>
      </WebContainer>
      <InstallPrompt />
    </AuthProvider>
  );
}