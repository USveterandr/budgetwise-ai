import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Display a loading indicator while checking for authentication.
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!currentUser) {
    // Redirect to the login page if the user is not authenticated.
    return <Redirect href="/login" />;
  }

  // Render the children routes if the user is authenticated.
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}