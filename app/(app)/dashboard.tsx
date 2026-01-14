import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

export default function Dashboard() {
  const { logout, userProfile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
      await logout();
      router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[Colors.primary, '#1e293b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome Back</Text>
          <Text style={styles.username}>{userProfile?.name || userProfile?.email || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Overview</Text>
        <Text style={styles.placeholderText}>Your budget data will appear here.</Text>
      </View>

      <View style={styles.card}>
         <Text style={styles.cardTitle}>Recent Transactions</Text>
         <Text style={styles.placeholderText}>No transactions yet.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  contentContainer: { paddingBottom: 40 },
  header: { padding: 30, paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerContent: { flex: 1 },
  greeting: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  username: { fontSize: 28, color: 'white', fontWeight: 'bold', marginTop: 5 },
  logoutButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  card: { backgroundColor: 'white', margin: 20, marginTop: 0, marginBottom: 20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#334155' },
  placeholderText: { color: '#64748b', fontStyle: 'italic' }
});
