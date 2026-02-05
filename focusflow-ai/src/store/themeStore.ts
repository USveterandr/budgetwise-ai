import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  urgent: string;
  high: string;
  medium: string;
  low: string;
}

const lightColors: ThemeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  urgent: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#65a30d',
};

const darkColors: ThemeColors = {
  primary: '#818cf8',
  secondary: '#a78bfa',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  urgent: '#f87171',
  high: '#fb923c',
  medium: '#fbbf24',
  low: '#a3e635',
};

interface ThemeState {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getPriorityColor: (priority: string) => string;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      colors: lightColors,
      isDark: false,
      
      setTheme: (theme) => {
        let isDark = false;
        let colors = lightColors;
        
        if (theme === 'dark') {
          isDark = true;
          colors = darkColors;
        } else if (theme === 'system') {
          // In real app, check system preference
          isDark = false;
          colors = lightColors;
        }
        
        set({ theme, colors, isDark });
      },
      
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },
      
      getPriorityColor: (priority) => {
        const colors = get().colors;
        switch (priority) {
          case 'urgent': return colors.urgent;
          case 'high': return colors.high;
          case 'medium': return colors.medium;
          case 'low': return colors.low;
          default: return colors.medium;
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
