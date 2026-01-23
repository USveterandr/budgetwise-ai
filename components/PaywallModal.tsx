import React from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
import { RevenueCatPaywall } from './RevenueCatPaywall';
import { WebPaywall } from './WebPaywall';

interface PaywallProps {
    visible: boolean;
    onSubscribe?: (pkg: any) => void; 
    onRestore?: () => void;
    onDismiss?: () => void;
}

export const PaywallModal = ({ visible, onSubscribe, onRestore, onDismiss }: PaywallProps) => {
  const handleDismiss = onDismiss || (() => {});

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="fullScreen"
      transparent={Platform.OS === 'web'}
    >
        {Platform.OS === 'web' ? (
          <WebPaywall onDismiss={handleDismiss} />
        ) : (
          <RevenueCatPaywall onDismiss={handleDismiss} />
        )}
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});
