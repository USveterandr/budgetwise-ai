import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/Button';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      // The AppLayout will automatically redirect to /login.
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.email}>Welcome, {currentUser?.email}</Text>
      <Button title="Log Out" onPress={handleLogout} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  email: {
    fontSize: 18,
    color: '#94A3B8',
  },
});