import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const { userProfile, logout } = useAuth();

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
      {userProfile?.photoURL ? (
        <Image source={{ uri: userProfile.photoURL }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color="#94A3B8" />
        </View>
      )}
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.email}>Welcome, {userProfile?.displayName || userProfile?.email}</Text>
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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