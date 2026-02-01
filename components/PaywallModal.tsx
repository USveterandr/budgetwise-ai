import React from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
import { RevenueCatPaywall } from './RevenueCatPaywall';
import { CustomPaywall } from './CustomPaywall';
import { WebPaywall } from './WebPaywall';

interface PaywallProps {
    visible: boolean;
    onSubscribe?: (pkg: any) => void; 
    onRestore?: () => void;
    onDismiss?: () => void;
    useCustomPaywall?: boolean; // New prop to toggle between paywalls
}

interface CustomPaywallProps {
    onDismiss: () => void;
    onPurchaseSuccess?: (planId: string) => void;
}

export const PaywallModal = ({ 
    visible, 
    onSubscribe, 
    onRestore, 
    onDismiss, 
    useCustomPaywall = true // Default to custom paywall
}: PaywallProps) => {
  console.log('PaywallModal rendered with visible:', visible);
  
  if (!visible) {
    console.log('PaywallModal returning null because visible is false');
    return null;
  }

  const handleDismiss = onDismiss || (() => {});
  console.log('PaywallModal proceeding to render content');

  // For web platform, always use WebPaywall regardless of useCustomPaywall setting
  if (Platform.OS === 'web') {
    console.log('Rendering WebPaywall');
    return (
      <Modal 
        visible={visible} 
        animationType="slide" 
        presentationStyle="fullScreen"
        transparent={true}
      >
        <WebPaywall 
          onDismiss={handleDismiss} 
          onSuccess={() => {
            // Clear the processing state to allow redirects again
            try {
              // @ts-ignore
              window.isProcessingPurchase = false;
            } catch (e) {
              console.log('Could not clear processing state');
            }
            // Call the original subscribe callback if provided
            onSubscribe?.('web_subscribed');
          }}
        />
      </Modal>
    );
  }

  console.log('Rendering native paywall');
  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      {useCustomPaywall ? (
        <CustomPaywall 
          onDismiss={onDismiss || (() => {})}
          onPurchaseSuccess={(planId: string) => onSubscribe?.(planId)}
        />
      ) : (
        <RevenueCatPaywall onDismiss={onDismiss || (() => {})} />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});