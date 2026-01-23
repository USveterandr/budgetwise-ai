import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
// import RevenueCatUI from 'react-native-purchases-ui'; // Moved to dynamic require for web safety
import { useAuth } from '../AuthContext';
import { revenueCat } from '../services/revenueCatService';
import { cloudflare } from '../app/lib/cloudflare';
import { tokenCache } from '../utils/tokenCache';

interface RevenueCatPaywallProps {
  onDismiss: () => void;
}

export const RevenueCatPaywall = ({ onDismiss }: RevenueCatPaywallProps) => {
  const { updateProfile, getToken, userProfile } = useAuth() as any;

  if (Platform.OS === 'web') {
    return null; // Should not be rendered on web
  }

  const RevenueCatUI = require('react-native-purchases-ui').default;

  const handlePurchaseCompleted = async (customerInfo: any) => {
    // Check if user is now entitled
    const isPro = revenueCat.checkEntitlement(customerInfo);
    
    if (isPro) {
      // Update our database
      try {
        const token = await getToken();
        if (token) {
           await cloudflare.updateProfile({ subscription_status: 'active' }, token);
           // Update local context
           updateProfile({ subscription_status: 'active' });
        }
      } catch (e) {
        console.error("Failed to sync subscription to backend", e);
      }
      onDismiss();
    }
  };

  const handleRestoreCompleted = async (customerInfo: any) => {
      const isPro = revenueCat.checkEntitlement(customerInfo);
      if (isPro) {
          const token = await getToken();
          if (token) {
             await cloudflare.updateProfile({ subscription_status: 'active' }, token);
             updateProfile({ subscription_status: 'active' });
          }
          onDismiss();
      } else {
          // Optional: Show alert that no subscription was found
      }
  }

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall 
        onPurchaseCompleted={({ customerInfo }) => handlePurchaseCompleted(customerInfo)}
        onRestoreCompleted={({ customerInfo }) => handleRestoreCompleted(customerInfo)}
        onDismiss={onDismiss}
        // Optional: Customizing appearance if not defined in dashboard
        options={{
            displayCloseButton: true,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // fallback
  },
});
