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
        type: 'expense'
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
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Receipt Manager</Text>
            <Text style={styles.subtitle}>Scan and manage your receipts{getScanLimitMessage()}</Text>
          </View>

          <Card style={styles.scanCard}>
            <Text style={styles.sectionTitle}>Scan New Receipt</Text>
            <Text style={styles.scanDescription}>
              Take a photo of your receipt to automatically extract transaction details
            </Text>
            <Button 
              title={scanning ? "Scanning..." : "Scan Receipt"} 
              onPress={scanReceipt} 
              loading={scanning}
              disabled={scanning || checkScanLimit()}
              style={styles.scanButton}
            />
            {checkScanLimit() && (
              <Text style={styles.limitReachedText}>
                You've reached your monthly scan limit. Upgrade for unlimited scans.
              </Text>
            )}
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Receipts</Text>
            {receipts.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No receipts scanned yet.</Text>
                <Text style={styles.emptySubtext}>Tap "Scan Receipt" to get started.</Text>
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
                      <Text style={styles.statusText}>
                        {receipt.status === 'added_to_transactions' ? 'Added' :
                         receipt.status === 'processed' ? 'Processed' : 'Scanned'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.receiptDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category:</Text>
                      <Text style={styles.detailValue}>{receipt.parsedData.category}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
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
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.primaryActionButton]}
                        onPress={() => addReceiptToTransactions(receipt)}
                      >
                        <Text style={[styles.actionText, styles.primaryActionText]}>Add to Transactions</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <Text style={styles.timestamp}>Scanned: {formatDate(receipt.createdAt)}</Text>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  scanCard: {
    marginBottom: 20,
  },
  scanDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  scanButton: {
    alignSelf: 'flex-start',
  },
  limitReachedText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  receiptCard: {
    marginBottom: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  receiptAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.error,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scannedStatus: {
    backgroundColor: '#DBEAFE',
  },
  processedStatus: {
    backgroundColor: '#FEF3C7',
  },
  addedStatus: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  receiptDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryActionText: {
    color: Colors.white,
  },
  timestamp: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'right',
  },
});