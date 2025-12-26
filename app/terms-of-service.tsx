import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Terms of Service', headerTransparent: true, headerTintColor: '#FFF' }} />
      <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.lastUpdated}>Last Updated: December 26, 2025</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
            <Text style={styles.text}>
              By accessing or using Budgetwise AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </Text>

            <Text style={styles.sectionTitle}>2. Use of License</Text>
            <Text style={styles.text}>
              Permission is granted to temporarily download one copy of the materials on Budgetwise AI's website for personal, non-commercial transitory viewing only.
            </Text>

            <Text style={styles.sectionTitle}>3. Privacy & Data</Text>
            <Text style={styles.text}>
              Your privacy is important to us. We use Cloudflare and industry-standard security measures to protect your financial information. Please review our Privacy Policy for more details on how we handle your data.
            </Text>

            <Text style={styles.sectionTitle}>4. Disclaimer</Text>
            <Text style={styles.text}>
              The materials on Budgetwise AI's app are provided on an 'as is' basis. Budgetwise AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </Text>

            <Text style={styles.sectionTitle}>5. Limitations</Text>
            <Text style={styles.text}>
              In no event shall Budgetwise AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the app.
            </Text>

            <Text style={styles.sectionTitle}>6. Governing Law</Text>
            <Text style={styles.text}>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </Text>
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
  lastUpdated: {
    fontSize: 14,
    color: '#94A3B8',
  },
  content: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 24,
  },
});
