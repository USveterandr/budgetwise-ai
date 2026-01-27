import { WebPaywall } from './WebPaywall';
>>>>>>> 9a7db0edf39312609ca35e9c1bff2a8823e45957

interface PaywallProps {
    visible: boolean;
    onSubscribe?: (pkg: any) => void; 
    onRestore?: () => void;
    onDismiss?: () => void;
<<<<<<< HEAD
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
}

export const PaywallModal = ({ visible, onSubscribe, onRestore, onDismiss }: PaywallProps) => {
  const handleDismiss = onDismiss || (() => {});
>>>>>>> 9a7db0edf39312609ca35e9c1bff2a8823e45957

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
<<<<<<< HEAD
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
      transparent={Platform.OS === 'web'}
    >
        {Platform.OS === 'web' ? (
          <WebPaywall onDismiss={handleDismiss} />
        ) : (
          <RevenueCatPaywall onDismiss={handleDismiss} />
        )}
>>>>>>> 9a7db0edf39312609ca35e9c1bff2a8823e45957
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});
import React from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
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
=======
import { WebPaywall } from './WebPaywall';
>>>>>>> 9a7db0edf39312609ca35e9c1bff2a8823e45957

interface PaywallProps {
    visible: boolean;
    onSubscribe?: (pkg: any) => void; 
    onRestore?: () => void;
    onDismiss?: () => void;
<<<<<<< HEAD
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
=======
}

export const PaywallModal = ({ visible, onSubscribe, onRestore, onDismiss }: PaywallProps) => {
  const handleDismiss = onDismiss || (() => {});
>>>>>>> 9a7db0edf39312609ca35e9c1bff2a8823e45957

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
<<<<<<< HEAD
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
=======
      transparent={Platform.OS === 'web'}
    >
        {Platform.OS === 'web' ? (
          <WebPaywall onDismiss={handleDismiss} />
        ) : (
          <RevenueCatPaywall onDismiss={handleDismiss} />
        )}
>>>>>>> 9a7db0edf39312609ca35e9c1bff2a8823e45957
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});
