import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, refreshNotifications, markAsRead, markAllAsRead, loading } = useNotification();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      refreshNotifications(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await refreshNotifications(user.id);
    }
    setRefreshing(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Button 
            title={`Mark All as Read (${unreadCount})`} 
            onPress={handleMarkAllAsRead} 
            variant="outline" 
            style={styles.markAllButton} 
          />
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {unreadNotifications.length === 0 && readNotifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="notifications-off" size={48} color={DashboardColors.textSecondary} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </Card>
        ) : (
          <>
            {unreadNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Unread</Text>
                {unreadNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    isNew={true}
                    formatDate={formatDate}
                  />
                ))}
              </View>
            )}

            {readNotifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Earlier</Text>
                {readNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={handleMarkAsRead}
                    isNew={false}
                    formatDate={formatDate}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationItem({ 
  notification, 
  onMarkAsRead,
  isNew,
  formatDate
}: { 
  notification: any; 
  onMarkAsRead: (id: string) => void;
  isNew: boolean;
  formatDate: (dateString: string) => string;
}) {
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'budget_alert':
        return 'warning';
      case 'reminder':
        return 'alarm';
      case 'achievement':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case 'budget_alert':
        return Colors.error;
      case 'reminder':
        return Colors.primary;
      case 'achievement':
        return Colors.success;
      default:
        return DashboardColors.text;
    }
  };

  return (
    <Card style={isNew ? styles.newNotification : styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons 
            name={getIconForCategory(notification.category) as any} 
            size={20} 
            color={getIconColor(notification.category)} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>{formatDate(notification.created_at)}</Text>
        </View>
        {isNew && (
          <TouchableOpacity 
            style={styles.markAsReadButton}
            onPress={() => onMarkAsRead(notification.id)}
          >
            <Ionicons name="checkmark" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DashboardColors.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: DashboardColors.text },
  markAllButton: { paddingHorizontal: 12, paddingVertical: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: DashboardColors.text, marginBottom: 12 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 18, fontWeight: '600', color: DashboardColors.text, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: DashboardColors.textSecondary, marginTop: 8, textAlign: 'center' },
  notificationItem: { marginBottom: 12 },
  newNotification: { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  notificationHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  notificationIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: DashboardColors.surface, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: DashboardColors.text, marginBottom: 4 },
  notificationMessage: { fontSize: 14, color: DashboardColors.textSecondary, marginBottom: 4 },
  notificationTime: { fontSize: 12, color: DashboardColors.textSecondary },
  markAsReadButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: `${Colors.primary}20`, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: 8
  },
});