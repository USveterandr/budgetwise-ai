import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
// import RevenueCatUI from 'react-native-purchases-ui';

interface CustomerCenterProps {
  visible: boolean;
  onDismiss: () => void;
}

export const CustomerCenterModal = ({ visible, onDismiss }: CustomerCenterProps) => {
  const [RevenueCatUI, setRevenueCatUI] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    if (Platform.OS !== 'web') {
      import('react-native-purchases-ui')
        .then(mod => {
          if (isMounted) {
            setRevenueCatUI(mod.default);
          }
        })
        .catch(error => {
          if (__DEV__) {
            console.warn('Failed to load RevenueCat UI', error);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  if (Platform.OS === 'web' || !RevenueCatUI) {
    return null; // Customer Center is not supported on web yet
  }

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
