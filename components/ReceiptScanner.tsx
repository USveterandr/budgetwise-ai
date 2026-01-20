import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { cloudflare } from '../app/lib/cloudflare';
import { useAuth } from '../AuthContext';

interface ReceiptScannerProps {
  onScanComplete: (data: any) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false);
  const { getToken } = useAuth() as any;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].base64) {
      processImage(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to scan receipts');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0].base64) {
      processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64: string) => {
    try {
      setScanning(true);
      const token = await getToken();
      if (!token) {
          Alert.alert('Error', 'You must be logged in to scan receipts');
          return;
      }
      
      // Use the Cloudflare Worker bridge instead of local Gemini service
      const data = await cloudflare.parseReceiptImage(base64, token);
      onScanComplete(data);
    } catch (error: any) {
      console.error('Scan error:', error);
      Alert.alert('Scanning Failed', error.message || 'Could not extract data from receipt.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Receipt Scanner</Text>
        <Ionicons name="scan-outline" size={20} color={Colors.primary} />
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={scanning}>
          <Ionicons name="camera" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={scanning}>
          <Ionicons name="images" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
      
      {scanning && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Extracting data...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loading: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  }
});