import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { RevenueCatPaywall } from './RevenueCatPaywall';
import { CustomPaywall } from './CustomPaywall';

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
  if (!visible) return null;

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