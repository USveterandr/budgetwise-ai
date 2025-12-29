import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Redirect } from 'expo-router';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import { Button } from '../components/ui/Button';
import { FeatureCard } from '../components/landing/FeatureCard';
import { TestimonialCard } from '../components/landing/TestimonialCard';
import { useAuth } from '../AuthContext';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/6931d42fc95edfeb0aaaa606_1764873445881_ef508941.webp';

export default function LandingPage() {
  const { currentUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 59, seconds: 59 });

  if (currentUser) {
    // If the user is already authenticated, redirect them to the dashboard.
    return <Redirect href="/dashboard" />;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 11, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: 'analytics' as const, title: 'AI-Powered Insights', description: 'Get personalized financial advice powered by advanced AI.' },
    { icon: 'wallet' as const, title: 'Smart Budgeting', description: 'Automatically categorize expenses and track spending.' },
    { icon: 'trending-up' as const, title: 'Investment Tracking', description: 'Monitor your portfolio performance in real-time.' },
    { icon: 'receipt' as const, title: 'Receipt Scanner', description: 'Scan receipts with OCR for automatic entry.' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Small Business Owner', content: 'BudgetWise helped me save 40% more each month!', rating: 5 },
    { name: 'James K.', role: 'Software Engineer', content: 'The AI insights are incredibly accurate and helpful.', rating: 5 },
  ];

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logo}><Ionicons name="wallet" size={28} color={Colors.primary} /><Text style={styles.logoText}>BudgetWise AI</Text></View>
          <TouchableOpacity onPress={() => router.push('/login')} style={styles.loginBtn}><Text style={styles.loginText}>Sign In</Text></TouchableOpacity>
        </View>

        <View style={styles.badge}><Ionicons name="flame" size={14} color="#FFF" /><Text style={styles.badgeText}>LIMITED: 50% OFF</Text></View>
        <View style={styles.timer}><Ionicons name="time" size={14} color={Colors.primaryLight} /><Text style={styles.timerText}>Ends in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</Text></View>

        <Text style={styles.title}>Transform Your{'\n'}Financial Future</Text>
        <Text style={styles.subtitle}>Join 50,000+ users who've unlocked their wealth potential with AI-powered finance management.</Text>

        <View style={styles.ctas}>
          <Button title="Create Account" onPress={() => router.push('/signup')} size="large" />
          <Button title="Learn More" onPress={() => router.push('/learn-more')} variant="outline" size="large" style={{ marginTop: 12 }} />
        </View>

        <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} contentFit="contain" />

        <Text style={styles.sectionTitle}>Why Choose BudgetWise?</Text>
        {features.map((f, i) => <FeatureCard key={i} {...f} />)}

        <Text style={styles.sectionTitle}>What Our Users Say</Text>
        {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}

        <View style={styles.stats}>
          {[{ num: '50K+', label: 'Users' }, { num: '42%', label: 'Avg Savings' }, { num: '4.9', label: 'Rating' }].map((s, i) => (
            <View key={i} style={styles.statItem}><Text style={styles.statNum}>{s.num}</Text><Text style={styles.statLabel}>{s.label}</Text></View>
          ))}
        </View>

        <View style={styles.footer}><Text style={styles.footerText}>© 2025 BudgetWise AI. All rights reserved.</Text></View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  logo: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: Colors.text, marginLeft: 8 },
  loginBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  loginText: { color: Colors.text, fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'center', marginBottom: 12 },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 12, marginLeft: 6 },
  timer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerText: { color: Colors.primaryLight, fontSize: 13, marginLeft: 6 },
  title: { fontSize: 36, fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 44, marginBottom: 16 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 10 },
  ctas: { marginBottom: 40 },
  heroImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 40, resizeMode: 'contain' },
  sectionTitle: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 20 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, marginBottom: 40 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { color: Colors.textMuted, fontSize: 12 },
});
