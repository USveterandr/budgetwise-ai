import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';

export default function StrategyScreen() {
  const router = useRouter();

  const hubs = [
    {
      title: 'Finance Hub',
      description: 'Transactions & Budgets',
      icon: 'wallet' as const,
      color: Colors.primary,
      path: '/(tabs)/finance' as any,
    },
    {
      title: 'Growth Hub',
      description: 'Investments & Portfolio',
      icon: 'trending-up' as const,
      color: Colors.secondary,
      path: '/(tabs)/growth' as any,
    },
    {
      title: 'AI Lab',
      description: 'Strategic Insights',
      icon: 'sparkles' as const,
      color: '#EC4899',
      path: '/(tabs)/ai-advisor' as any,
    },
    {
      title: 'Tools & Assets',
      description: 'Scanners & Reports',
      icon: 'hammer' as const,
      color: '#F59E0B',
      path: '/(tabs)/tools' as any,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, '#1E1B4B', Colors.background]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Strategy</Text>
            <Text style={styles.subtitle}>Execute your long-term vision</Text>
          </View>

          <View style={styles.grid}>
            {hubs.map((hub) => (
              <TouchableOpacity
                key={hub.title}
                style={styles.gridItem}
                onPress={() => router.push(hub.path)}
              >
                <Card style={styles.hubCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.iconContainer, { backgroundColor: `${hub.color}20` }]}>
                    <Ionicons name={hub.icon} size={32} color={hub.color} />
                  </View>
                  <Text style={styles.hubTitle}>{hub.title}</Text>
                  <Text style={styles.hubDescription}>{hub.description}</Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={20} 
                    color="rgba(255, 255, 255, 0.3)" 
                    style={styles.arrow} 
                  />
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.pulseCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(6, 182, 212, 0.1)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.pulseHeader}>
              <Ionicons name="pulse" size={24} color={Colors.primary} />
              <Text style={styles.pulseTitle}>Market Pulse</Text>
            </View>
            <Text style={styles.pulseText}>
              Your strategy is currently 85% optimized. Consider rebalancing your AI Lab insights for maximum growth.
            </Text>
          </Card>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 34, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridItem: { width: '47.5%', height: 180 },
  hubCard: { flex: 1, padding: 20, justifyContent: 'center', overflow: 'hidden', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  iconContainer: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  hubTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  hubDescription: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  arrow: { position: 'absolute', bottom: 20, right: 20 },
  pulseCard: { marginTop: 24, padding: 24, borderRadius: 24, overflow: 'hidden' },
  pulseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  pulseTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  pulseText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
