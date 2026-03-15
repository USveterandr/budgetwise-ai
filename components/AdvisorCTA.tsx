import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { cloudflare } from '../app/lib/cloudflare';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export function AdvisorCTA() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const book = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = await cloudflare.bookAdvisor(token);
      if (data.bookingUrl) {
        await Linking.openURL(data.bookingUrl);
      } else {
        Alert.alert('Error', 'Could not get booking URL');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={24} color={Colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Talk to a Real Advisor
            </Text>
            <Text style={styles.subtitle}>
              Free 30-min consultation.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={book}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Book Free Call</Text>
          )}
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24, 
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
