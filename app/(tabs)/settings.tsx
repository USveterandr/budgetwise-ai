import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{user?.plan || 'Pro'} Plan</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Account</Text>
        <Card>
          <SettingItem icon="person" title="Edit Profile" subtitle="Update your personal information" onPress={() => router.push('/(tabs)/profile')} />
          <SettingItem icon="card" title="Payment Methods" subtitle="Manage your payment options" onPress={() => router.push('/(tabs)/subscription')} />
          <SettingItem icon="shield-checkmark" title="Security" subtitle="Password and authentication" onPress={() => {}} />
        </Card>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card>
          <SettingItem icon="notifications" title="Notifications" subtitle="Push and email alerts" rightElement={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} />} />
          <SettingItem icon="moon" title="Dark Mode" subtitle="Switch to dark theme" rightElement={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.primary }} />} />
          <SettingItem icon="finger-print" title="Biometric Login" subtitle="Use Face ID or fingerprint" rightElement={<Switch value={biometric} onValueChange={setBiometric} trackColor={{ true: Colors.primary }} />} />
          <SettingItem icon="globe" title="Currency" subtitle="USD ($)" onPress={() => {}} />
        </Card>

        <Text style={styles.sectionTitle}>Support</Text>
        <Card>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background },
  scroll: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text, marginBottom: 20 },
  profileCard: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: 20, fontWeight: '700', color: DashboardColors.text },
  profileEmail: { fontSize: 14, color: DashboardColors.textSecondary, marginTop: 4 },
  planBadge: { backgroundColor: '#7C3AED20', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  planText: { color: Colors.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: DashboardColors.textSecondary, marginBottom: 12, marginTop: 8 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: DashboardColors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#7C3AED15', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingTitle: { fontSize: 15, fontWeight: '500', color: DashboardColors.text },
  settingSubtitle: { fontSize: 13, color: DashboardColors.textSecondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
  version: { textAlign: 'center', color: DashboardColors.textSecondary, fontSize: 12, marginTop: 16, marginBottom: 32 },
});
