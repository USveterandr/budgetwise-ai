import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Dynamically import AsyncStorage to handle web compatibility
let AsyncStorage: any = null;

// Check if we're in a React Native environment
if (typeof window !== 'undefined' && (window as any).document) {
  // Web environment - use localStorage
  AsyncStorage = {
    getItem: async (key: string) => {
      return localStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      localStorage.removeItem(key);
    }
  };
} else {
  // Native environment - import react-native-async-storage
  import('@react-native-async-storage/async-storage').then(module => {
    AsyncStorage = module.default;
  }).catch(() => {
    console.warn('AsyncStorage not available, using memory fallback');
    // Fallback to in-memory storage
    const storage: Record<string, string> = {};
    AsyncStorage = {
      getItem: async (key: string) => {
        return Promise.resolve(storage[key] || null);
      },
      setItem: async (key: string, value: string) => {
        storage[key] = value;
        return Promise.resolve();
      },
      removeItem: async (key: string) => {
        delete storage[key];
        return Promise.resolve();
      }
    };
  });
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

  // Load data from AsyncStorage on initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('onboardingData');
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

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem('onboardingData', JSON.stringify(data));
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
      await AsyncStorage.removeItem('onboardingData');
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