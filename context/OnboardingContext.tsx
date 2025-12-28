import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Properly handle AsyncStorage for both web and native environments
let storage: any;

// Check if we're in a browser environment
if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
  // Web environment - use localStorage
  storage = {
    getItem: (key: string) => {
      return Promise.resolve(window.localStorage.getItem(key));
    },
    setItem: (key: string, value: string) => {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
  };
} else {
  // Native environment - use AsyncStorage
  try {
    const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
    storage = AsyncStorage;
  } catch (e) {
    console.warn('AsyncStorage not available, using in-memory fallback');
    // Fallback to in-memory storage
    const memoryStorage: Record<string, string> = {};
    storage = {
      getItem: async (key: string) => {
        return memoryStorage[key] || null;
      },
      setItem: async (key: string, value: string) => {
        memoryStorage[key] = value;
        return Promise.resolve();
      },
      removeItem: async (key: string) => {
        delete memoryStorage[key];
        return Promise.resolve();
      }
    };
  }
}

interface OnboardingData {
  name: string;
  income: string;
  currency: string;
  industry: string;
  goals: string;
  avatarUri?: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    name: '',
    income: '',
    currency: 'USD',
    industry: 'General',
    goals: '',
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from storage on initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await storage.getItem('onboardingData');
        if (savedData) {
          setData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Failed to load onboarding data:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  // Save data to storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const saveData = async () => {
        try {
          await storage.setItem('onboardingData', JSON.stringify(data));
        } catch (error) {
          console.error('Failed to save onboarding data:', error);
        }
      };
      
      saveData();
    }
  }, [data, isInitialized]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      return updated;
    });
  };
  
  const resetData = async () => {
    setData({
      name: '',
      income: '',
      currency: 'USD',
      industry: 'General',
      goals: '',
    });
    
    try {
      await storage.removeItem('onboardingData');
    } catch (error) {
      console.error('Failed to reset onboarding data:', error);
    }
  };

  // Don't render children until data is loaded
  if (!isInitialized) {
    return null; // Or a loading component
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}