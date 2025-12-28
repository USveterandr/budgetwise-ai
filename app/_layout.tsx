import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { FinanceProvider } from "../context/FinanceContext";
import { NotificationProvider } from "../context/NotificationContext";
import { StatusBar } from "expo-status-bar";
import { InstallPrompt } from "../components/InstallPrompt";

function RootLayoutNav() {
  const { isAuthenticated, user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const onOnboarding = segments[0] === "onboarding";
    const onPublicPage = ["help-center", "contact-support", "terms-of-service", "privacy", "learn-more"].includes(segments[0] || "");

    if (!isAuthenticated && !inAuthGroup && !onPublicPage && segments[0] !== undefined) {
      // Not authenticated and not in auth group or public page, redirect to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated) {
      if (!user?.onboardingComplete && !onOnboarding && !inAuthGroup && !onPublicPage) {
        // Authenticated but onboarding not complete, force onboarding
        router.replace("/onboarding");
      } else if (user?.onboardingComplete && (inAuthGroup || onOnboarding)) {
        // Authenticated and onboarding complete, but on auth/onboarding pages
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, user, initialized, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="terms-of-service" />
    </Stack>
  );
}

import { ClerkAuthProvider } from "../context/ClerkProvider";

import { WebContainer } from "../components/WebContainer";

export default function RootLayout() {
  return (
    <ClerkAuthProvider>
      <AuthProvider>
        <NotificationProvider>
          <FinanceProvider>
            <StatusBar style="light" />
            <WebContainer>
                <RootLayoutNav />
            </WebContainer>
            <InstallPrompt />
          </FinanceProvider>
        </NotificationProvider>
      </AuthProvider>
    </ClerkAuthProvider>
  );
}