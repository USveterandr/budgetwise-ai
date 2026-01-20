import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const tokenCache = {
  async getToken(key: string) {
    if (isWeb) {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null; 
    }
    try {
      // SecureStore is only for native
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (__DEV__) console.error('SecureStore get item error: ', error);
      return null;
    }
  },
  
  async saveToken(key: string, value: string) {
    if (isWeb) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
        return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
       if (__DEV__) console.error("Error storing token", error);
    }
  },

  async deleteToken(key: string) {
    if (isWeb) {
         if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
         }
         return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
       if (__DEV__) console.error("Error deleting token", error);
    }
  }
};
