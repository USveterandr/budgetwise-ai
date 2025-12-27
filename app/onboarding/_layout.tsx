import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../context/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="email-verification" />
        <Stack.Screen name="basic-info" />
        <Stack.Screen name="financial-setup" />
        <Stack.Screen name="bank-connect" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="done" />
      </Stack>
    </OnboardingProvider>
  );
}
