import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { performOCR, parseReceiptText, ReceiptData } from '../../utils/ocrUtils';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface Receipt {
  id: string;
  userId: string;
  imageUrl: string;
  ocrText: string;
  parsedData: ReceiptData;
  createdAt: string;
  status: 'scanned' | 'processed' | 'added_to_transactions';
}

export default function ReceiptsScreen() {
  const { user } = useAuth();
  const { addTransaction } = useFinance();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [scanning, setScanning] = useState(false);
  const [monthlyScans, setMonthlyScans] = useState(0);

  const RECEIPTS_FILE = `${(FileSystem as any).documentDirectory}receipts.json`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(RECEIPTS_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(RECEIPTS_FILE);
        const data = JSON.parse(content);
        setReceipts(data.receipts || []);
        
        // Reset monthly scans if it's a new month
        const lastScanDate = data.lastScanDate ? new Date(data.lastScanDate) : new Date();
        const now = new Date();
        if (lastScanDate.getMonth() !== now.getMonth() || lastScanDate.getFullYear() !== now.getFullYear()) {
          setMonthlyScans(0);
        } else {
          setMonthlyScans(data.monthlyScans || 0);
        }
      }
    } catch (error) {
      console.error('Error loading receipts data:', error);
    }
  };

  const saveData = async (newReceipts: Receipt[], newMonthlyScans: number) => {
    try {
      const data = {
        receipts: newReceipts,
        monthlyScans: newMonthlyScans,
        lastScanDate: new Date().toISOString()
      };
      await FileSystem.writeAsStringAsync(RECEIPTS_FILE, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving receipts data:', error);
    }
  };

  const checkScanLimit = () => {
    if (!user) return false;
    
    const planLimits = {
      'Starter': 50,
      'Professional': Infinity,
      'Business': Infinity,
      'Enterprise': Infinity
    };
    
    const limit = planLimits[user.plan as keyof typeof planLimits] || 50;
    return monthlyScans >= limit;
  };

  const scanReceipt = async () => {
    if (checkScanLimit()) {
      Alert.alert(
        'Scan Limit Reached',
        'You have reached your monthly receipt scan limit. Upgrade your plan for unlimited scans.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade Plan', onPress: () => {} } // Would navigate to subscription page
        ]
      );
      return;
    }

    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to scan receipts.');
      return;
    }

    setScanning(true);
    
    try {
      // Launch camera to capture receipt
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Perform OCR on the captured image
        const ocrText = await performOCR(imageUri);
        
        // Parse the OCR text to extract receipt data
        const parsedData = parseReceiptText(ocrText);
        
        // Create new receipt object
        const newReceipt: Receipt = {
          id: `receipt_${Date.now()}`,
          userId: user?.id || '',
          imageUrl: imageUri,
          ocrText,
          parsedData,
          createdAt: new Date().toISOString(),
          status: 'scanned'
        };
        
        // Update state and save to file
        const updatedReceipts = [newReceipt, ...receipts];
        const updatedMonthlyScans = monthlyScans + 1;
        
        setReceipts(updatedReceipts);
        setMonthlyScans(updatedMonthlyScans);
        await saveData(updatedReceipts, updatedMonthlyScans);
        
        // Show confirmation
        Alert.alert(
          'Receipt Scanned',
          'Your receipt has been scanned and processed successfully.',
          [
            { text: 'Add to Transactions', onPress: () => addReceiptToTransactions(newReceipt) },
            { text: 'View Details', onPress: () => viewReceiptDetails(newReceipt) },
            { text: 'Dismiss', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error scanning receipt:', error);
      Alert.alert('Error', 'Failed to scan receipt. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const addReceiptToTransactions = async (receipt: Receipt) => {
    try {
      // Add the parsed receipt data as a transaction
      await addTransaction({
        description: receipt.parsedData.description,
        amount: receipt.parsedData.amount,
        category: receipt.parsedData.category,
        date: receipt.parsedData.date,
        type: 'expense',
        icon: 'receipt' // Default icon for receipt-based transactions
      });
      
      // Update receipt status
      setReceipts(prev => prev.map(r => 
        r.id === receipt.id 
          ? { ...r, status: 'added_to_transactions' } 
          : r
      ));
      
      Alert.alert('Success', 'Receipt added to transactions successfully!');
    } catch (error) {
      console.error('Error adding receipt to transactions:', error);
      Alert.alert('Error', 'Failed to add receipt to transactions. Please try again.');
    }
  };

  const viewReceiptDetails = (receipt: Receipt) => {
    Alert.alert(
      'Receipt Details',
      `Store: ${receipt.parsedData.description}
Amount: $${receipt.parsedData.amount.toFixed(2)}
Category: ${receipt.parsedData.category}
Date: ${receipt.parsedData.date}
Status: ${receipt.status}`,
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getScanLimitMessage = () => {
    if (!user) return '';
    
    const planLimits = {
      'Starter': 50,
      'Professional': 'Unlimited',
      'Business': 'Unlimited',
      'Enterprise': 'Unlimited'
    };
    
    const limit = planLimits[user.plan as keyof typeof planLimits] || 50;
    return ` (${monthlyScans}/${limit} scans used)`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Receipt Manager</Text>
            <Text style={styles.subtitle}>Scan and manage your receipts{getScanLimitMessage()}</Text>
          </View>

          <Card style={styles.scanCard}>
            <View style={styles.scanHeader}>
              <View style={styles.scanIconContainer}>
                <Ionicons name="camera" size={32} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Scan New Receipt</Text>
                <Text style={styles.scanDescription}>
                  Take a photo of your receipt to automatically extract transaction details
                </Text>
              </View>
            </View>
            <Button 
              title={scanning ? "Scanning..." : "Scan Receipt"} 
              onPress={scanReceipt} 
              loading={scanning}
              disabled={scanning || checkScanLimit()}
              style={styles.scanButton}
            />
            {checkScanLimit() && (
              <View style={styles.limitBadge}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.limitReachedText}>
                  Monthly scan limit reached. Upgrade for more.
                </Text>
              </View>
            )}
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Receipts</Text>
            {receipts.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={64} color="rgba(255, 255, 255, 0.1)" />
                <Text style={styles.emptyText}>No receipts scanned yet</Text>
                <Text style={styles.emptySubtext}>Tap "Scan Receipt" to get started</Text>
              </Card>
            ) : (
              receipts.map((receipt) => (
                <Card key={receipt.id} style={styles.receiptCard}>
                  <View style={styles.receiptHeader}>
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>{receipt.parsedData.description}</Text>
                      <Text style={styles.receiptAmount}>${receipt.parsedData.amount.toFixed(2)}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      receipt.status === 'added_to_transactions' ? styles.addedStatus :
                      receipt.status === 'processed' ? styles.processedStatus :
                      styles.scannedStatus
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: receipt.status === 'added_to_transactions' ? '#10B981' :
                                 receipt.status === 'processed' ? '#F59E0B' : '#3B82F6' }
                      ]}>
                        {receipt.status === 'added_to_transactions' ? 'Added' :
                         receipt.status === 'processed' ? 'Processed' : 'Scanned'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.receiptDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailValue}>{receipt.parsedData.category}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailValue}>{receipt.parsedData.date}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.receiptActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => viewReceiptDetails(receipt)}
                    >
                      <Text style={styles.actionText}>View Details</Text>
                    </TouchableOpacity>
                    
                    {receipt.status !== 'added_to_transactions' && (
                      <Button 
                        title="Add Transaction"
                        onPress={() => addReceiptToTransactions(receipt)}
                        style={styles.primaryActionButton}
                        textStyle={styles.primaryActionText}
                      />
                    )}
                  </View>
                  
                  <Text style={styles.timestamp}>Scanned: {formatDate(receipt.createdAt)}</Text>
                </Card>
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16 },
  header: { marginBottom: 32, paddingVertical: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 },
  scanCard: { marginBottom: 32, padding: 24 },
  scanHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 20 },
  scanIconContainer: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(124, 58, 237, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' },
  scanDescription: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginTop: 4 },
  scanButton: { width: '100%', height: 56 },
  limitBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, gap: 8 },
  limitReachedText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  emptyCard: { padding: 60, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  emptyText: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginTop: 20 },
  emptySubtext: { color: '#64748B', fontSize: 14, marginTop: 8, textAlign: 'center' },
  receiptCard: { marginBottom: 16, padding: 20 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  receiptAmount: { fontSize: 24, fontWeight: '800', color: '#EF4444' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  scannedStatus: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' },
  processedStatus: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
  addedStatus: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  receiptDetails: { marginBottom: 24, gap: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  detailValue: { color: '#F1F5F9', fontSize: 14, fontWeight: '700' },
  receiptActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, alignItems: 'center' },
  actionButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  primaryActionButton: { height: 44, paddingHorizontal: 16, borderRadius: 12 },
  actionText: { color: '#F1F5F9', fontSize: 14, fontWeight: '700' },
  primaryActionText: { fontSize: 14, fontWeight: '700' },
  timestamp: { color: '#64748B', fontSize: 12, marginTop: 20, textAlign: 'right', fontWeight: '500' },
});