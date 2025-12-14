import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../ui/Button';

interface ReceiptScannerProps {
  onScanComplete: (data: { description: string; amount: number; category: string; date: string }) => void;
  onCancel: () => void;
}

export function ReceiptScanner({ onScanComplete, onCancel }: ReceiptScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraType] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);

  React.useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      'Receipt Scanned!',
      `Barcode type ${type} with data ${data} has been scanned!`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'Use Data',
          onPress: () => {
            // Parse the scanned data to extract receipt information
            // This is a simplified example - in a real app, you'd use OCR
            const parsedData = {
              description: 'Scanned Receipt',
              amount: Math.floor(Math.random() * 100) + 1, // Random amount for demo
              category: 'Shopping',
              date: new Date().toISOString().split('T')[0],
            };
            onScanComplete(parsedData);
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera. Please enable camera permissions in settings.</Text>
        <Button title="Cancel" onPress={onCancel} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'code128', 'code39', 'pdf417'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.title}>Scan Receipt</Text>
            <Text style={styles.instructions}>Position receipt barcode in the frame</Text>
          </View>
          
          <View style={styles.frameContainer}>
            <View style={styles.frameCornerTopLeft} />
            <View style={styles.frameCornerTopRight} />
            <View style={styles.frameCornerBottomLeft} />
            <View style={styles.frameCornerBottomRight} />
          </View>
          
          <View style={styles.bottomOverlay}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.flashButton}
              onPress={() => {
                // Flash functionality would go here
              }}
            >
              <Ionicons name="flashlight" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    padding: 20,
    color: '#FFF',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructions: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  frameContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
  },
  bottomOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 40,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});