import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { RevenueCatPaywall } from './RevenueCatPaywall';

interface PaywallProps {
    visible: boolean;
    onSubscribe?: (pkg: any) => void; 
    onRestore?: () => void;
    onDismiss?: () => void; // Add this prop
}

export const PaywallModal = ({ visible, onSubscribe, onRestore, onDismiss }: PaywallProps) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <RevenueCatPaywall onDismiss={onDismiss || (() => {})} />
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});