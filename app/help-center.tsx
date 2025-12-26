import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const FAQ_ITEMS = [
  {
    question: 'How do I track my expenses?',
    answer: 'You can add expenses manually in the Transactions tab or use our AI receipt scanner to automatically capture details from your receipts.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption and Cloudflare security to ensure your financial data is always safe and private.'
  },
  {
    question: 'Can I connect my bank account?',
    answer: 'We are working on direct bank integrations. For now, you can import transaction history via CSV or use the scanner.'
  },
  {
    question: 'How does the AI Advisor work?',
    answer: 'The AI Advisor analyzes your spending habits and budget goals to provide personalized recommendations for saving more money.'
  }
];

export default function HelpCenterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Help Center', headerTransparent: true, headerTintColor: '#FFF' }} />
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>How can we help?</Text>
            <Text style={styles.subtitle}>Find answers to common questions or reach out to our team.</Text>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#94A3B8" />
            <Text style={styles.searchPlaceholder}>Search for help...</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {FAQ_ITEMS.map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            ))}
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => router.push('/contact-support')}
            >
              <LinearGradient
                colors={[Colors.primary, '#6366F1']}
                style={styles.gradientButton}
              >
                <Ionicons name="mail" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Contact Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchPlaceholder: {
    color: '#94A3B8',
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  answer: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  contactSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  contactButton: {
    width: '100%',
    maxWidth: 300,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
