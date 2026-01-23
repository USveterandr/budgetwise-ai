import { Platform } from 'react-native';
import { revenueCat } from './revenueCatService';

/**
 * Subscription Plans Configuration
 * These should match the offerings and packages configured in the RevenueCat Dashboard.
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$14.99',
    period: 'month',
    features: [
      'AI Financial Advisor',
      'Unlimited Receipt Scanning',
      'Advanced Analytics',
      'Priority Support'
    ],
    popular: false,
    revenueCatPackageId: '$rc_monthly'
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: '$99.99',
    period: 'year',
    features: [
      'Everything in Monthly',
      'Save 45% annually',
      'Exclusive Beta Features',
      'VIP Concierge Support'
    ],
    popular: true,
    revenueCatPackageId: '$rc_annual'
  },
  {
    id: 'lifetime',
    name: 'Lifetime Elite',
    price: '$299.99',
    period: 'once',
    features: [
      'One-time payment',
      'Human Financial Consultation',
      'Tax Optimization Tools',
      'Lifetime Updates'
    ],
    popular: false,
    revenueCatPackageId: 'lifetime_access'
  }
];

/**
 * Presents the paywall UI.
 * On Mobile: Uses RevenueCat's native Paywall UI.
 * On Web: Returns true to signal that the web-specific UI should be shown.
 */
export async function presentPaywall(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // For web, we return true to indicate the caller should show the custom web paywall modal
    return true;
  }

  try {
    // Import RevenueCatUI dynamically to avoid issues on web if not properly shimmed
    const RevenueCatUI = require('react-native-purchases-ui').default;
    const { PAYWALL_RESULT } = require('react-native-purchases-ui');

    const paywallResult = await RevenueCatUI.presentPaywall({
      displayCloseButton: true,
    });

    return (
      paywallResult === PAYWALL_RESULT.PURCHASED ||
      paywallResult === PAYWALL_RESULT.RESTORED
    );
  } catch (e) {
    console.error("Paywall presentation error:", e);
    return false;
  }
}

/**
 * Handles the purchase of a specific plan on the web.
 * In a real production app, this would redirect to Stripe or another web payment provider.
 */
export async function purchasePlanWeb(planId: string): Promise<boolean> {
  console.log(`[Web] Initiating purchase for plan: ${planId}`);
  
  // Simulate a payment process
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, you'd handle the Stripe checkout here
      resolve(true);
    }, 2000);
  });
}
