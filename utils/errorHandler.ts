/**
 * Centralized error handling utilities for production
 */

import { Alert, Platform } from 'react-native';
import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Show error to user in a platform-appropriate way
 */
export function showError(error: AppError | Error | string, title: string = 'Error') {
  const message = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : error.message;

  logger.error(title, message, error);

  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Show success message to user
 */
export function showSuccess(message: string, title: string = 'Success') {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Parse API errors into user-friendly messages
 */
export function parseApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return error.error;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle network errors specifically
 */
export function handleNetworkError(error: any): string {
  if (!error) return 'Network error occurred';
  
  if (error.message?.includes('Network request failed')) {
    return 'No internet connection. Please check your network and try again.';
  }
  
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  return parseApiError(error);
}
