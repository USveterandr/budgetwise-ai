import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { FinanceProvider } from "../context/FinanceContext";
import { NotificationProvider } from "../context/NotificationContext";
import { StatusBar } from "expo-status-bar";
import { ClerkAuthProvider } from "../context/ClerkProvider";
import { InstallPrompt } from "../components/InstallPrompt";

export default function RootLayout() {
  return (
    <ClerkAuthProvider>
      <AuthProvider>
        <NotificationProvider>
          <FinanceProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <InstallPrompt />
          </FinanceProvider>
        </NotificationProvider>
      </AuthProvider>
    </ClerkAuthProvider>
  );
}