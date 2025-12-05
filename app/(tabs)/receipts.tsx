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

  useEffect(() => {
    // Load saved receipts from storage or database
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    // In a real app, this would load from a database
    // For now, we'll use mock data for demonstration
    const mockReceipts: Receipt[] = [
      {
        id: '1',
        userId: user?.id || '',
        imageUrl: '', // Would be an actual image URL in a real app
        ocrText: 'WALMART\n123 Main Street\nAnytown, ST 12345\n(555) 123-4567\n\nCashier: John D.     Register: 5\nDate: 12/04/2025     Time: 14:30\n\nItems:\nBananas             1.99\nApple Juice         3.49\nBread               2.29\nMilk                3.99\n\nSubtotal:           11.76\nTax:                0.94\nTotal:              12.70\n\nPayment Method: Credit Card\nApproval Code: 123456',
        parsedData: {
          description: 'WALMART',
          amount: 12.70,
          category: 'Shopping',
          date: '2025-12-04'
        },
        createdAt: '2025-12-04T14:30:00Z',
        status: 'processed'
      }
    ];
    
    setReceipts(mockReceipts);
  };

  const scanReceipt = async () => {
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
        
        // Add to receipts list
        setReceipts(prev => [newReceipt, ...prev]);
        
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

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Receipt Manager</Text>
            <Text style={styles.subtitle}>Scan and manage your receipts</Text>
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
              disabled={scanning}
              style={styles.scanButton}
            />
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