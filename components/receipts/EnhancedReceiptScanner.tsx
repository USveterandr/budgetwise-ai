import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { DashboardColors, Colors } from '../../constants/Colors';
import { Button } from '../ui/Button';
import { ReceiptData } from '../../services/geminiService';
import { geminiService } from '../../services/geminiService';

interface EnhancedReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
  onCancel: () => void;
}

export function EnhancedReceiptScanner({ onScanComplete, onCancel }: EnhancedReceiptScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType] = useState<'back' | 'front'>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  React.useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        // Capture the image
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true
        });
        
        if (!photo?.base64) {
          throw new Error('Failed to capture image');
        }
        
        // Use Gemini Vision API for OCR
        const receiptData = await geminiService.parseReceiptImage(photo.base64);
        
        // Pass the parsed data back to the parent component
        onScanComplete(receiptData);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
        setIsProcessing(false);
      }
    }
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
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.title}>Scan Receipt</Text>
            <Text style={styles.instructions}>Position your receipt in the frame and tap the capture button</Text>
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
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <View style={styles.captureInnerCircle} />
              )}
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
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
  },
  frameCornerTopLeft: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  frameCornerTopRight: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
  },
  frameCornerBottomLeft: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  frameCornerBottomRight: {
    position: 'absolute',
    bottom: -1,
    right: -1,
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
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
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