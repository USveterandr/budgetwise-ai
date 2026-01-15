import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PaywallProps {
    visible: boolean;
    onSubscribe: () => void;
}

export const PaywallModal = ({ visible, onSubscribe }: PaywallProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.container}>
            <View style={styles.overlay} />
            <LinearGradient
                colors={['#0F172A', '#020617']}
                style={styles.card}
            >
                <View style={styles.iconContainer}>
                     <Ionicons name="diamond" size={48} color={Colors.gold} />
                </View>
                
                <Text style={styles.title}>Trial Expired</Text>
                <Text style={styles.description}>
                    Your 7-day complimentary access has concluded. 
                    Upgrade to BudgetWise Premium to continue mastering your financial destiny.
                </Text>

                <View style={styles.features}>
                    <FeatureRow text="Unlimited AI Financial Advice" />
                    <FeatureRow text="Receipt Scanning & OCR" />
                    <FeatureRow text="Advanced Trend Analysis" />
                </View>

                <TouchableOpacity style={styles.button} onPress={onSubscribe}>
                    <LinearGradient
                        colors={[Colors.gold, Colors.goldDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Start Premium - $9.99/mo</Text>
                    </LinearGradient>
                </TouchableOpacity>

                 <TouchableOpacity style={{ marginTop: 16 }}>
                    <Text style={styles.restoreText}>Restore Purchase</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    </Modal>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
    <View style={styles.featureRow}>
        <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)' },
    card: {
        width: '90%',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.gold,
        shadowColor: Colors.gold,
        shadowOpacity: 0.3,
        shadowRadius: 20
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.gold
    },
    title: { fontSize: 24, fontWeight: 'bold', color: Colors.white, marginBottom: 12, letterSpacing: 1 },
    description: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    features: { width: '100%', marginBottom: 32, gap: 16 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featureText: { color: Colors.platinum, fontSize: 15 },
    button: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden' },
    buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: Colors.black, fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
    restoreText: { color: Colors.textMuted, fontSize: 13 }
});
