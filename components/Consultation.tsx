import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

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
  const [message, setMessage] = useState('');
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
    {
      id: '1',
      name: 'Sarah Johnson',
      specialty: 'Retirement Planning',
      rating: 4.9,
      experience: '15 years',
      image: '',
      available: true
    },
    {
      id: '2',
      name: 'Michael Chen',
      specialty: 'Investment Strategy',
      rating: 4.8,
      experience: '12 years',
      image: '',
      available: true
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      specialty: 'Tax Optimization',
      rating: 4.7,
      experience: '10 years',
      image: '',
      available: false
    }
  ];

  // Mock data for consultation slots
  const consultationSlots: ConsultationSlot[] = [
    {
      id: '1',
      date: '2023-12-20',
      time: '10:00 AM',
      duration: 30,
      price: 150
    },
    {
      id: '2',
      date: '2023-12-20',
      time: '2:00 PM',
      duration: 60,
      price: 250
    },
    {
      id: '3',
      date: '2023-12-21',
      time: '11:00 AM',
      duration: 45,
      price: 200
    }
  ];

  const handleBookConsultation = () => {
    if (!selectedExpert || !selectedSlot || !message.trim()) {
      Alert.alert('Error', 'Please select an expert, time slot, and enter a message');
      return;
    }

    Alert.alert(
      'Consultation Booked!',
      `Your consultation with ${selectedExpert.name} on ${selectedSlot.date} at ${selectedSlot.time} has been booked.`,
      [{ text: 'OK' }]
    );
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Simulate API call to Hubspot or booking system
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      topic: 'retirement',
      date: '',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderExperts = () => (
    <View>
      <Text style={styles.sectionTitle}>Financial Experts</Text>
      <Text style={styles.sectionSubtitle}>Connect with certified professionals</Text>
      
      {experts.map(expert => (
        <TouchableOpacity 
          key={expert.id}
          style={[styles.expertCard, selectedExpert?.id === expert.id && styles.selectedExpert]}
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
      ))}
    </View>
  );

  const renderSchedule = () => (
    <View>
      {submitted ? (
        <View style={styles.submittedContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={40} color="#10B981" />
          </View>
          <Text style={styles.submittedTitle}>Booking Confirmed!</Text>
          <Text style={styles.submittedText}>
            Thank you. An advisor will review your request and send a confirmation email to <Text style={styles.boldText}>{formData.email}</Text> shortly.
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetForm}
          >
            <Text style={styles.resetButtonText}>Book Another</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Expert Consultation</Text>
          <Text style={styles.sectionSubtitle}>First 30 minutes are complimentary for BudgetWise Premium members.</Text>
          
          <View style={styles.formCard}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter your full name"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Topic</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {}}
                >
                  <Text style={styles.pickerText}>
                    {formData.topic === 'retirement' && 'Retirement Planning'}
                    {formData.topic === 'investment' && 'Portfolio Review'}
                    {formData.topic === 'debt' && 'Debt Consolidation'}
                    {formData.topic === 'tax' && 'Tax Optimization'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Preferred Date</Text>
              <TextInput 
                style={styles.input}
                value={formData.date}
                onChangeText={(text) => setFormData({...formData, date: text})}
                placeholder="Select preferred date"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Specific Questions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({...formData, notes: text})}
                placeholder="What would you like to discuss with the advisor?"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Request Consultation</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  const renderHistory = () => (
    <View>
      <Text style={styles.sectionTitle}>Consultation History</Text>
      <Text style={styles.sectionSubtitle}>Your past and upcoming sessions</Text>
      
      <View style={styles.historyCard}>
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
            <Text style={styles.actionText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.historyDivider} />
        
        <View style={styles.historyItem}>
          <View style={styles.historyIcon}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>Completed Session</Text>
            <Text style={styles.historyExpert}>Michael Chen</Text>
            <Text style={styles.historyDateTime}>Dec 1, 2023 • 10:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.historyAction}>
            <Text style={styles.actionText}>View Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Expert Consultation</Text>
        <Text style={styles.subtitle}>Connect with certified financial advisors</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Browse</Text>
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
      
      {activeTab === 'browse' && renderExperts()}
      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'history' && renderHistory()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  tabText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  expertCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedExpert: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
  },
  expertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expertDetails: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  expertSpecialty: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  expertMeta: {
    flexDirection: 'row',
  },
  expertRating: {
    fontSize: 12,
    color: '#FBBF24',
    marginRight: 12,
  },
  expertExperience: {
    fontSize: 12,
    color: '#94A3B8',
  },
  expertStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusAvailable: {
    backgroundColor: Colors.success,
  },
  statusUnavailable: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  scheduleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotButton: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectedSlot: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
  },
  slotDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  slotDuration: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  slotPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  messageCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  historyExpert: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  historyDateTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyAction: {
    padding: 8,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  historyDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 8,
  },
  // New styles for form submission
  submittedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submittedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  submittedText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});