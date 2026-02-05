import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://focusflow-api.your-subdomain.workers.dev';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('clerk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('clerk-token');
      // Trigger re-authentication
    }
    return Promise.reject(error);
  }
);

// Task API
export const taskApi = {
  getTasks: async (filters?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get('/tasks', { params: filters });
    return response.data;
  },
  
  getTask: async (id: string) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },
  
  createTask: async (task: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    category?: string;
    tags?: string[];
    goal_id?: string;
  }) => {
    const response = await apiClient.post('/tasks', task);
    return response.data;
  },
  
  updateTask: async (id: string, updates: Partial<Task>) => {
    const response = await apiClient.patch(`/tasks/${id}`, updates);
    return response.data;
  },
  
  completeTask: async (id: string) => {
    const response = await apiClient.post(`/tasks/${id}/complete`);
    return response.data;
  },
  
  deleteTask: async (id: string) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Goal API
export const goalApi = {
  getGoals: async () => {
    const response = await apiClient.get('/goals');
    return response.data;
  },
  
  getGoal: async (id: string) => {
    const response = await apiClient.get(`/goals/${id}`);
    return response.data;
  },
  
  createGoal: async (goal: {
    title: string;
    description?: string;
    category?: string;
    target_date?: string;
    color?: string;
    icon?: string;
    milestones?: Array<{
      title: string;
      description?: string;
      target_date?: string;
    }>;
  }) => {
    const response = await apiClient.post('/goals', goal);
    return response.data;
  },
  
  updateGoal: async (id: string, updates: Partial<Goal>) => {
    const response = await apiClient.patch(`/goals/${id}`, updates);
    return response.data;
  },
  
  completeGoal: async (id: string) => {
    const response = await apiClient.post(`/goals/${id}/complete`);
    return response.data;
  },
  
  deleteGoal: async (id: string) => {
    const response = await apiClient.delete(`/goals/${id}`);
    return response.data;
  },
};

// Calendar API
export const calendarApi = {
  getEvents: async (start?: string, end?: string) => {
    const response = await apiClient.get('/calendar/events', {
      params: { start, end },
    });
    return response.data;
  },
  
  createEvent: async (event: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    all_day?: boolean;
    location?: string;
  }) => {
    const response = await apiClient.post('/calendar/events', event);
    return response.data;
  },
  
  updateEvent: async (id: string, updates: Partial<Event>) => {
    const response = await apiClient.patch(`/calendar/events/${id}`, updates);
    return response.data;
  },
  
  deleteEvent: async (id: string) => {
    const response = await apiClient.delete(`/calendar/events/${id}`);
    return response.data;
  },
  
  syncCalendar: async (provider: 'google' | 'apple' | 'outlook') => {
    const response = await apiClient.post('/calendar/sync', { provider });
    return response.data;
  },
};

// AI API
export const aiApi = {
  generateDailyPlan: async (date: string) => {
    const response = await apiClient.post('/ai/daily-plan', { date });
    return response.data;
  },
  
  getProductivityInsight: async () => {
    const response = await apiClient.post('/ai/productivity-insight');
    return response.data;
  },
  
  sendChatMessage: async (message: string, conversationId?: string) => {
    const response = await apiClient.post('/ai/chat', {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  },
  
  getConversations: async () => {
    const response = await apiClient.get('/ai/conversations');
    return response.data;
  },
  
  getConversationMessages: async (conversationId: string) => {
    const response = await apiClient.get(`/ai/conversations/${conversationId}/messages`);
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (updates: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    timezone?: string;
    language?: string;
    avatar_url?: string;
  }) => {
    const response = await apiClient.patch('/user/profile', updates);
    return response.data;
  },
  
  getStats: async () => {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },
  
  getIntegrations: async () => {
    const response = await apiClient.get('/user/integrations');
    return response.data;
  },
  
  deleteIntegration: async (type: string) => {
    const response = await apiClient.delete(`/user/integrations/${type}`);
    return response.data;
  },
};

// Subscription API
export const subscriptionApi = {
  getStatus: async () => {
    const response = await apiClient.get('/subscriptions/status');
    return response.data;
  },
  
  getPlans: async () => {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data;
  },
  
  linkRevenueCatId: async (revenuecatAppUserId: string) => {
    const response = await apiClient.post('/subscriptions/revenuecat-id', {
      revenuecat_app_user_id: revenuecatAppUserId,
    });
    return response.data;
  },
};

// Reminder API
export const reminderApi = {
  getReminders: async (status?: string) => {
    const response = await apiClient.get('/reminders', { params: { status } });
    return response.data;
  },
  
  createReminder: async (reminder: {
    type: string;
    title: string;
    body?: string;
    scheduled_at: string;
    related_entity_type?: string;
    related_entity_id?: string;
  }) => {
    const response = await apiClient.post('/reminders', reminder);
    return response.data;
  },
  
  dismissReminder: async (id: string) => {
    const response = await apiClient.post(`/reminders/${id}/dismiss`);
    return response.data;
  },
  
  getPreferences: async () => {
    const response = await apiClient.get('/reminders/preferences');
    return response.data;
  },
  
  updatePreferences: async (type: string, preferences: {
    enabled?: boolean;
    channels?: { push?: boolean; email?: boolean; sms?: boolean };
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  }) => {
    const response = await apiClient.put(`/reminders/preferences/${type}`, preferences);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default apiClient;
