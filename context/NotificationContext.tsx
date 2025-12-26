import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { cloudflare } from '../app/lib/cloudflare';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: 'budget_alert' | 'reminder' | 'achievement';
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendLocalNotification: (title: string, body: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('NotificationProvider initialized');

  // Request notification permissions
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      // Get the token that identifies this device
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
    }
  };

  const refreshNotifications = async (userId: string) => {
    console.log('Refreshing notifications for user:', userId);
    setLoading(true);
    try {
      const data = await cloudflare.getNotifications(userId);
      if (data) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          category: n.category,
          read: Boolean(n.read),
          created_at: n.created_at,
        })));
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
      console.log('Notification refresh complete');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await cloudflare.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const n of unreadNotifications) {
        await cloudflare.markNotificationAsRead(n.id);
      }
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (e) {
      console.error('Error marking all notifications as read:', e);
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (e) {
      console.error('Error sending local notification:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('NotificationProvider rendering with notifications:', notifications.length);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      refreshNotifications, 
      markAsRead, 
      markAllAsRead,
      sendLocalNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}