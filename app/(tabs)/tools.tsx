import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';

export default function ToolsHub() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Tools</Text>
            <Text style={styles.subtitle}>Supercharge your productivity</Text>
          </View>

          <View style={styles.hubGrid}>
            <Card style={styles.hubCard}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                <Ionicons name="chatbubbles" size={32} color={Colors.primaryLight} />
              </View>
              <Text style={styles.hubTitle}>AI Advisor</Text>
              <Text style={styles.hubDesc}>Get personalized financial advice from our advanced AI.</Text>
              <Button 
                title="Chat Now" 
                onPress={() => router.push('/(tabs)/ai-advisor')} 
                variant="primary"
                icon="sparkles"
                style={styles.hubButton}
              />
            </Card>

            <Card style={styles.hubCard}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="receipt" size={32} color="#10B981" />
              </View>
              <Text style={styles.hubTitle}>Receipt Scanner</Text>
              <Text style={styles.hubDesc}>Instantly scan receipts and categorize expenses.</Text>
              <Button 
                title="Scan Receipt" 
                onPress={() => router.push('/(tabs)/receipts')} 
                variant="dark"
                icon="camera"
                style={styles.hubButton}
              />
            </Card>

            <Card style={styles.hubCard}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="people" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.hubTitle}>Consultation</Text>
              <Text style={styles.hubDesc}>Book a private session with a financial expert.</Text>
              <Button 
                title="Book Session" 
                onPress={() => router.push('/(tabs)/consultation')} 
                variant="dark"
                icon="calendar"
                style={styles.hubButton}
              />
            </Card>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
  },
  hubGrid: {
    gap: 16,
  },
  hubCard: {
    padding: 24,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hubTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  hubDesc: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 20,
  },
  hubButton: {
    width: '100%',
  },
});
