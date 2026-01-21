import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

// Configuration
const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'appl_placeholder',
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'test_FEEufnZipzIBFwqHOUrlDJdLlaL', // Using provided test key
};

const ENTITLEMENT_ID = 'Budgetwise AI Advisor Pro'; // Exact entitlement identifier

class RevenueCatService {
  private isConfigured: boolean = false;

  constructor() {
    this.isConfigured = false;
  }

  async configure(userId?: string) {
    if (this.isConfigured) return;

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple, appUserID: userId });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.google, appUserID: userId });
    }
    
    // Enable debug logs for testing
    if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }

    this.isConfigured = true;
    if (__DEV__) console.log("RevenueCat configured with", Platform.OS === 'android' ? API_KEYS.google : API_KEYS.apple);
  }

  async login(userId: string) {
    if (!this.isConfigured) await this.configure(userId);
    await Purchases.logIn(userId);
  }

  async logout() {
    if (!this.isConfigured) return;
    await Purchases.logOut();
  }

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (e) {
      console.error("Error fetching offerings", e);
      return [];
    }
  }

  async purchasePackage(pack: PurchasesPackage) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      return this.checkEntitlement(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error("Purchase error", e);
      }
      return false;
    }
  }

  async restorePurchases() {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return this.checkEntitlement(customerInfo);
    } catch (e) {
      console.error("Restore error", e);
      return false;
    }
  }

  async getSubscriptionStatus() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.checkEntitlement(customerInfo);
    } catch (e) {
         return false;
    }
  }

  checkEntitlement(customerInfo: CustomerInfo) {
    // Check for specific entitlement
    if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
        return true;
    }
    return false;
  }
}

export const revenueCat = new RevenueCatService();
