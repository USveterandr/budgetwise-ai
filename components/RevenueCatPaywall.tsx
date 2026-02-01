import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { Ionicons } from '@expo/vector-icons';
import { getOfferings, purchasePackage, restorePurchases } from '../services/revenueCat';
import { Colors } from '../constants/Colors';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const RevenueCatPaywall: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const currentOffering = await getOfferings();
    if (currentOffering) {
      setPackages(currentOffering.availablePackages);
    }
    setLoading(false);
  };

  const handlePurchase = async (pack: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const customerInfo = await purchasePackage(pack);
      if (customerInfo?.entitlements.active['Budgetwise AI Advisor Pro']) {
        Alert.alert('Success', 'Welcome to Pro!');
        onSuccess();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo?.entitlements.active['Budgetwise AI Advisor Pro']) {
        Alert.alert('Success', 'Purchases restored!');
        onSuccess();
      } else {
        Alert.alert('Info', 'No active subscriptions found to restore.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Upgrade to Pro</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.features}>
          <FeatureRow text="Unlimited AI Advisor Chats" />
          <FeatureRow text="Advanced Receipt Scanning" />
          <FeatureRow text="Investment Portfolio Analysis" />
          <FeatureRow text="Custom Budget Plans" />
        </View>

        <View style={styles.packages}>
          {packages.map((pack) => (
            <TouchableOpacity
              key={pack.identifier}
              style={styles.packageCard}
              onPress={() => handlePurchase(pack)}
              disabled={purchasing}
            >
              <View>
                <Text style={styles.packageTitle}>{pack.product.title}</Text>
                <Text style={styles.packageDesc}>{pack.product.description}</Text>
              </View>
              <Text style={styles.packagePrice}>{pack.product.priceString}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>

      {purchasing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
  <View style={styles.featureRow}>
    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 30 },
  closeButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginLeft: 10 },
  content: { paddingHorizontal: 20 },
  features: { marginBottom: 40 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  featureText: { color: '#CBD5E1', fontSize: 16 },
  packages: { gap: 16 },
  packageCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  packageTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  packageDesc: { color: '#94A3B8', fontSize: 12, maxWidth: 200 },
  packagePrice: { color: '#D4AF37', fontSize: 18, fontWeight: 'bold' },
  restoreButton: { marginTop: 30, alignItems: 'center', padding: 16 },
  restoreText: { color: '#94A3B8', fontSize: 14, textDecorationLine: 'underline' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }
});