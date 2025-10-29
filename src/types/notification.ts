export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  budget_alerts: boolean;
  spending_alerts: boolean;
  investment_updates: boolean;
  newsletter: boolean;
  created_at: string;
  updated_at: string;
}