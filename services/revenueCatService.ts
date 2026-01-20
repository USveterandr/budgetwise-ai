import Imports from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || 'appl_placeholder',
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || 'goog_placeholder',
};

class RevenueCatService {
  private isConfigured: boolean = false;

  constructor() {
    this.isConfigured = false;
  }

  async configure(userId?: string) {
    if (this.isConfigured) return;

    if (Platform.OS === 'ios') {
      Imports.configure({ apiKey: API_KEYS.apple, appUserID: userId });
    } else if (Platform.OS === 'android') {
      Imports.configure({ apiKey: API_KEYS.google, appUserID: userId });
    }

    this.isConfigured = true;
    if (__DEV__) console.log("RevenueCat configured");
  }

  async login(userId: string) {
    if (!this.isConfigured) await this.configure(userId);
    await Imports.logIn(userId);
  }

  async logout() {
    if (!this.isConfigured) return;
    await Imports.logOut();
  }

  async getOfferings() {
    try {
      const offerings = await Imports.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (e) {
      console.error("Error fetching offerings", e);
      return [];
    }
  }

  async purchasePackage(pack: any) {
    try {
      const { customerInfo } = await Imports.purchasePackage(pack);
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
      const customerInfo = await Imports.restorePurchases();
      return this.checkEntitlement(customerInfo);
    } catch (e) {
      console.error("Restore error", e);
      return false;
    }
  }

  async getSubscriptionStatus() {
    try {
      const customerInfo = await Imports.getCustomerInfo();
      return this.checkEntitlement(customerInfo);
    } catch (e) {
         return false;
    }
  }

  checkEntitlement(customerInfo: any) {
    // Replace 'premium' with your actual entitlement ID from RevenueCat dashboard
    if (customerInfo.entitlements.active['premium']) {
      return true;
    }
    return false;
  }
}

export const revenueCat = new RevenueCatService();
