import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet, ViewStyle } from 'react-native';
import { restorePurchases, ENTITLEMENT_ID } from '../services/revenueCat';

interface Props {
  style?: ViewStyle;
}

export const RestorePurchasesButton: React.FC<Props> = ({ style }) => {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo?.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert('Success', 'Purchases restored successfully! You now have access to Pro features.');
      } else {
        Alert.alert('No Subscription Found', 'We could not find any active subscriptions to restore.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleRestore}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#94A3B8" size="small" />
      ) : (
        <Text style={styles.text}>Restore Purchases</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  text: {
    color: '#94A3B8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});