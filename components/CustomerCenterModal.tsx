import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Platform } from 'react-native';
// import RevenueCatUI from 'react-native-purchases-ui';

interface CustomerCenterProps {
  visible: boolean;
  onDismiss: () => void;
}

export const CustomerCenterModal = ({ visible, onDismiss }: CustomerCenterProps) => {
  if (Platform.OS === 'web') {
    return null; // Customer Center is not supported on web yet
  }

  const RevenueCatUI = require('react-native-purchases-ui').default;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <RevenueCatUI.CustomerCenter 
            onDismiss={onDismiss}
            presentationStyle="fullScreen" 
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
