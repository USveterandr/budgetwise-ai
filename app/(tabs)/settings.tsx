import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
    ]);
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={DashboardColors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Settings</Text>

          <Card style={styles.profileCard}>
            <LinearGradient 
              colors={[Colors.primary, Colors.secondary]} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            </LinearGradient>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planText}>{user?.plan || 'Starter'} Plan</Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.sectionContainer}>
            <SettingItem icon="person" title="Edit Profile" subtitle="Update your personal information" onPress={() => router.push('/(tabs)/profile')} />
            <SettingItem icon="card" title="Payment Methods" subtitle="Manage your payment options" onPress={() => router.push('/(tabs)/subscription')} />
            <SettingItem icon="shield-checkmark" title="Security" subtitle="Password and authentication" onPress={() => {}} />
          </Card>

          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.sectionContainer}>
            <SettingItem icon="notifications" title="Notifications" subtitle="Push and email alerts" rightElement={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} ios_backgroundColor="rgba(255,255,255,0.1)" />} />
            <SettingItem icon="moon" title="Dark Mode" subtitle="Switch to dark theme" rightElement={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.primary }} ios_backgroundColor="rgba(255,255,255,0.1)" />} />
            <SettingItem icon="finger-print" title="Biometric Login" subtitle="Use Face ID or fingerprint" rightElement={<Switch value={biometric} onValueChange={setBiometric} trackColor={{ true: Colors.primary }} ios_backgroundColor="rgba(255,255,255,0.1)" />} />
            <SettingItem icon="globe" title="Currency" subtitle="USD ($)" onPress={() => {}} />
          </Card>

          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.sectionContainer}>
            <SettingItem icon="help-circle" title="Help Center" subtitle="FAQs and guides" onPress={() => router.push('/help-center')} />
            <SettingItem icon="chatbubble" title="Contact Support" subtitle="Get help from our team" onPress={() => router.push('/contact-support')} />
            <SettingItem icon="document-text" title="Terms of Service" onPress={() => router.push('/terms-of-service')} />
            <SettingItem icon="lock-closed" title="Privacy Policy" onPress={() => router.push('/privacy')} />
          </Card>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>BudgetWise AI v1.0.0</Text>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', marginBottom: 24, letterSpacing: -1 },
  profileCard: { alignItems: 'center', marginBottom: 32, paddingVertical: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
  profileEmail: { fontSize: 14, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  planBadge: { backgroundColor: 'rgba(124, 58, 237, 0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 16, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)' },
  planText: { color: '#A78BFA', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 16, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionContainer: { padding: 8, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(124, 58, 237, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#F1F5F9' },
  settingSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, marginTop: 32, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444', marginLeft: 10 },
  version: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 32, fontWeight: '600' },
});
