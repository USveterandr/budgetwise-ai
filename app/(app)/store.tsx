import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { PurchasesStoreProduct } from 'react-native-purchases';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getOfferings, purchaseStoreProduct } from '../../services/revenueCat';
import { Colors } from '../../constants/Colors';

export default function StoreScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const offerings = await getOfferings();
      if (offerings && offerings.availablePackages.length > 0) {
        // Extract the StoreProduct from each package to list them individually
        const storeProducts = offerings.availablePackages.map(pkg => pkg.product);
        setProducts(storeProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: PurchasesStoreProduct) => {
    setPurchasing(product.identifier);
    try {
      const customerInfo = await purchaseStoreProduct(product);
      if (customerInfo?.entitlements.active['Budgetwise AI Advisor Pro']) {
        Alert.alert('Success', 'Purchase successful! You are now a Pro member.');
        router.back();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Unknown error occurred');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const renderProductItem = ({ item }: { item: PurchasesStoreProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handlePurchase(item)}
      disabled={purchasing !== null}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>{item.priceString}</Text>
      </View>
      <View style={styles.actionContainer}>
        {purchasing === item.identifier ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Ionicons name="cart-outline" size={24} color={Colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Store Products</Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.identifier}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#1E293B' },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  listContent: { padding: 20 },
  productCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  productInfo: { flex: 1 },
  productTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  productDescription: { fontSize: 14, color: '#94A3B8', marginBottom: 8 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#D4AF37' },
  actionContainer: { marginLeft: 16, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 16 },
});