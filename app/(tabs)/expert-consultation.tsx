import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ConsultationRequest {
  id: string;
  userId: string;
  topic: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

export default function ConsultationScreen() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([
    // Mock data for demonstration
    {
      id: '1',
      userId: user?.id || '',
      topic: 'Retirement Planning',
      message: 'I want to plan for my retirement. I am 35 years old and have $50,000 saved.',
      status: 'completed',
      createdAt: '2023-06-15T10:30:00Z',
      response: 'Based on your age and savings, I recommend contributing 15% of your income to retirement accounts...',
      respondedAt: '2023-06-16T14:20:00Z'
    },
    {
      id: '2',
      userId: user?.id || '',
      topic: 'Debt Management',
      message: 'I have credit card debt of $8,000 with 22% interest. How should I approach paying this off?',
      status: 'in_progress',
      createdAt: '2023-06-20T09:15:00Z'
    }
  ]);

  const handleSubmitRequest = async () => {
    if (!topic.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both topic and message fields');
      return;
    }

    setLoading(true);
    
    // In a real app, this would be an API call to submit the consultation request
    const newConsultation: ConsultationRequest = {
      id: `req_${Date.now()}`,
      userId: user?.id || '',
      topic,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setConsultations(prev => [newConsultation, ...prev]);
    setTopic('');
    setMessage('');
    setLoading(false);
    
    Alert.alert(
      'Request Submitted',
      'Your financial consultation request has been submitted. A financial advisor will review your request and respond within 24-48 hours.',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E1B4B', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Financial Consultation</Text>
            <Text style={styles.subtitle}>Connect with our financial experts for personalized advice</Text>
          </View>

          <Card style={styles.requestCard}>
            <Text style={styles.sectionTitle}>Submit a Consultation Request</Text>
            <Input 
              label="Topic" 
              placeholder="e.g., Retirement Planning, Debt Management, Investment Strategy" 
              value={topic}
              onChangeText={setTopic}
              variant="dark"
            />
            <Input 
              label="Message" 
              placeholder="Describe your financial situation and what advice you're seeking..." 
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              variant="dark"
              style={styles.messageInput}
            />
            <Button 
              title="Submit Request" 
              onPress={handleSubmitRequest} 
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Consultation Requests</Text>
            {consultations.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>You haven't submitted any consultation requests yet.</Text>
              </Card>
            ) : (
              consultations.map((consultation) => (
                <Card key={consultation.id} style={styles.consultationCard}>
                  <View style={styles.consultationHeader}>
                    <Text style={styles.consultationTopic}>{consultation.topic}</Text>
                    <View style={[
                      styles.statusBadge, 
                      consultation.status === 'completed' ? styles.completedStatus :
                      consultation.status === 'in_progress' ? styles.inProgressStatus :
                      styles.pendingStatus
                    ]}>
                      <Text style={styles.statusText}>
                        {consultation.status === 'completed' ? 'Completed' :
                         consultation.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.consultationMessage}>{consultation.message}</Text>
                  <Text style={styles.consultationDate}>Submitted: {formatDate(consultation.createdAt)}</Text>
                  
                  {consultation.response && (
                    <View style={styles.responseSection}>
                      <Text style={styles.responseLabel}>Advisor Response:</Text>
                      <Text style={styles.consultationResponse}>{consultation.response}</Text>
                      <Text style={styles.consultationDate}>Responded: {formatDate(consultation.respondedAt || '')}</Text>
                    </View>
                  )}
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  requestCard: {
    marginBottom: 20,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 16,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  consultationCard: {
    marginBottom: 16,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultationTopic: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingStatus: {
    backgroundColor: '#FEF3C7',
  },
  inProgressStatus: {
    backgroundColor: '#DBEAFE',
  },
  completedStatus: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  consultationMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  consultationDate: {
    color: Colors.textSecondary, // Changed from textTertiary to textSecondary
    fontSize: 12,
    marginBottom: 4,
  },
  responseSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  consultationResponse: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});