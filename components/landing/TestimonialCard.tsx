import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export function TestimonialCard({ name, role, content, rating }: TestimonialCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {[...Array(5)].map((_, i) => (
          <Ionicons 
            key={i} 
            name={i < rating ? 'star' : 'star-outline'} 
            size={16} 
            color="#F59E0B" 
          />
        ))}
      </View>
      <Text style={styles.content}>"{content}"</Text>
      <View style={styles.author}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  role: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
