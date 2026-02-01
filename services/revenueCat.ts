import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo, PurchasesOffering, PurchasesStoreProduct } from 'react-native-purchases';
import Constants from 'expo-constants';

// Entitlement ID configured in RevenueCat dashboard
export const ENTITLEMENT_ID = 'Budgetwise AI Advisor Pro';

export const initializeRevenueCat = async () => {
  // Enable debug logs for development
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // Get the API key based on the platform
  const apiKey = Platform.select({
    ios: Constants.expoConfig?.extra?.revenueCatAppleKey,
    android: Constants.expoConfig?.extra?.revenueCatGoogleKey,
  });

  if (!apiKey) {
    console.warn('RevenueCat API key not found. Please check your .env file and app.config.js.');
    return;
  }

  try {
    await Purchases.configure({ apiKey });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
};

export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current;
    }
    console.warn('No current offerings found in RevenueCat');
    return null;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

export const purchasePackage = async (pack: PurchasesPackage): Promise<CustomerInfo | null> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pack);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Purchase error:', error);
      throw error;
    }
    return null;
  }
};

export const purchaseStoreProduct = async (product: PurchasesStoreProduct): Promise<CustomerInfo | null> => {
  try {
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Purchase error:', error);
      throw error;
    }
    return null;
  }
};

export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
};

export const checkEntitlement = (customerInfo: CustomerInfo | null): boolean => {
  if (!customerInfo) return false;
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
};