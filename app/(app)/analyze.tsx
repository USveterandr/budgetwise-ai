import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function Analyze() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI Analysis</Text>
      </View>
      <View style={styles.content}>
        <Ionicons name="analytics-outline" size={60} color={Colors.surfaceLight} />
        <Text style={styles.text}>Financial Analysis</Text>
        <Text style={styles.subtext}>Deep dive into your spending habits with AI-powered insights.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 20 },
  backButton: { padding: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  text: { color: 'white', fontSize: 18, marginTop: 20, textAlign: 'center', fontWeight: '600' },
  subtext: { color: Colors.textSecondary, textAlign: 'center', marginTop: 10 }
});
