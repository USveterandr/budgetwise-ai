import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform as PlatformRN } from 'react-native';
import { Task } from './database';

export interface Reminder {
  id: string;
  taskId?: string;
  goalId?: string;
  title: string;
  body: string;
  scheduledTime: Date;
  recurring?: 'daily' | 'weekly' | 'monthly';
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Failed to get push notification permission');
        return false;
      }
    }
    return true;
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async setupMessageListeners() {
    messaging().onMessage(async remoteMessage => {
      console.log('FCM Message Received:', remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open:', remoteMessage);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
      }
    });
  }

  async scheduleTaskReminder(task: Task, reminderTime: Date): Promise<void> {
    try {
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.error('No FCM token available');
        return;
      }

      await this.sendPushNotification({
        title: `Task Reminder: ${task.title}`,
        body: `Don't forget to complete your task! Priority: ${task.priority}`,
        scheduledTime: reminderTime,
        data: {
          taskId: task.id,
          type: 'task_reminder',
        },
      });
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
    }
  }

  async scheduleDailyReminder(time: string): Promise<void> {
    try {
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.error('No FCM token available');
        return;
      }

      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await this.sendPushNotification({
        title: 'Daily Planning Reminder',
        body: 'Time to plan your day and review your tasks!',
        scheduledTime,
        recurring: 'daily',
        data: {
          type: 'daily_reminder',
        },
      });
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  async scheduleGoalReminder(goalTitle: string, reminderTime: Date): Promise<void> {
    try {
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.error('No FCM token available');
        return;
      }

      await this.sendPushNotification({
        title: `Goal Reminder: ${goalTitle}`,
        body: 'Keep working towards your goal! Progress check time.',
        scheduledTime: reminderTime,
        data: {
          type: 'goal_reminder',
          goalTitle,
        },
      });
    } catch (error) {
      console.error('Error scheduling goal reminder:', error);
    }
  }

  async sendSmartSuggestion(suggestion: string): Promise<void> {
    try {
      const fcmToken = await this.getFCMToken();
      if (!fcmToken) {
        console.error('No FCM token available');
        return;
      }

      await this.sendPushNotification({
        title: 'Productivity Tip',
        body: suggestion,
        scheduledTime: new Date(),
        data: {
          type: 'productivity_tip',
        },
      });
    } catch (error) {
      console.error('Error sending smart suggestion:', error);
    }
  }

  private async sendPushNotification(data: any): Promise<void> {
    console.log('Notification scheduled:', data);
  }

  async cancelReminder(reminderId: string): Promise<void> {
    console.log('Reminder cancelled:', reminderId);
  }

  async cancelAllReminders(): Promise<void> {
    console.log('All reminders cancelled');
  }
}

export default NotificationService.getInstance();
