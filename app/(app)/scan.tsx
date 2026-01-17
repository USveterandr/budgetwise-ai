import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { cloudflare } from '../lib/cloudflare';
import { tokenCache } from '../../utils/tokenCache';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { geminiService } from '../../services/geminiService';
import * as ImagePicker from 'expo-image-picker';

export default function ScanScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [facing] = useState<'front' | 'back'>('back');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(''); // 'scanning' | 'processing' | 'saving'
    
    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [scannedData, setScannedData] = useState<any>(null);

    // Platform-optimized image handling
    const processImage = async (base64: string) => {
        try {
            setLoading(true);
            setStatus('Analyzing with AI...');
            const receiptData = await geminiService.parseReceiptImage(base64);
            
            setScannedData({
                amount: receiptData.amount?.toString() || '',
                description: receiptData.merchant || 'Unknown Merchant',
                category: receiptData.category || 'Other',
                date: receiptData.date || new Date().toISOString()
            });
            
            setEditModalVisible(true);
        } catch (e: any) {
            if (Platform.OS === 'web') {
                alert(`Scan Failed: ${e.message}`);
            } else {
                Alert.alert("Scan Failed", e.message);
            }
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    const handleWebPick = async (mode: 'camera' | 'library') => {
        try {
            let result;
            if (mode === 'camera') {
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.5,
                    base64: true,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.5,
                    base64: true,
                });
            }

            if (!result.canceled && result.assets[0].base64) {
                await processImage(result.assets[0].base64);
            }
        } catch (e: any) {
            console.error(e);
            alert('Failed to pick image');
        }
    };

    const takePicture = async () => {
        if (!cameraRef.current) return;
        
        try {
            setLoading(true);
            setStatus('Capturing...');
            
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: true
            });

            if (!photo?.base64) throw new Error("Failed to capture image");
            await processImage(photo.base64);

        } catch (e: any) {
            Alert.alert("Scan Failed", e.message);
            setLoading(false);
            setStatus('');
        }
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            setStatus('Saving...');
             
            const token = await tokenCache.getToken("budgetwise_jwt_token");
            if (!token) throw new Error("Authentication error");

            await cloudflare.addTransaction({
                amount: parseFloat(scannedData.amount),
                description: scannedData.description,
                category: scannedData.category,
                type: 'expense', // Receipts are expenses
                date: scannedData.date
            }, token);

            setEditModalVisible(false);
            if (Platform.OS === 'web') {
                alert("Receipt saved successfully!");
                router.replace('/dashboard');
            } else {
                Alert.alert("Success", "Receipt saved successfully!", [
                    { text: 'OK', onPress: () => router.replace('/dashboard') }
                ]);
            }

        } catch (e: any) {
             const msg = e.message || "Unknown error";
             if (Platform.OS === 'web') {
                 alert(`Save Error: ${msg}`);
             } else {
                 Alert.alert("Save Error", msg);
             }
        } finally {
            setLoading(false);
            setStatus('');
        }
    }
    
    // --- Render Web Fallback ---
    if (Platform.OS === 'web') {
        return (
            <View style={[styles.container, { minHeight: 600 }]}>
                <View style={styles.header}>
                     <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="close" size={24} color="white" />
                     </TouchableOpacity>
                     <Text style={styles.title}>Upload Receipt</Text>
                     <View style={{width: 40}} />
                </View>

                <View style={[styles.overlay, { gap: 20 }]}>
                    <TouchableOpacity onPress={() => handleWebPick('camera')} style={styles.webBtn}>
                        <Ionicons name="camera" size={32} color={Colors.gold} />
                        <Text style={styles.webBtnText}>Take Photo</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => handleWebPick('library')} style={[styles.webBtn, { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                        <Ionicons name="images" size={32} color="white" />
                        <Text style={[styles.webBtnText, { color: 'white' }]}>Upload File</Text>
                    </TouchableOpacity>

                    {loading && <ActivityIndicator size="large" color={Colors.gold} style={{marginTop: 20}} />}
                    {loading && <Text style={{color: Colors.gold, marginTop: 10}}>{status}</Text>}
                </View>

                {/* Re-use Modal */}
                <Modal visible={editModalVisible} transparent animationType="slide">
                 <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.webModal]}>
                        <Text style={styles.modalTitle}>Review Receipt</Text>
                        
                        <Text style={styles.label}>Merchant</Text>
                        <TextInput 
                            style={styles.input} 
                            value={scannedData?.description}
                            onChangeText={(t) => setScannedData({...scannedData, description: t})}
                        />

                        <Text style={styles.label}>Amount</Text>
                        <TextInput 
                            style={styles.input} 
                            value={scannedData?.amount}
                            onChangeText={(t) => setScannedData({...scannedData, amount: t})}
                            keyboardType="decimal-pad"
                        />
                        
                        <Text style={styles.label}>Category</Text>
                        <TextInput 
                            style={styles.input} 
                            value={scannedData?.category}
                            onChangeText={(t) => setScannedData({...scannedData, category: t})}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save Expense</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                 </View>
                </Modal>
            </View>
        );
    }

    // --- Render Native Camera ---
    if (!permission) {
        // Camera permissions are still loading
        return (
            <View style={styles.permissionContainer}>
                <ActivityIndicator size="large" color={Colors.gold} />
                <Text style={styles.permissionText}>Initializing Camera...</Text>
            </View>
        );
    }
    
    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need camera access to scan receipts</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={24} color="white" />
                 </TouchableOpacity>
                 <Text style={styles.title}>Scan Receipt</Text>
                 <View style={{width: 40}} />
            </View>

            <CameraView 
                ref={cameraRef}
                style={styles.camera} 
                facing={facing}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.hint}>Align receipt within frame</Text>
                </View>
            </CameraView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.captureBtn} 
                    onPress={takePicture}
                    disabled={loading}
                >
                    <View style={styles.captureInner} />
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color={Colors.gold} />
                    <Text style={styles.loaderText}>{status}</Text>
                </View>
            )}

            {/* Confirmation Modal */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                 <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Review Receipt</Text>
                        
                        <Text style={styles.label}>Merchant</Text>
                        <TextInput 
                            style={styles.input} 
                            value={scannedData?.description}
                            onChangeText={(t) => setScannedData({...scannedData, description: t})}
                        />

                        <Text style={styles.label}>Amount</Text>
                        <TextInput 
                            style={styles.input} 
                            value={scannedData?.amount}
                            onChangeText={(t) => setScannedData({...scannedData, amount: t})}
                            keyboardType="decimal-pad"
                        />
                        
                        <Text style={styles.label}>Category</Text>
                        <TextInput 
                            style={styles.input} 
                            value={scannedData?.category}
                            onChangeText={(t) => setScannedData({...scannedData, category: t})}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save Expense</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                 </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
    permissionText: { color: 'white', marginBottom: 20 },
    btn: { backgroundColor: Colors.gold, padding: 16, borderRadius: 8 },
    btnText: { fontWeight: 'bold' },

    header: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
    backBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    // Web Styles
    webBtn: { 
        width: 200, 
        padding: 20, 
        backgroundColor: 'rgba(212, 175, 55, 0.1)', 
        borderWidth: 1, 
        borderColor: Colors.gold, 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 10
    },
    webBtnText: { color: Colors.gold, fontSize: 16, fontWeight: 'bold' },
    webModal: { maxWidth: 500, alignSelf: 'center', width: '100%' },

    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanFrame: { width: 280, height: 400, borderWidth: 2, borderColor: Colors.gold, borderRadius: 20, backgroundColor: 'transparent' },
    hint: { color: 'white', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },

    footer: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
    captureBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' },

    loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    loaderText: { color: Colors.gold, marginTop: 16, fontSize: 16, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end', paddingBottom: Platform.OS === 'web' ? 40 : 0 },
    modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    label: { color: '#94A3B8', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' },
    input: { backgroundColor: '#0F172A', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
    modalActions: { flexDirection: 'row', gap: 16 },
    cancelBtn: { flex: 1, padding: 16, alignItems: 'center' },
    saveBtn: { flex: 1, backgroundColor: Colors.gold, padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelText: { color: '#94A3B8' },
    saveText: { color: '#020617', fontWeight: 'bold' }
});
