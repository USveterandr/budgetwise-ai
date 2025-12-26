import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { LinearGradient } from 'expo-linear-gradient';

interface Expert {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  image: string;
  available: boolean;
}

interface ConsultationSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  price: number;
}

export function Consultation() {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlot | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'schedule' | 'history'>('browse');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'retirement',
    date: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Mock data for experts
  const experts: Expert[] = [
    { id: '1', name: 'Sarah Johnson', specialty: 'Retirement Planning', rating: 4.9, experience: '15 years', image: '', available: true },
    { id: '2', name: 'Michael Chen', specialty: 'Investment Strategy', rating: 4.8, experience: '12 years', image: '', available: true },
    { id: '3', name: 'Emily Rodriguez', specialty: 'Tax Optimization', rating: 4.7, experience: '10 years', image: '', available: false }
  ];

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', topic: 'retirement', date: '', notes: '' });
  };

  const renderExperts = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Financial Experts</Text>
      {experts.map(expert => (
        <Card 
          key={expert.id}
          style={[styles.expertCard, selectedExpert?.id === expert.id && styles.selectedExpert]}
        >
          <TouchableOpacity 
            style={styles.expertTouchable}
            onPress={() => setSelectedExpert(expert)}
          >
            <View style={styles.expertInfo}>
              <View style={styles.expertAvatar}>
                <Ionicons name="person" size={24} color="#FFF" />
              </View>
              <View style={styles.expertDetails}>
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertSpecialty}>{expert.specialty}</Text>
                <View style={styles.expertMeta}>
                  <Text style={styles.expertRating}>★ {expert.rating}</Text>
                  <Text style={styles.expertExperience}>{expert.experience} exp</Text>
                </View>
              </View>
            </View>
            <View style={styles.expertStatus}>
              <View style={[styles.statusIndicator, expert.available ? styles.statusAvailable : styles.statusUnavailable]} />
              <Text style={styles.statusText}>{expert.available ? 'Available' : 'Busy'}</Text>
            </View>
          </TouchableOpacity>
        </Card>
      ))}
      {selectedExpert && (
        <Button 
          title={`Schedule with ${selectedExpert.name.split(' ')[0]}`}
          onPress={() => setActiveTab('schedule')}
          style={{ marginTop: 24 }}
        />
      )}
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.tabContent}>
      {submitted ? (
        <Card style={styles.submittedCard}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={40} color="#10B981" />
          </View>
          <Text style={styles.submittedTitle}>Booking Confirmed!</Text>
          <Text style={styles.submittedText}>
            Thank you. An advisor will review your request and send a confirmation email to <Text style={styles.boldText}>{formData.email}</Text> shortly.
          </Text>
          <Button title="Book Another" onPress={handleResetForm} variant="secondary" />
        </Card>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Expert Consultation</Text>
          <Text style={styles.sectionSubtitle}>First 30 minutes are complimentary for BudgetWise Professional members.</Text>
          
          <Card style={styles.formCard}>
            <View style={styles.formField}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter your full name"
                placeholderTextColor="#64748B"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Enter your email"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Consultation Topic</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity style={styles.pickerButton}>
                  <Text style={styles.pickerText}>
                    {formData.topic === 'retirement' ? 'Retirement Planning' : 'Portfolio Review'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Preferred Date</Text>
              <TextInput 
                style={styles.input}
                value={formData.date}
                onChangeText={(text) => setFormData({...formData, date: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748B"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                placeholder="Tell us more about your goals..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <Button 
              title="Request Consultation"
              onPress={() => setSubmitted(true)}
              style={{ marginTop: 12 }}
            />
          </Card>
        </>
      )}
    </View>
  );

  const renderHistory = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Session History</Text>
      <Card style={styles.historyCard}>
        <View style={styles.historyItem}>
          <View style={styles.historyIcon}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>Upcoming Session</Text>
            <Text style={styles.historyExpert}>Sarah Johnson</Text>
            <Text style={styles.historyDateTime}>Dec 15, 2023 • 2:00 PM</Text>
          </View>
          <TouchableOpacity style={styles.historyAction}>
            <Text style={styles.actionText}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.historyDivider} />
        <View style={styles.historyItem}>
          <View style={styles.historyIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>Completed Session</Text>
            <Text style={styles.historyExpert}>Michael Chen</Text>
            <Text style={styles.historyDateTime}>Dec 1, 2023 • 10:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.historyAction}>
            <Text style={styles.actionText}>Notes</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#13112B', '#0F172A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Consultation</Text>
          <Text style={styles.subtitle}>Connect with certified financial advisors</Text>
        </View>
        
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
              onPress={() => setActiveTab('browse')}
            >
              <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Experts</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
              onPress={() => setActiveTab('schedule')}
            >
              <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'browse' && renderExperts()}
          {activeTab === 'schedule' && renderSchedule()}
          {activeTab === 'history' && renderHistory()}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
  tabsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  activeTabText: { color: '#FFF' },
  content: { flex: 1 },
  tabContent: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#64748B', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1.5 },
  sectionSubtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 20, lineHeight: 20 },
  expertCard: { marginBottom: 12, padding: 0, overflow: 'hidden' },
  expertTouchable: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  selectedExpert: { borderColor: Colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.05)' },
  expertInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  expertAvatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  expertDetails: { flex: 1 },
  expertName: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  expertSpecialty: { fontSize: 13, color: '#94A3B8', marginBottom: 6 },
  expertMeta: { flexDirection: 'row', gap: 12 },
  expertRating: { fontSize: 12, color: '#FBBF24', fontWeight: '700' },
  expertExperience: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  expertStatus: { alignItems: 'flex-end', marginLeft: 12 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  statusAvailable: { backgroundColor: '#10B981' },
  statusUnavailable: { backgroundColor: '#EF4444' },
  statusText: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  formCard: { padding: 24, marginBottom: 20 },
  formField: { marginBottom: 20 },
  label: { fontSize: 13, color: '#94A3B8', marginBottom: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, padding: 14, color: '#FFF', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerContainer: { borderRadius: 12, overflow: 'hidden' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  pickerText: { fontSize: 15, color: '#F8FAFC' },
  submittedCard: { padding: 40, alignItems: 'center' },
  checkmarkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  submittedTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', marginBottom: 12 },
  submittedText: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  boldText: { fontWeight: '800', color: '#F8FAFC' },
  historyCard: { padding: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  historyIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  historyDetails: { flex: 1 },
  historyTitle: { fontSize: 15, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  historyExpert: { fontSize: 13, color: '#94A3B8', marginBottom: 2 },
  historyDateTime: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  historyAction: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  actionText: { color: Colors.primaryLight, fontSize: 13, fontWeight: '700' },
  historyDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: 12 },
});